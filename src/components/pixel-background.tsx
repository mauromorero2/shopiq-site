"use client";
import { useEffect, useMemo, useRef } from "react";
import { useUI } from "@/lib/store/ui";

export function PixelBackground({ accent = "#39FF14", duration = 2800 }: { accent?: string; duration?: number }) {
  const section = useUI((s) => s.section);
  const reduce = useUI((s) => s.reduceMotion);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const size = useRef({ w: 0, h: 0 });
  const current = useRef<Float32Array | null>(null);
  const target = useRef<Float32Array | null>(null);
  const colsRef = useRef(80);
  const rowsRef = useRef(45);
  const rafRef = useRef<number | null>(null);

  const PALETTE = useMemo(() => ({ bg1: "#d9dee7", bg2: "#c9d3e3", bg3: "#b9c6db", accent }), [accent]);

  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current!;
      const w = window.innerWidth, h = window.innerHeight;
      c.width = w; c.height = h; size.current = { w, h };
      const base = Math.min(Math.floor(w / 18), Math.floor(h / 18));
      const cols = Math.max(48, Math.min(140, base));
      const rows = Math.floor((cols * h) / w);
      colsRef.current = cols; rowsRef.current = rows;
      current.current = new Float32Array(cols * rows);
      target.current = new Float32Array(cols * rows);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const pattern = useMemo(() => getPattern(section), [section]);

  useEffect(() => {
    const c = canvasRef.current!; const ctx = c.getContext("2d")!;
    const cols = colsRef.current, rows = rowsRef.current; const total = cols * rows;
    const tfield = new Float32Array(total); const now = performance.now();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1), v = y / (rows - 1);
      tfield[y * cols + x] = pattern(u, v, now);
    }
    target.current = tfield;

    if (!current.current || reduce) { current.current = tfield; draw(ctx, tfield, cols, rows, size.current, PALETTE); return; }

    const start = performance.now(); const from = current.current.slice();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / duration);
      const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      for (let i = 0; i < total; i++) from[i] = from[i] + (tfield[i] - from[i]) * e;
      current.current = from; draw(ctx, from, cols, rows, size.current, PALETTE);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pattern, PALETTE, duration, reduce]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full [image-rendering:pixelated]" aria-hidden />;
}

function draw(ctx: CanvasRenderingContext2D, field: Float32Array, cols: number, rows: number, size: { w: number; h: number }, P: any) {
  const { w, h } = size; const cw = Math.ceil(w / cols), ch = Math.ceil(h / rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const v = field[y * cols + x]; ctx.fillStyle = ramp(v, P); ctx.fillRect(x * cw, y * ch, cw, ch);
  }
}
const ramp = (v: number, P: any) => (v > 0.85 ? P.accent : v > 0.6 ? P.bg1 : v > 0.35 ? P.bg2 : P.bg3);
const step = (x: number, e: number) => (x < e ? 1 : 0);
const noise = (x: number, y: number) => { const s = Math.sin(x * 56.123 + y * 34.345) * 43758.5453; return s - Math.floor(s); };
const dist = (u: number, v: number, cx: number, cy: number) => Math.hypot(u - cx, v - cy);
const ring = (u: number, v: number, cx: number, cy: number, r: number) => Math.max(0, 1 - Math.abs(Math.hypot(u - cx, v - cy) - r) * 30);

function getPattern(section: string) {
  const fns: Record<string, (u: number, v: number, t: number) => number> = {
    home: (u, v, t) => { const w1 = Math.sin((u * 8 + t * 0.0008) * Math.PI) * 0.5 + 0.5; const w2 = Math.sin((v * 8 + t * 0.0006) * Math.PI) * 0.5 + 0.5; return (w1 * 0.6 + w2 * 0.4) * 0.6 + noise(u, v) * 0.15; },
    services: (u, v, t) => { const cx = 0.5, cy = 0.5; const dx = Math.abs(u - cx), dy = Math.abs(v - cy); const die = step(Math.max(dx, dy), 0.14); const tx = step(Math.abs(Math.sin((v + t * 0.0007) * 40)), 0.04); const ty = step(Math.abs(Math.sin((u + t * 0.0007) * 40)), 0.04); const grid = step(Math.abs(Math.sin(u * 30)) + Math.abs(Math.sin(v * 30)), 0.6); return Math.max(0, Math.min(1, die * 1 + (tx + ty) * 0.6 + grid * 0.3 + noise(u, v) * 0.1)); },
    about: (u, v, t) => { const desk = step(1 - v, 0.28); const p1 = Math.max(0, 1 - (Math.hypot(u - (0.22 + Math.sin(t * 0.0004) * 0.01), v - 0.58) - 0.08) * 18); const p2 = Math.max(0, 1 - (Math.hypot(u - (0.78 + Math.cos(t * 0.0004) * 0.01), v - 0.56) - 0.07) * 18); const lamp = Math.max(0, (1 - dist(u, v, 0.55, 0.3)) * 1.3 - (v - 0.3) * 1.8); return Math.max(0, Math.min(1, desk * 0.5 + p1 * 0.9 + p2 * 0.9 + lamp * 0.4 + noise(u, v) * 0.1)); },
    blog: (u, v, t) => { let s = 0.15 * noise(u * 20 + t * 0.001, v * 20) + 0.2; for (let i = 0; i < 5; i++) { const px = (u * (i * 7 + 3) + i * 0.17 + t * 0.0002 * (i + 1)) % 1; const py = (v * (i * 5 + 2) + t * 0.00035 * (i + 1)) % 1; const paper = step(Math.max(Math.abs(u - px), Math.abs(v - py)), 0.03); s = Math.max(s, paper * (0.6 + i * 0.08)); } return Math.max(0, Math.min(1, s + noise(u, v) * 0.08)); },
    contact: (u, v, t) => { const tower = step(Math.abs(u - 0.72), 0.02) * step(Math.abs(v - 0.5), 0.5); const mast = step(Math.max(Math.abs(u - 0.72), Math.abs(v - 0.28)), 0.04); const r1 = ring(u, v, 0.72, 0.28, 0.12 + Math.sin(t * 0.001) * 0.02); const r2 = ring(u, v, 0.72, 0.28, 0.24 + Math.cos(t * 0.001) * 0.02); const waves = (Math.sin((u * 12 - t * 0.0015) * Math.PI) * 0.5 + 0.5) * (1 - v); return Math.max(0, Math.min(1, tower * 0.8 + mast * 0.8 + r1 * 0.8 + r2 * 0.6 + waves * 0.3 + noise(u, v) * 0.1)); },
  };
  return fns[section] ?? fns.home;
}
