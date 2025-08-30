"use client";

import { useEffect, useRef, useState } from "react";

type Bounds = "viewport" | { top: number; left: number; right: number; bottom: number };

let Z_COUNTER = 10;

export default function Draggable({
  initial = { x: 0, y: 0 },
  snap = 8,
  bounds = "viewport",
  onFocus,
  className = "",
  children,
}: {
  initial?: { x: number; y: number };
  snap?: number;
  bounds?: Bounds;
  onFocus?: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const [z, setZ] = useState(Z_COUNTER++);

  useEffect(() => {
    // iniziale snap alla griglia
    setPos((p) => ({ x: Math.round(p.x / snap) * snap, y: Math.round(p.y / snap) * snap }));
  }, [snap]);

  function clampToBounds(nx: number, ny: number) {
    const el = ref.current!;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const pad = 4;
    let minX = pad,
      minY = 56 + pad, // sotto header
      maxX = vw - rect.width - pad,
      maxY = vh - rect.height - pad;

    if (bounds !== "viewport") {
      minX = bounds.left;
      minY = bounds.top;
      maxX = bounds.right - rect.width;
      maxY = bounds.bottom - rect.height;
    }
    return {
      x: Math.min(maxX, Math.max(minX, nx)),
      y: Math.min(maxY, Math.max(minY, ny)),
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    const startX = e.clientX;
    const startY = e.clientY;
    const start = { ...pos };
    setZ(Z_COUNTER++);
    onFocus?.();

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const next = clampToBounds(start.x + dx, start.y + dy);
      setPos(next);
    };
    const up = () => {
      setPos((p) => ({ x: Math.round(p.x / snap) * snap, y: Math.round(p.y / snap) * snap }));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "absolute", left: pos.x, top: pos.y, zIndex: z }}
      onPointerDown={onPointerDown}
    >
      {children}
    </div>
  );
}
