"use client";
/**
 * PixelBackground — Mist Mint + Pixel Dust Reveal (WOW)
 * - Palette monocromatica chiarissima (Mist Mint, 6 livelli)
 * - Safe-zone icone a sinistra: sempre molto chiara
 * - Morph 2.8s con "polvere di pixel" che converge nel wordmark
 * - Reveal payoff dot-matrix + shimmer diagonale #39FF14 (soft, una sola passata)
 * - Dithering ordinato 8x8 (look 16-bit pulito)
 * - Respect "Reduce motion": salto al frame finale (fade 180ms)
 */

import { useEffect, useMemo, useRef } from "react";
import { useUI } from "@/lib/store/ui";

type SceneKey = "home" | "services" | "about" | "blog" | "contact";

export function PixelBackground({
  duration = 2800,
  accent = "#39FF14",
}: {
  duration?: number;
  accent?: string;
}) {
  const section = useUI((s) => s.section);
  const reduce = useUI((s) => s.reduceMotion);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const colsRef = useRef(128);
  const rowsRef = useRef(72);
  const current = useRef<Float32Array | null>(null);
  const target = useRef<Float32Array | null>(null);
  const rafRef = useRef<number | null>(null);

  // Particles for "dust" overlay
  const particlesRef = useRef<Particle[]>([]);
  const textMaskRef = useRef<Float32Array | null>(null);
  const shimmerRef = useRef<{ start: number; done: boolean }>({ start: 0, done: false });

  // Mist Mint palette (light!)
  const PALETTE = useMemo(
    () => ["#F7FFFB", "#EEFFF7", "#E3FFF2", "#D7F7EC", "#C8ECDF", "#B9DFD3"],
    []
  );

  // Resize & grid density (fitta per look 16-bit pulito)
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current!;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w;
      c.height = h;
      size.current = { w, h };

      const base = Math.min(Math.floor(w / 10.5), Math.floor(h / 10.5)); // più densa del precedente
      const cols = clampInt(base, 96, 192);
      const rows = Math.floor((cols * h) / w);
      colsRef.current = cols;
      rowsRef.current = rows;

      current.current = new Float32Array(cols * rows);
      target.current = new Float32Array(cols * rows);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Scene config (posizioni/scale diverse per sezione)
  const scene = useMemo(() => SCENES[section], [section]);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const cols = colsRef.current;
    const rows = rowsRef.current;
    const total = cols * rows;

    // 1) Base field super chiaro (no macchie scure)
    const base = makeMistBase(cols, rows, section);

    // 2) Text mask + outline
    const mask = renderTextMask(cols, rows, scene);
    textMaskRef.current = mask;
    const outline = outlineFromMask(mask, cols, rows);

    // 3) Target field (mix base + testo + outline) con clamp luminosità 0.72–0.98
    const tgt = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const v = base[i] * 0.55 + mask[i] * 1.2 + outline[i] * 0.45;
      tgt[i] = clamp01(remap(v, 0, 1, 0.72, 0.98));
    }
    target.current = tgt;

    // 4) Safe-zone icone (sempre chiarissima)
    lightenSafeZone(tgt, cols, rows, size.current);

    // 5) Particelle per il "dust reveal" (solo se non reduce)
    shimmerRef.current = { start: performance.now() + duration * 0.7, done: false };
    if (!reduce) {
      particlesRef.current = spawnParticles(cols, rows, mask, duration);
    } else {
      particlesRef.current = [];
    }

    // 6) Disegno/morph
    if (!current.current || reduce) {
      current.current = tgt;
      drawFrame(ctx, current.current, cols, rows, size.current, PALETTE, accent, !!reduce);
      return;
    }

    const start = performance.now();
    const from = current.current.slice();

    const tick = () => {
      const now = performance.now();
      const p = clamp01((now - start) / duration);
      const e = easeInOutCubic(p);

      const cur = current.current!;
      for (let i = 0; i < total; i++) cur[i] = lerp(from[i], tgt[i], e);

      drawFrame(ctx, cur, cols, rows, size.current, PALETTE, accent, false, {
        particles: particlesRef.current,
        mask: textMaskRef.current!,
        shimmer: shimmerRef.current,
        progress: p,
      });

      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scene, duration, accent, PALETTE, section, reduce]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full [image-rendering:pixelated]"
      aria-hidden
    />
  );
}

/* =========================
   Particles ("dust reveal")
   ========================= */

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  t0: number;
  t1: number;
  neon: boolean;
};

function spawnParticles(cols: number, rows: number, mask: Float32Array, duration: number) {
  const pts: Particle[] = [];
  const targets: Array<[number, number]> = [];

  // raccogli punti "pieni" del testo (target)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (mask[y * cols + x] > 0.55) targets.push([x + 0.5, y + 0.5]);
    }
  }
  if (targets.length === 0) return pts;

  // numero particelle in base alla griglia (limit)
  const N = clampInt(Math.floor((cols * rows) / 18), 800, 2400);

  const now = performance.now();
  for (let i = 0; i < N; i++) {
    // spawn sui bordi
    const side = i % 4;
    let x = 0,
      y = 0;
    if (side === 0) {
      x = -2;
      y = Math.random() * rows;
    } else if (side === 1) {
      x = cols + 2;
      y = Math.random() * rows;
    } else if (side === 2) {
      x = Math.random() * cols;
      y = -2;
    } else {
      x = Math.random() * cols;
      y = rows + 2;
    }
    const [tx, ty] = targets[Math.floor(Math.random() * targets.length)];
    const jitter = (Math.random() - 0.5) * 0.8;
    const t0 = now + Math.random() * (duration * 0.25);
    const t1 = t0 + (duration * (0.65 + Math.random() * 0.25));
    pts.push({ x, y, tx: tx + jitter, ty: ty + jitter, t0, t1, neon: Math.random() < 0.06 });
  }
  return pts;
}

/* =========================
   Draw (dithering 8x8 + overlays)
   ========================= */

function drawFrame(
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  cols: number,
  rows: number,
  size: { w: number; h: number },
  PALETTE: string[],
  accent: string,
  staticOnly: boolean,
  extras?: { particles: Particle[]; mask: Float32Array; shimmer: { start: number; done: boolean }; progress: number }
) {
  const { w, h } = size;
  const cw = Math.ceil(w / cols);
  const ch = Math.ceil(h / rows);
  const levels = PALETTE.length;

  // Dithering Bayer 8x8 (0..63)
  const B = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ];

  // Draw base dithered frame (molto chiaro)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let v = clamp01(field[y * cols + x]); // 0..1 (già clamped 0.72..0.98 circa)
      const b = B[(y & 7) * 8 + (x & 7)] / 64; // 0..1
      const q = clamp01(v + (b - 0.5) / (levels * 1.4));
      const level = Math.min(levels - 1, Math.floor(q * levels));
      ctx.fillStyle = PALETTE[level];
      ctx.fillRect(x * cw, y * ch, cw, ch);
    }
  }

  if (staticOnly || !extras) return;

  // Overlays: dust + shimmer
  const { particles, mask, shimmer } = extras;
  const now = performance.now();

  // 1) Dust particles
  ctx.save();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const t = (now - p.t0) / (p.t1 - p.t0);
    if (t <= 0 || t >= 1) continue;

    // ease + swirl
    const e = easeOutCubic(t);
    const dx = p.tx - p.x;
    const dy = p.ty - p.y;
    const nx = p.x + dx * e;
    const ny = p.y + dy * e;

    // swirl morbido (percezione di “campo vettoriale”)
    const swirl = (1 - Math.abs(0.5 - t) * 2) * 0.35;
    const sx = nx + (-dy) * 0.02 * swirl;
    const sy = ny + (dx) * 0.02 * swirl;

    const px = Math.floor(sx * cw);
    const py = Math.floor(sy * ch);
    ctx.globalAlpha = p.neon ? 0.35 : 0.18;
    ctx.fillStyle = p.neon ? accent : "#FFFFFF";
    ctx.fillRect(px, py, cw, ch);
  }
  ctx.restore();

  // 2) Shimmer diagonale sul solo testo (una passata soft)
  if (!shimmer.done && now > shimmer.start) {
    const span = 220; // ms
    const t = (now - shimmer.start) / span;
    if (t >= 1) shimmer.done = true;

    const band = 0.07; // spessore banda
    ctx.save();
    ctx.globalAlpha = 0.22; // molto soft
    ctx.fillStyle = accent;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (mask[y * cols + x] < 0.5) continue;
        const diag = (x + y) / (cols + rows); // 0..1
        if (Math.abs(diag - t) < band) {
          ctx.fillRect(x * cw, y * ch, cw, ch);
        }
      }
    }
    ctx.restore();
  }
}

/* =========================
   Palette / Base / Safe zone / Mask
   ========================= */

function makeMistBase(cols: number, rows: number, section: SceneKey) {
  const out = new Float32Array(cols * rows);

  // pattern chiari e leggeri (no macchie scure)
  const diag = (u: number, v: number, s = 18) =>
    0.86 + Math.sin((u - v) * s) * 0.02;

  const swirl = (u: number, v: number, t = performance.now()) => {
    const a = Math.sin(u * 7 + t * 0.0004) * 0.02 + Math.cos(v * 6 + t * 0.0005) * 0.02;
    return 0.9 + a;
  };

  const selector: Record<SceneKey, (u: number, v: number) => number> = {
    home: (u, v) => 0.55 * diag(u, v, 22) + 0.45 * swirl(u, v),
    services: (u, v) => 0.6 * diag(u, v, 26) + 0.4 * swirl(u, v),
    about: (u, v) => 0.52 * diag(u, v, 20) + 0.48 * swirl(u, v),
    blog: (u, v) => 0.6 * diag(u, v, 24) + 0.4 * swirl(u, v),
    contact: (u, v) => 0.58 * diag(u, v, 28) + 0.42 * swirl(u, v),
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const v = y / (rows - 1);
      out[y * cols + x] = clamp01(selector[section](u, v));
    }
  }
  return out;
}

function lightenSafeZone(field: Float32Array, cols: number, rows: number, size: { w: number; h: number }) {
  // fascia sinistra (icone): almeno 92–98% luminosità
  const safePx = Math.max(200, Math.min(320, Math.round(size.w * 0.18))); // ~240 px tipico
  const cw = size.w / cols;

  const safeCols = Math.ceil(safePx / cw);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < safeCols; x++) {
      const i = y * cols + x;
      // gradiente dolce verso destra
      const t = x / safeCols;
      const minL = 0.92 + (1 - t) * 0.04; // 0.96 → 0.92
      if (field[i] < minL) field[i] = minL;
    }
  }
}

function renderTextMask(
  cols: number,
  rows: number,
  s: {
    title: string;
    subtitle: string;
    titleScale: number;
    subScale: number;
    titlePos: [number, number];
    subPos: [number, number];
    align: CanvasTextAlign;
  }
) {
  const can = document.createElement("canvas");
  can.width = cols;
  can.height = rows;
  const ctx = can.getContext("2d")!;
  ctx.clearRect(0, 0, cols, rows);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#fff";
  ctx.textBaseline = "middle";
  ctx.textAlign = s.align;

  const titlePx = Math.max(6, Math.floor(rows * s.titleScale));
  const subPx = Math.max(5, Math.floor(rows * s.subScale));
  ctx.font = `${titlePx}px "Press Start 2P", ui-monospace, monospace`;
  drawText(ctx, s.title, s.titlePos, cols, rows);

  ctx.font = `${subPx}px "Press Start 2P", ui-monospace, monospace`;
  drawText(ctx, s.subtitle, s.subPos, cols, rows);

  const data = ctx.getImageData(0, 0, cols, rows).data;
  const out = new Float32Array(cols * rows);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = data[i + 3] / 255;
  }
  return out;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  uv: [number, number],
  cols: number,
  rows: number
) {
  const x = uv[0] * cols;
  const y = uv[1] * rows;
  // micro ombra/riempimento per separazione (soft, chiara)
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x + 0.6, y + 0.6);
  ctx.restore();
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

function outlineFromMask(mask: Float32Array, cols: number, rows: number) {
  const out = new Float32Array(cols * rows);
  const idx = (x: number, y: number) => y * cols + x;
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const m =
        mask[idx(x, y)] > 0.02 &&
        (mask[idx(x - 1, y)] < 0.02 ||
          mask[idx(x + 1, y)] < 0.02 ||
          mask[idx(x, y - 1)] < 0.02 ||
          mask[idx(x, y + 1)] < 0.02);
      out[idx(x, y)] = m ? 1 : 0;
    }
  }
  return out;
}

/* =========================
   Scene presets (posizioni)
   ========================= */

const SCENES: Record<
  SceneKey,
  {
    title: string;
    subtitle: string;
    titleScale: number;
    subScale: number;
    titlePos: [number, number];
    subPos: [number, number];
    align: "center" | "left" | "right";
  }
> = {
  home: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.24,
    subScale: 0.09,
    titlePos: [0.54, 0.52],
    subPos: [0.54, 0.68],
    align: "center",
  },
  services: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.22,
    subScale: 0.085,
    titlePos: [0.26, 0.32],
    subPos: [0.28, 0.48],
    align: "left",
  },
  about: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.23,
    subScale: 0.085,
    titlePos: [0.78, 0.38],
    subPos: [0.76, 0.54],
    align: "right",
  },
  blog: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.20,
    subScale: 0.08,
    titlePos: [0.50, 0.28],
    subPos: [0.50, 0.44],
    align: "center",
  },
  contact: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.22,
    subScale: 0.085,
    titlePos: [0.36, 0.70],
    subPos: [0.38, 0.84],
    align: "left",
  },
};

/* =========================
   Math helpers
   ========================= */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clampInt = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
function remap(x: number, a: number, b: number, c: number, d: number) {
  return c + ((x - a) * (d - c)) / (b - a);
}
