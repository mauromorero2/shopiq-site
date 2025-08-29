"use client";
/**
 * Mac-style static desktop background:
 * - Retino 1-bit (8x8) grigio chiaro su bianco (look System 1)
 * - Safe-zone sinistra molto chiara per le icone
 * - Micro-glitch casuali (scanline, jitter, hot pixels) ogni 25–90s
 * - Respect prefers-reduced-motion: glitch disattivati
 */

import { useEffect, useRef } from "react";

export function PixelBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      drawBase(ctx, c.width, c.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (!reduce) scheduleGlitches(ctx, c.width, c.height, timers);

    return () => {
      window.removeEventListener("resize", resize);
      timers.current.forEach(clearTimeout);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" aria-hidden />;
}

function drawBase(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // fondo bianco
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  // retino 8x8 (puntinato grigio)
  const tile = 8;
  const pattern = document.createElement("canvas");
  pattern.width = tile;
  pattern.height = tile;
  const pctx = pattern.getContext("2d")!;
  pctx.fillStyle = "#ffffff";
  pctx.fillRect(0, 0, tile, tile);
  pctx.fillStyle = "#DDE9E3"; // grigio mint molto chiaro
  // matrice 1-bit semplice
  for (let y = 0; y < tile; y++) {
    for (let x = 0; x < tile; x++) {
      if (((x + y) & 3) === 0) pctx.fillRect(x, y, 1, 1);
    }
  }
  const pat = ctx.createPattern(pattern, "repeat")!;
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, w, h);

  // safe-zone sinistra
  const safe = Math.max(200, Math.min(320, Math.round(w * 0.18)));
  const grad = ctx.createLinearGradient(0, 0, safe, 0);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(1, "#F7FFFB");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, safe, h);
}

function scheduleGlitches(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  timers: React.MutableRefObject<number[]>
) {
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  const scanline = () => {
    const y = Math.floor(Math.random() * h);
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(0, y, w, 1);
    timers.current.push(
      window.setTimeout(() => {
        drawBase(ctx, w, h);
      }, 120)
    );
  };

  const jitter = () => {
    // shift di 1px del pattern
    const img = ctx.getImageData(0, 0, w, h);
    ctx.putImageData(img, 0, Math.random() < 0.5 ? 1 : -1);
    timers.current.push(
      window.setTimeout(() => {
        drawBase(ctx, w, h);
      }, 80)
    );
  };

  const hotPixels = () => {
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    for (let i = 0; i < 3; i++) {
      const x = Math.floor(Math.random() * w);
      const y = Math.floor(Math.random() * h);
      ctx.fillRect(x, y, 1, 1);
    }
    timers.current.push(window.setTimeout(() => drawBase(ctx, w, h), 60));
  };

  const loop = () => {
    // pianifica uno dei tre glitch, molto sporadici
    const choice = Math.random();
    if (choice < 0.4) scanline();
    else if (choice < 0.75) jitter();
    else hotPixels();

    timers.current.push(window.setTimeout(loop, rnd(25000, 90000)));
  };

  timers.current.push(window.setTimeout(loop, rnd(20000, 35000)));
}
