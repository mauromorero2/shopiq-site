"use client";
import { useEffect } from "react";
import { useUI } from "@/lib/store/ui";

export function TopBar() {
  const { lang, setLang, muted, setMuted, reduceMotion, setReduceMotion } = useUI();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setReduceMotion(true);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setReduceMotion]);

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-10 bg-mac-bg2/90 backdrop-blur border-b border-mac-ink flex items-center px-3 text-xs">
      <span className="mr-3">🍏</span>
      <span className="font-semibold tracking-wide">Shop IQ</span>
      <div className="ml-auto flex items-center gap-3">
        <label className="inline-flex items-center gap-1">
          <span className="opacity-70">Lang</span>
          <select className="bg-white/50 border border-mac-ink rounded px-1 py-0.5" value={lang} onChange={(e) => setLang(e.target.value as any)}>
            <option value="it">IT</option>
            <option value="en">EN</option>
          </select>
        </label>
        <label className="inline-flex items-center gap-1">
          <input type="checkbox" checked={muted} onChange={(e)=> setMuted(e.target.checked)} />
          <span>Mute</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input type="checkbox" checked={reduceMotion} onChange={(e)=> setReduceMotion(e.target.checked)} />
          <span>Reduce motion</span>
        </label>
      </div>
    </div>
  );
}
