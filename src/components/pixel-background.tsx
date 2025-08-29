"use client";
/**
 * PixelBackground — 16-bit monochrome + wordmark scenes
 * - Monochrome palette (5 livelli) con ordered dithering (Bayer 4x4)
 * - Testo “ShopIQ” e “We Build, You Sell.” rasterizzato in low-res
 * - Variazioni per sezione (posizioni/dimensioni diverse)
 * - Morph ~2.8s tra le scene, rispetto "reduce motion"
 */

import { useEffect, useMemo, useRef } from "react";
import { useUI } from "@/lib/store/ui";

type SceneKey = "home" | "services" | "about" | "blog" | "contact";

export function PixelBackground({
  hue = 215,          // tonalità monocromatica (blu-azzurro). Esempi: 215=blu, 160=verde acqua, 280=viola
  contrast = 0.95,    // contrasto generale (0..1)
  levels = 5,         // livelli della palette (5 consigliato)
  duration = 2800,    // ms morph
}: {
  hue?: number;
  contrast?: number;
  levels?: number;
  duration?: number;
}) {
  const section = useUI((s) => s.section);
  const reduce = useUI((s) => s.reduceMotion);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const current = useRef<Float32Array | null>(null);
  const target = useRef<Float32Array | null>(null);
  const colsRef = useRef(96);
  const rowsRef = useRef(54);
  const rafRef = useRef<number | null>(null);

  // Paletta monocromatica 16-bit (5 livelli)
  const PALETTE = useMemo(() => makeMonochromeShades(hue, levels), [hue, levels]);

  // Resize + griglia “console”
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current!;
      const w = window.innerWidth;
      const h = window.innerHeight;
      c.width = w;
      c.height = h;
      size.current = { w, h };
      // griglia più densa del precedente per look “16-bit”
      const base = Math.min(Math.floor(w / 14), Math.floor(h / 14));
      const cols = clampInt(base, 72, 160);
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

  // Pattern per sezione (con testo + sfondo stilizzato)
  const scene = useMemo(() => SCENES[section], [section]);

  useEffect(() => {
    const c = canvasRef.current!;
    const ctx = c.getContext("2d")!;
    const cols = colsRef.current;
    const rows = rowsRef.current;
    const total = cols * rows;

    // 1) genera target: base stylized + text mask + contorno
    const field = new Float32Array(total);
    const now = performance.now();

    // base “16-bit”: ognisezione ha un impianto diverso
    const base = makeBaseField(cols, rows, section, now);

    // testo rasterizzato in low-res
    const text = renderTextMask(cols, rows, scene);

    // contorno (outline) per dare look da sprite 16-bit
    const outline = outlineFromMask(text, cols, rows);

    for (let i = 0; i < total; i++) {
      // mescola: base attenuata + testo forte + outline medio + un po’ di noise
      const v =
        base[i] * 0.55 +
        text[i] * 1.1 +
        outline[i] * 0.45 +
        hashNoise(i * 13.37) * 0.05;
      field[i] = clamp01(v * contrast);
    }

    target.current = field;

    // 2) morph (o salto se reduce)
    if (!current.current || reduce) {
      current.current = field;
      drawDithered(ctx, field, cols, rows, size.current, PALETTE);
      return;
    }

    const start = performance.now();
    const from = current.current.slice();

    const tick = () => {
      const p = clamp01((performance.now() - start) / duration);
      const e = easeInOutCubic(p);
      const cur = current.current!;
      for (let i = 0; i < total; i++) cur[i] = lerp(from[i], field[i], e);
      drawDithered(ctx, cur, cols, rows, size.current, PALETTE);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scene, PALETTE, contrast, duration, reduce]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full [image-rendering:pixelated]"
      aria-hidden
    />
  );
}

/* =========================
   Scene config (posizioni/scale diverse per sezione)
   ========================= */

const SCENES: Record<
  SceneKey,
  {
    title: string;
    subtitle: string;
    titleScale: number;   // relativo a rows (0..1)
    subScale: number;     // relativo a rows (0..1)
    titlePos: [number, number]; // u,v 0..1
    subPos: [number, number];   // u,v 0..1
    align: "center" | "left" | "right";
  }
> = {
  home: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.26,
    subScale: 0.10,
    titlePos: [0.5, 0.36],
    subPos: [0.52, 0.58],
    align: "center",
  },
  services: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.22,
    subScale: 0.09,
    titlePos: [0.18, 0.30],
    subPos: [0.20, 0.48],
    align: "left",
  },
  about: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.24,
    subScale: 0.08,
    titlePos: [0.78, 0.38],
    subPos: [0.74, 0.56],
    align: "right",
  },
  blog: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.20,
    subScale: 0.085,
    titlePos: [0.50, 0.28],
    subPos: [0.50, 0.46],
    align: "center",
  },
  contact: {
    title: "ShopIQ",
    subtitle: "We Build, You Sell.",
    titleScale: 0.23,
    subScale: 0.09,
    titlePos: [0.30, 0.64],
    subPos: [0.32, 0.80],
    align: "left",
  },
};

/* =========================
   Base “16-bit” stylized fields per sezione
   ========================= */

function makeBaseField(cols: number, rows: number, section: SceneKey, t: number) {
  const total = cols * rows;
  const out = new Float32Array(total);

  const perlin = (x: number, y: number) =>
    // hash noise semplice, rapido
    (Math.sin(x * 37.11 + y * 51.7) * 43758.5453) % 1;

  const sunburst = (u: number, v: number, cx = 0.5, cy = 0.42) => {
    const dx = u - cx, dy = v - cy;
    const r = Math.hypot(dx, dy) + 1e-6;
    const a = Math.atan2(dy, dx);
    // raggi + alone
    return clamp01(0.55 - r * 0.7 + Math.sin(a * 16 + t * 0.001) * 0.15);
  };

  const diagStripes = (u: number, v: number) =>
    clamp01(0.5 + Math.sin((u - v) * 32 + t * 0.0012) * 0.35);

  const hills = (u: number, v: number) => {
    const h1 = 0.65 + Math.sin(u * 6 + t * 0.0007) * 0.04;
    const h2 = 0.75 + Math.sin(u * 4.5 + 1.7 + t * 0.0005) * 0.06;
    const ground = v > h1 ? 0.2 : v > h2 ? 0.35 : 0.55;
    return ground + perlin(u * 10, v * 10) * 0.08;
  };

  const selector: Record<SceneKey, (u: number, v: number) => number> = {
    home: (u, v) => 0.6 * sunburst(u, v) + 0.4 * diagStripes(u, v),
    services: (u, v) => 0.55 * diagStripes(u, v) + 0.35 * perlin(u * 18, v * 18),
    about: (u, v) => 0.6 * hills(u, v) + 0.25 * diagStripes(u, v),
    blog: (u, v) => 0.55 * perlin(u * 22, v * 22) + 0.35 * sunburst(u, v, 0.5, 0.28),
    contact: (u, v) => 0.6 * diagStripes(u, v) + 0.25 * hills(u, v),
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const v = y / (rows - 1);
      out[y * cols + x] = selector[section](u, v);
    }
  }
  return out;
}

/* =========================
   Text raster (title + subtitle) → mask (0..1)
   ========================= */

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

  // NOTE: usiamo un font “pixel-ish”; se non è caricato, il browser ricade su monospace
  const titlePx = Math.max(6, Math.floor(rows * s.titleScale));
  const subPx = Math.max(5, Math.floor(rows * s.subScale));
  ctx.font = `${titlePx}px "Press Start 2P", ui-monospace, monospace`;
  drawText(ctx, s.title, s.titlePos, cols, rows);

  ctx.font = `${subPx}px "Press Start 2P", ui-monospace, monospace`;
  drawText(ctx, s.subtitle, s.subPos, cols, rows);

  // lettura alpha → Float32Array
  const data = ctx.getImageData(0, 0, cols, rows).data;
  const out = new Float32Array(cols * rows);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    out[p] = data[i + 3] / 255; // alpha
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
  // piccola ombra per separare dallo sfondo (come outline “riempito”)
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x + 1, y + 1);
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
   Drawing con ordered dithering (Bayer 4x4) e palette monochrome
   ========================= */

function drawDithered(
  ctx: CanvasRenderingContext2D,
  field: Float32Array,
  cols: number,
  rows: number,
  size: { w: number; h: number },
  PALETTE: string[]
) {
  const { w, h } = size;
  const cw = Math.ceil(w / cols);
  const ch = Math.ceil(h / rows);
  const levels = PALETTE.length;

  // Bayer 4x4 (0..15)
  const B = [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5,
  ];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let v = clamp01(field[y * cols + x]);
      // ordered dithering → quantizzazione “morbida”
      const b = B[(y & 3) * 4 + (x & 3)] / 16; // 0..1
      const q = clamp01(v + (b - 0.5) / (levels * 0.85));
      const level = Math.min(levels - 1, Math.floor(q * levels));
      ctx.fillStyle = PALETTE[level];
      ctx.fillRect(x * cw, y * ch, cw, ch);
    }
  }
}

/* =========================
   Palette helpers
   ========================= */

function makeMonochromeShades(h: number, n = 5) {
  const shades: string[] = [];
  // luminosità da scura a chiara, con saturazione medio-bassa per “mono”
  const sats = 18; // %
  for (let i = 0; i < n; i++) {
    const l = 12 + (i * (82 - 12)) / (n - 1); // 12% → 82%
    shades.push(hslToHex(h, sats, l));
  }
  return shades;
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/* =========================
   Math utils
   ========================= */

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clampInt = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const hashNoise = (x: number) => {
  const s = Math.sin(x) * 43758.5453;
  return s - Math.floor(s);
};
