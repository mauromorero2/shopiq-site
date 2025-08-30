// src/components/ui/Wallpaper.tsx
"use client";

import { useEffect, useRef } from "react";

export default function Wallpaper() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // genera un tile 8×8 Bayer 1-bit (level ~160) e usalo come background
    const c = document.createElement("canvas");
    c.width = 8;
    c.height = 8;
    const ctx = c.getContext("2d")!;
    const b = [
      [0,48,12,60,3,51,15,63],
      [32,16,44,28,35,19,47,31],
      [8,56,4,52,11,59,7,55],
      [40,24,36,20,43,27,39,23],
      [2,50,14,62,1,49,13,61],
      [34,18,46,30,33,17,45,29],
      [10,58,6,54,9,57,5,53],
      [42,26,38,22,41,25,37,21],
    ];
    const level = 160; // più alto = più chiaro
    const id = ctx.createImageData(8, 8);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = (y * 8 + x) * 4;
        const thr = b[y][x] * 4;
        const v = level > thr ? 255 : 0;
        id.data[idx + 0] = v;
        id.data[idx + 1] = v;
        id.data[idx + 2] = v;
        id.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(id, 0, 0);
    const url = c.toDataURL("image/png");

    if (ref.current) {
      ref.current.style.backgroundImage = `url(${url})`;
    }
  }, []);

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{
        backgroundRepeat: "repeat",
        backgroundSize: "8px 8px",
        imageRendering: "pixelated",
      }}
      aria-hidden
    />
  );
}
