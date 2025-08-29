"use client";
/**
 * PixelBackground — Mist Mint (no neon), two WOW effects:
 * 1) Kinetic Product Grid (Home/About/Blog): nastri di card → si aggregano in "ShopIQ"
 * 2) Blueprint Conveyor (Services/Contact): linea di produzione wireframe → scatole compongono "ShopIQ"
 *
 * Principi:
 * - Palette chiarissima (Mist Mint)
 * - Safe-zone a sinistra per icone/label, sempre molto chiara
 * - Morph totale ~2.8s; poi micro-vita ≤2%
 * - Reduce Motion → frame finale con fade breve
 *
 * Nessuna dipendenza esterna; solo Canvas2D.
 */

import { useEffect, useMemo, useRef } from "react";
import { useUI } from "@/lib/store/ui";

type SceneKey = "home" | "services" | "about" | "blog" | "contact";
type Mode = "grid" | "conveyor";

export function PixelBackground({ duration = 2800 }: { duration?: number }) {
  const section = useUI((s) => s.section);
  const reduce = useUI((s) => s.reduceMotion);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const rafRef = useRef<number | null>(null);

  // mask cache per il wordmark (ShopIQ + payoff)
  const maskRef = useRef<{ cols: number; rows: number; alpha: Float32Array } | null>(null);

  // elementi per il GRID (card) e CONVEYOR (scatole)
  const gridTilesRef = useRef<GridTile[]>([]);
  const conveyorRef = useRef<ConveyorState | null>(null);

  const PALETTE = useMemo(
    () => ({
      // Mist Mint chiaro
      bg: ["#F7FFFB", "#EEFFF7", "#E3FFF2", "#D7F7EC", "#C8ECDF", "#B9DFD3"],
      ink: "#0F2A24",
    }),
    []
  );

  const mode: Mode = useMemo(() => {
    if (section === "services" || section === "contact") return "conveyor";
    return "grid";
  }, [section]);

  // Resize + init
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current!;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w;
      c.height = h;
      size.current = { w, h };
      // invalida le strutture dipendenti da dimensioni
      maskRef.current = null;
      gridTilesRef.current = [];
      conveyorRef.current = null;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Render loop
  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    let start = performance.now();
    if (reduce) start = performance.now() - duration; // salta al finale

    const tick = () => {
      const now = performance.now();
      const t = Math.min(1, (now - start) / duration); // progress 0..1

      // background uniforme molto chiaro + safe-zone
      drawBackground(ctx, size.current, PALETTE);
      drawSafeZone(ctx, size.current);

      // prepara (se non c'è) la mask del wordmark
      const mask = ensureTextMask(maskRef, size.current, SCENES[section]);

      if (mode === "grid") {
        // 0.00–0.40 nastri; 0.40–1.60 swarm→wordmark; 1.60–2.80 lock
        drawKineticProductGrid(ctx, size.current, PALETTE, t, gridTilesRef, mask);
      } else {
        // 0.00–0.80 plotter; 0.80–1.60 pick-pack-ship; 1.60–2.80 assemble→wordmark
        drawBlueprintConveyor(ctx, size.current, PALETTE, t, conveyorRef, mask, section);
      }

      // micro-vita post-lock (≤2%), attenuata in safe-zone
      if (t >= 1) drawBreathing(ctx, size.current);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    tick();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [mode, section, duration, reduce, PALETTE]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden />;
}

/* ──────────────────────────────────────────────────────────────────────────────
 * SCENE PRESETS (posizioni/scale per testo)
 * ────────────────────────────────────────────────────────────────────────────── */

const SCENES: Record<
  SceneKey,
  {
    title: string;
    subtitle: string;
    titlePos: [number, number]; // u,v 0..1
    subPos: [number, number]; // u,v 0..1
    titleSize: number; // relativo a altezza (0..1)
    subSize: number; // relativo a altezza (0..1)
    align: CanvasTextAlign;
  }
> = {
  home: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titlePos: [0.56, 0.50],
    subPos: [0.56, 0.64],
    titleSize: 0.20,
    subSize: 0.074,
    align: "center",
  },
  services: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titlePos: [0.62, 0.60],
    subPos: [0.62, 0.74],
    titleSize: 0.18,
    subSize: 0.07,
    align: "center",
  },
  about: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titlePos: [0.78, 0.36],
    subPos: [0.78, 0.50],
    titleSize: 0.16,
    subSize: 0.065,
    align: "right",
  },
  blog: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titlePos: [0.52, 0.30],
    subPos: [0.52, 0.44],
    titleSize: 0.14,
    subSize: 0.06,
    align: "center",
  },
  contact: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titlePos: [0.56, 0.68],
    subPos: [0.56, 0.82],
    titleSize: 0.18,
    subSize: 0.07,
    align: "center",
  },
};

/* ──────────────────────────────────────────────────────────────────────────────
 * BACKGROUND & SAFE-ZONE
 * ────────────────────────────────────────────────────────────────────────────── */

function drawBackground(
  ctx: CanvasRenderingContext2D,
  { w, h }: { w: number; h: number },
  P: { bg: string[]; ink: string }
) {
  // gradient verticale chiarissimo (Mist Mint)
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, P.bg[0]);
  g.addColorStop(1, P.bg[2]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // pattern diagonale appena percettibile
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = P.bg[3];
  const step = 24;
  for (let x = -h; x < w + h; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.lineTo(x + h - 2, h);
    ctx.lineTo(x - 2, 0);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawSafeZone(ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) {
  const safe = Math.max(200, Math.min(320, Math.round(w * 0.18))); // ~240 px tipico
  const g = ctx.createLinearGradient(0, 0, safe, 0);
  g.addColorStop(0, "#FFFFFF");
  g.addColorStop(1, "#F7FFFB");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, safe, h);

  // separatore sottilissimo
  ctx.fillStyle = "rgba(15,42,36,0.06)";
  ctx.fillRect(safe, 0, 1, h);
}

/* ──────────────────────────────────────────────────────────────────────────────
 * TEXT MASK (ShopIQ + payoff) — rasterizzata in alpha 0..1
 * ────────────────────────────────────────────────────────────────────────────── */

function ensureTextMask(
  maskRef: React.MutableRefObject<{ cols: number; rows: number; alpha: Float32Array } | null>,
  size: { w: number; h: number },
  s: {
    title: string;
    subtitle: string;
    titlePos: [number, number];
    subPos: [number, number];
    titleSize: number;
    subSize: number;
    align: CanvasTextAlign;
  }
) {
  const targetCols = Math.floor(size.w / 8); // risoluzione maschera (bassa per velocità)
  const targetRows = Math.floor(size.h / 8);
  const key = maskRef.current;

  if (key && key.cols === targetCols && key.rows === targetRows) return key;

  const can = document.createElement("canvas");
  can.width = targetCols;
  can.height = targetRows;
  const ctx = can.getContext("2d")!;
  ctx.clearRect(0, 0, targetCols, targetRows);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "middle";
  ctx.textAlign = s.align;

  const titlePx = Math.max(8, Math.floor(targetRows * s.titleSize));
  const subPx = Math.max(7, Math.floor(targetRows * s.subSize));

  // Ombra/riempimento leggero per separazione
  ctx.font = `${titlePx}px "Press Start 2P", ui-monospace, monospace`;
  drawMaskText(ctx, s.title, s.titlePos, targetCols, targetRows);

  ctx.font = `${subPx}px "Press Start 2P", ui-monospace, monospace`;
  drawMaskText(ctx, s.subtitle, s.subPos, targetCols, targetRows);

  const data = ctx.getImageData(0, 0, targetCols, targetRows).data;
  const alpha = new Float32Array(targetCols * targetRows);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) alpha[p] = data[i] > 0 ? 1 : 0;

  const out = { cols: targetCols, rows: targetRows, alpha };
  maskRef.current = out;
  return out;
}

function drawMaskText(
  ctx: CanvasRenderingContext2D,
  text: string,
  uv: [number, number],
  cols: number,
  rows: number
) {
  const x = uv[0] * cols;
  const y = uv[1] * rows;
  ctx.save();
  ctx.globalAlpha = 0.95;
  ctx.fillText(text, x + 0.6, y + 0.6);
  ctx.restore();
  ctx.fillText(text, x, y);
}

/* ──────────────────────────────────────────────────────────────────────────────
 * 1) KINETIC PRODUCT GRID
 * ────────────────────────────────────────────────────────────────────────────── */

type GridTile = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number; // radius
  lane: number;
  speed: number;
  // swarm target (per composizione wordmark)
  tx: number;
  ty: number;
  phaseOffset: number;
  pinned: boolean;
};

function drawKineticProductGrid(
  ctx: CanvasRenderingContext2D,
  { w, h }: { w: number; h: number },
  P: { bg: string[]; ink: string },
  t: number,
  tilesRef: React.MutableRefObject<GridTile[]>,
  mask: { cols: number; rows: number; alpha: Float32Array }
) {
  const safe = Math.max(200, Math.min(320, Math.round(w * 0.18)));
  const lanes = Math.max(3, Math.min(5, Math.floor(h / 220)));
  const cardH = Math.max(54, Math.min(84, Math.floor(h / (lanes * 1.8))));
  const cardW = Math.round(cardH * 1.6);
  const radius = 10;

  // inizializza card se vuote
  if (tilesRef.current.length === 0) {
    const countPerLane = Math.ceil((w / cardW) * 2.2);
    const arr: GridTile[] = [];
    for (let lane = 0; lane < lanes; lane++) {
      for (let i = 0; i < countPerLane; i++) {
        const y = Math.round((h * (lane + 0.5)) / lanes - cardH / 2);
        const x = safe + i * (cardW + 28) + Math.random() * 60;
        const speed = 0.25 + Math.random() * 0.3;
        arr.push({
          x,
          y,
          w: cardW,
          h: cardH,
          r: radius,
          lane,
          speed,
          tx: x,
          ty: y,
          phaseOffset: Math.random(),
          pinned: false,
        });
      }
    }
    // prepara target dalla mask: campiona punti e assegna a subset di card
    const sample = sampleMaskPoints(mask, Math.floor((w * h) / 22000)); // densità punti
    const cx = safe + (w - safe) * 0.55;
    const cy = h * 0.55;
    for (let i = 0; i < arr.length && i < sample.length; i++) {
      const p = arr[i];
      const [mx, my] = sample[i];
      p.tx = Math.round(mx * (w / mask.cols));
      p.ty = Math.round(my * (h / mask.rows));
      // centro verso wordmark (per evitare offset troppo a sx)
      p.tx = Math.round(cx + (p.tx - cx) * 0.9);
      p.ty = Math.round(cy + (p.ty - cy) * 0.9);
    }
    tilesRef.current = arr;
  }

  // fasi
  const f_nastro = clamp01(t / 0.4);
  const f_swarm = clamp01((t - 0.4) / 1.2);
  const f_lock = clamp01((t - 1.6) / 1.2);

  // 1) nastri in loop (scorrimento orizzontale)
  for (const c of tilesRef.current) {
    if (f_swarm < 0.001) {
      const loopW = w + cardW * 2;
      c.x = safe + ((c.x + c.speed * 4 + (performance.now() / 16) * c.speed) % loopW) - cardW;
    }
  }

  // 2) swarm: le card scorrono verso i target e “si agganciano”
  for (const c of tilesRef.current) {
    if (f_swarm > 0) {
      const e = easeOutCubic(Math.pow(f_swarm, 0.9));
      c.x = lerp(c.x, c.tx - c.w / 2, e);
      c.y = lerp(c.y, c.ty - c.h / 2, e);
    }
  }

  // 3) rendering
  for (const c of tilesRef.current) {
    const shadow = 6 * (1 - f_lock);
    drawCard(ctx, c.x, c.y, c.w, c.h, c.r, {
      fill: "#FFFFFF",
      stroke: "rgba(15,42,36,0.06)",
      shadow: shadow > 0 ? `0 ${shadow}px ${shadow * 2}px rgba(15,42,36,0.06)` : "",
    });

    // disegni interni (metadati fittizi) solo dopo lo swarm
    if (f_swarm > 0.6) {
      ctx.save();
      ctx.translate(c.x + 12, c.y + 12);
      ctx.fillStyle = "rgba(15,42,36,0.12)";
      ctx.fillRect(0, 0, c.w * 0.4, 10); // titolo
      ctx.fillRect(0, 18, c.w * 0.28, 8); // riga
      ctx.fillRect(0, c.h - 20, c.w * 0.22, 10); // CTA
      ctx.restore();
    }
  }

  // 4) payoff: sottili righe sotto il wordmark
  if (f_lock > 0.1) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (f_lock - 0.1) / 0.3);
    const cx = safe + (w - safe) * 0.55;
    const cy = h * 0.7;
    ctx.fillStyle = "rgba(15,42,36,0.10)";
    for (let i = 0; i < 3; i++) {
      const ww = Math.min(520, (w - safe) * 0.62) * (1 - i * 0.12);
      ctx.fillRect(cx - ww / 2, cy + i * 12, ww, 8);
    }
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * 2) BLUEPRINT CONVEYOR
 * ────────────────────────────────────────────────────────────────────────────── */

type ConveyorState = {
  belts: { path: [number, number][]; width: number }[];
  boxes: { x: number; y: number; w: number; h: number; t0: number; t1: number }[];
  targets: Array<[number, number]>;
};

function drawBlueprintConveyor(
  ctx: CanvasRenderingContext2D,
  { w, h }: { w: number; h: number },
  P: { bg: string[]; ink: string },
  t: number,
  stateRef: React.MutableRefObject<ConveyorState | null>,
  mask: { cols: number; rows: number; alpha: Float32Array },
  section: SceneKey
) {
  const safe = Math.max(200, Math.min(320, Math.round(w * 0.18)));

  if (!stateRef.current) {
    // belt paths (3 linee a serpentina)
    const belts = [
      { path: polyline([safe + 140, h * 0.28, w - 120, h * 0.28, w - 120, h * 0.40, safe + 180, h * 0.40]), width: 16 },
      { path: polyline([safe + 160, h * 0.48, w - 160, h * 0.48, w - 160, h * 0.60, safe + 200, h * 0.60]), width: 16 },
      { path: polyline([safe + 220, h * 0.68, w - 180, h * 0.68, w - 180, h * 0.72, safe + 240, h * 0.72]), width: 16 },
    ];

    // box che scorrono (verranno poi “catturati” dal wordmark)
    const boxes: ConveyorState["boxes"] = [];
    const lanes = 3;
    const count = 18;
    const now = performance.now();
    for (let lane = 0; lane < lanes; lane++) {
      for (let i = 0; i < count; i++) {
        const t0 = now + (i * 120 + lane * 240);
        const t1 = t0 + 2400;
        boxes.push({
          x: 0,
          y: 0,
          w: 64,
          h: 42,
          t0,
          t1,
        });
      }
    }

    // target dal wordmask (punti campionati)
    const targets: [number, number][] = sampleMaskPoints(
  mask,
  Math.floor((w * h) / 24000)
).map(([mx, my]): [number, number] => [
  Math.round(mx * (w / mask.cols)),
  Math.round(my * (h / mask.rows)),
]);


    stateRef.current = { belts, boxes, targets };
  }

  const S = stateRef.current!;

  // Fasi: 0–0.8 plotter (disegna linee), 0.8–1.6 boxes, 1.6–1 lock + assemble
  const f_plot = clamp01(t / 0.8);
  const f_move = clamp01((t - 0.8) / 0.8);
  const f_lock = clamp01((t - 1.6) / 1.2);

  // 1) disegno belt wireframe (plotter)
  ctx.save();
  ctx.strokeStyle = "rgba(15,42,36,0.35)";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  for (const b of S.belts) {
    strokePathProgress(ctx, b.path, f_plot);
  }
  ctx.setLineDash([]);
  ctx.restore();

  // 2) scatole che scorrono
  const pathLens = S.belts.map((b) => pathLength(b.path));
  for (let i = 0; i < S.boxes.length; i++) {
    const box = S.boxes[i];
    const lane = i % S.belts.length;
    const path = S.belts[lane].path;
    const L = pathLens[lane];

    // progresso individuale lungo il path
    const now = performance.now();
    let pt = clamp01((now - box.t0) / (box.t1 - box.t0)) * (0.6 + f_move * 0.4); // accelera con f_move
    // prima della fase lock, seguono il path
    let { x, y, angle } = pointAt(path, L * pt);

    // durante il lock, una parte delle scatole converge verso il wordmark
    if (f_lock > 0.05 && i < S.targets.length) {
      const e = easeOutCubic(Math.pow(f_lock, 0.9));
      const [tx, ty] = S.targets[i];
      x = lerp(x, tx, e);
      y = lerp(y, ty, e);
      angle = lerp(angle, 0, e);
    }

    drawBox(ctx, x, y, box.w, box.h, angle);
  }

  // 3) highlight del wordmark finale (righe sottili, una passata)
  if (f_lock > 0.2) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.22, (f_lock - 0.2) / 0.4 * 0.22);
    ctx.fillStyle = "rgba(15,42,36,0.12)";
    const cx = safe + (w - safe) * 0.55;
    const cy = h * 0.78;
    for (let i = 0; i < 2; i++) {
      const ww = Math.min(520, (w - safe) * 0.62) * (1 - i * 0.12);
      ctx.fillRect(cx - ww / 2, cy + i * 12, ww, 8);
    }
    ctx.restore();
  }
}

/* ──────────────────────────────────────────────────────────────────────────────
 * MICRO-VITA POST-LOCK
 * ────────────────────────────────────────────────────────────────────────────── */

function drawBreathing(ctx: CanvasRenderingContext2D, { w, h }: { w: number; h: number }) {
  // una lucentezza lievissima in diagonale (≤2%)
  const t = (performance.now() % 3000) / 3000;
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "rgba(255,255,255,0.00)");
  grad.addColorStop(0.48 + Math.sin(t * Math.PI * 2) * 0.02, "rgba(255,255,255,0.02)");
  grad.addColorStop(1, "rgba(255,255,255,0.00)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/* ──────────────────────────────────────────────────────────────────────────────
 * SHAPES & HELPERS
 * ────────────────────────────────────────────────────────────────────────────── */

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  style: { fill: string; stroke?: string; shadow?: string }
) {
  ctx.save();
  if (style.shadow) (ctx as any).shadowColor = "rgba(15,42,36,0.10)", (ctx as any).shadowBlur = 0, (ctx as any).shadowOffsetY = parseFloat(style.shadow.split(" ")[1]);
  ctx.fillStyle = style.fill;
  roundedRect(ctx, x, y, w, h, r);
  ctx.fill();
  if (style.stroke) {
    ctx.strokeStyle = style.stroke;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBox(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = "#FFFFFF";
  roundedRect(ctx, -w / 2, -h / 2, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(15,42,36,0.20)";
  ctx.stroke();
  // rullini
  ctx.fillStyle = "rgba(15,42,36,0.08)";
  ctx.fillRect(-w / 2 + 10, h / 2 - 6, w - 20, 4);
  ctx.fillRect(-w / 2 + 10, -h / 2 + 2, w - 20, 4);
  ctx.restore();
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, Math.min(w, h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function sampleMaskPoints(
  mask: { cols: number; rows: number; alpha: Float32Array },
  desired: number
): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  const step = Math.max(2, Math.floor(Math.sqrt((mask.cols * mask.rows) / desired)));
  for (let y = 0; y < mask.rows; y += step) {
    for (let x = 0; x < mask.cols; x += step) {
      if (mask.alpha[y * mask.cols + x] > 0.6) pts.push([x, y]);
    }
  }
  return pts;
}

/* Paths per conveyor */

function polyline(nums: number[]): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
  return pts;
}

function pathLength(path: [number, number][]) {
  let L = 0;
  for (let i = 1; i < path.length; i++) {
    const [x1, y1] = path[i - 1];
    const [x2, y2] = path[i];
    L += Math.hypot(x2 - x1, y2 - y1);
  }
  return L;
}

function pointAt(path: [number, number][], dist: number) {
  let d = dist;
  for (let i = 1; i < path.length; i++) {
    const [x1, y1] = path[i - 1];
    const [x2, y2] = path[i];
    const seg = Math.hypot(x2 - x1, y2 - y1);
    if (d <= seg) {
      const t = d / seg;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const angle = Math.atan2(y2 - y1, x2 - x1);
      return { x, y, angle };
    }
    d -= seg;
  }
  const last = path[path.length - 1];
  const prev = path[path.length - 2];
  const angle = Math.atan2(last[1] - prev[1], last[0] - prev[0]);
  return { x: last[0], y: last[1], angle };
}

// Disegna il percorso "parzialmente" in base al progress (0..1)
function strokePathProgress(
  ctx: CanvasRenderingContext2D,
  path: [number, number][],
  progress: number
): void {
  if (!path || path.length < 2) return;
  const L = pathLength(path);
  const target = Math.max(0, Math.min(1, progress)) * L;

  let acc = 0;
  ctx.beginPath();
  ctx.moveTo(path[0][0], path[0][1]);

  for (let i = 1; i < path.length; i++) {
    const [x0, y0] = path[i - 1];
    const [x1, y1] = path[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);

    if (acc + seg <= target) {
      // possiamo disegnare tutto il segmento
      ctx.lineTo(x1, y1);
      acc += seg;
    } else {
      // disegniamo solo una parte del segmento
      const t = Math.max(0, Math.min(1, (target - acc) / seg));
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      ctx.lineTo(x, y);
      break;
    }
  }

  ctx.stroke();
}


/* Math utils */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
