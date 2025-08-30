"use client";

import { useEffect, useRef, useState } from "react";

type Bounds = "viewport" | { top: number; left: number; right: number; bottom: number };

let Z = 10;

export default function Draggable({
  initial = { x: 0, y: 0 },
  snap = 8,
  bounds = "viewport",
  handleSelector, // es: "[data-drag-handle='1']"
  className = "",
  onFocus,
  children,
}: {
  initial?: { x: number; y: number };
  snap?: number;
  bounds?: Bounds;
  handleSelector?: string;
  className?: string;
  onFocus?: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(initial);
  const [z, setZ] = useState(Z++);

  useEffect(() => {
    setPos(p => ({ x: Math.round(p.x / snap) * snap, y: Math.round(p.y / snap) * snap }));
  }, [snap]);

  function clamp(nx: number, ny: number) {
    const el = ref.current!;
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = el.getBoundingClientRect();
    const pad = 4;
    let minX = pad, minY = 56 + pad, maxX = vw - r.width - pad, maxY = vh - r.height - pad;
    if (bounds !== "viewport") {
      minX = bounds.left; minY = bounds.top; maxX = bounds.right - r.width; maxY = bounds.bottom - r.height;
    }
    return { x: Math.min(maxX, Math.max(minX, nx)), y: Math.min(maxY, Math.max(minY, ny)) };
  }

  function startDrag(e: React.PointerEvent) {
    if (handleSelector) {
      const t = e.target as HTMLElement;
      if (!t.closest(handleSelector)) return;
    }
    const sx = e.clientX, sy = e.clientY;
    const start = { ...pos };
    setZ(Z++); onFocus?.();

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      setPos(clamp(start.x + dx, start.y + dy));
    };
    const up = () => {
      setPos(p => ({ x: Math.round(p.x / snap) * snap, y: Math.round(p.y / snap) * snap }));
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
      onPointerDown={startDrag}
    >
      {children}
    </div>
  );
}
