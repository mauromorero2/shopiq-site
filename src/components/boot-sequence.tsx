"use client";
/**
 * BootSequence — 3.0s, una sola volta (localStorage 'bootSeen')
 * Timeline:
 * 0.20s Floppy → 0.70s Insert + Boot bar (5 tick) → 1.40s Code Rain → 2.10s QuickDraw Desktop → 3.0s fine
 * - Skip visibile da 1.5s
 * - Overlay "Tap to enable sound" su mobile per sbloccare AudioContext
 * - Rispettato prefers-reduced-motion (salta a frame finale con fade)
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { playBootTick, playInsert, playTypeTick } from "@/lib/sfx";
import { SNIPPET } from "@/lib/code-snippets";
import { useUI } from "@/lib/store/ui";

export function BootSequence() {
  const muted = useUI((s) => s.muted);
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [progress, setProgress] = useState(0); // 0..5
  const [skippable, setSkippable] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);

  // mostra solo la prima volta
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const seen = window.localStorage.getItem("bootSeen") === "1";
    if (seen) return;

    setVisible(true);

    // mobile: mostra “tap to enable sound” se AudioContext è bloccato (best effort)
    try {
      const AC: any = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) {
        const ctx = new AC();
        if (ctx.state !== "running") setNeedsTap(true);
        ctx.close?.();
      }
    } catch {
      /* ignore */
    }

    if (reduce) {
      // salto a finale
      const timer = setTimeout(() => finish(), 200); // fade breve
      return () => clearTimeout(timer);
    }

    const t0 = performance.now();
    const timers: number[] = [];

    // PHASES
    timers.push(window.setTimeout(() => setPhase(1), 200)); // floppy on
    timers.push(
      window.setTimeout(() => {
        setPhase(2); // insert + boot bar
        playInsert(muted);
        // 5 tick della boot bar
        for (let i = 1; i <= 5; i++) {
          window.setTimeout(() => {
            setProgress(i);
            playBootTick(muted, i);
          }, i * 120);
        }
      }, 700)
    );
    timers.push(
      window.setTimeout(() => {
        setPhase(3); // code rain
      }, 1400)
    );
    timers.push(
      window.setTimeout(() => {
        setPhase(4); // quickdraw
      }, 2100)
    );
    timers.push(
      window.setTimeout(() => finish(), 3000)
    );
    timers.push(
      window.setTimeout(() => setSkippable(true), 1500)
    );

    function finish() {
      setVisible(false);
      try {
        window.localStorage.setItem("bootSeen", "1");
      } catch {}
    }

    return () => timers.forEach(clearTimeout);
  }, [muted]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-white text-black"
      aria-hidden
      style={{ pointerEvents: "auto" }}
    >
      {/* Skip */}
      {skippable && (
        <button
          onClick={() => {
            setVisible(false);
            try {
              window.localStorage.setItem("bootSeen", "1");
            } catch {}
          }}
          className="absolute right-3 bottom-3 text-[11px] px-2 py-1 bg-white/80 hover:bg-white border border-black/10 rounded"
        >
          Skip ▸
        </button>
      )}

      {/* Tap to enable sound (mobile) */}
      {needsTap && (
        <button
          onClick={() => setNeedsTap(false)}
          className="absolute left-3 bottom-3 text-[11px] px-2 py-1 bg-white/90 hover:bg-white border border-black/10 rounded"
        >
          Tap to enable sound
        </button>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        {/* Stage container */}
        <div className="relative w-[620px] max-w-[92vw]">
          {/* 1) Floppy */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 transition-transform duration-500 ${
              phase >= 2 ? "translate-x-[120px]" : ""
            }`}
          >
            <Floppy />
          </div>

          {/* 2) Macintosh-like (senza marchi) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <MacLike phase={phase} progress={progress} muted={muted} />
          </div>

          {/* 3) Code rain area (appare nella “finestra” del Mac) */}
          {phase === 3 && (
            <div className="absolute right-[38px] top-[-64px]">
              <CodeRain width={380} height={250} duration={650} snippet={SNIPPET} muted={muted} />
            </div>
          )}

          {/* 4) QuickDraw overlay per “disegnare” desktop */}
          {phase === 4 && <QuickDrawDesktop width={600} height={360} />}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
 * Elements
 * ----------------------------- */

function Floppy() {
  return (
    <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden shapeRendering="crispEdges">
      <rect x="22" y="18" width="136" height="144" fill="#fff" stroke="#000" strokeWidth="2" />
      <rect x="34" y="28" width="112" height="40" fill="#000" />
      <rect x="34" y="80" width="112" height="70" fill="#fff" stroke="#000" strokeWidth="2" />
      <rect x="42" y="88" width="96" height="18" fill="#000" />
      <text x="52" y="102" fontFamily="ui-monospace, monospace" fontSize="12" fill="#fff">
        ShopIQ System
      </text>
      <rect x="118" y="30" width="18" height="18" fill="#fff" />
    </svg>
  );
}

function MacLike({ phase, progress, muted }: { phase: number; progress: number; muted: boolean }) {
  // boot bar visibile in phase >=2 fino a 3
  return (
    <svg width="420" height="360" viewBox="0 0 420 360" aria-hidden shapeRendering="crispEdges">
      {/* case */}
      <rect x="0" y="0" width="420" height="360" fill="#fff" stroke="#000" strokeWidth="3" />
      {/* screen */}
      <rect x="36" y="36" width="348" height="248" fill="#fff" stroke="#000" strokeWidth="3" />
      {/* floppy slot */}
      <rect x="310" y="300" width="72" height="10" fill="#000" />
      {/* boot window */}
      {phase >= 2 && phase < 3 && (
        <>
          <rect x="72" y="80" width="276" height="120" fill="#fff" stroke="#000" strokeWidth="2" />
          <rect x="72" y="80" width="276" height="18" fill="#000" />
          <text x="84" y="93" fontFamily="ui-monospace, monospace" fontSize="10" fill="#fff">
            Boot
          </text>
          {/* progress (5 tacche) */}
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={92 + i * 44}
              y={132}
              width="36"
              height="18"
              fill={progress > i ? "#000" : "#fff"}
              stroke="#000"
              strokeWidth="2"
            />
          ))}
        </>
      )}
    </svg>
  );
}

function CodeRain({
  width,
  height,
  duration,
  snippet,
  muted,
}: {
  width: number;
  height: number;
  duration: number;
  snippet: string;
  muted: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chars = useMemo(() => {
    // estrai set caratteri “sicuri” dal snippet
    const clean = snippet.replace(/[^\w\s<>/={}\[\]\(\)\.\-;:'",|+!*&#%$@^`~]/g, "");
    const set = Array.from(new Set(clean.split("")));
    return set.length ? set : "{}<>/()=;_".split("");
  }, [snippet]);

  useEffect(() => {
    const c = canvasRef.current!;
    c.width = width;
    c.height = height;
    const ctx = c.getContext("2d")!;
    const cols = Math.floor(width / 14);
    const rows = Math.floor(height / 16);
    const colY = new Array(cols).fill(0);
    const start = performance.now();

    const tick = () => {
      const t = performance.now() - start;
      if (t > duration) return;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        const x = i * 14;
        let y = colY[i] * 16;
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = "#000";
        ctx.font = "12px ui-monospace, monospace";
        ctx.fillText(ch, x + 2, y + 12);

        if (Math.random() < 0.3) playTypeTick(muted);

        colY[i] = (colY[i] + 1) % rows;
      }

      requestAnimationFrame(tick);
    };
    tick();
  }, [width, height, chars, duration, muted]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}

function QuickDrawDesktop({ width, height }: { width: number; height: number }) {
  // Le linee si "disegnano" con stroke-dashoffset
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
      className="mx-auto"
    >
      {/* menu bar */}
      <DrawPath d={`M0 24 H ${width}`} />
      {/* finestra */}
      <DrawPath d={`M40 60 H ${width - 40} V ${height - 40} H 40 Z`} />
      {/* pattern area (rettangoli rapidi) */}
      {[...Array(10)].map((_, i) => (
        <DrawPath key={i} d={`M${48} ${80 + i * 20} H ${width - 48}`} delay={150 + i * 20} />
      ))}
    </svg>
  );
}
function DrawPath({ d, delay = 0 }: { d: string; delay?: number }) {
  const pathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    const el = pathRef.current!;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const t = setTimeout(() => {
      el.style.transition = "stroke-dashoffset 500ms ease-out";
      el.style.strokeDashoffset = "0";
    }, delay);
    return () => clearTimeout(t);
  }, [delay]);
  return <path ref={pathRef} d={d} stroke="#000" strokeWidth="2" fill="none" />;
}
