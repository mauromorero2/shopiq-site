"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useUI, type Section } from "@/lib/store/ui";

const GRID = { x: 120, y: 120 };
const ICONS: { key: Section; label_it: string; label_en: string }[] = [
  { key: "services", label_it: "Servizi", label_en: "Services" },
  { key: "about", label_it: "Chi siamo", label_en: "About" },
  { key: "blog", label_it: "Blog", label_en: "Blog" },
  { key: "contact", label_it: "Contatti", label_en: "Contact" },
];

export function DesktopOS() {
  const setSection = useUI((s) => s.setSection);
  const lang = useUI((s) => s.lang);

  return (
    <div className="absolute inset-0 pt-12">
      <div className="absolute left-6 top-16 space-y-6">
        {ICONS.map((it) => (
          <Icon key={it.key} label={lang === "it" ? it.label_it : it.label_en} onOpen={() => setSection(it.key)} />
        ))}
      </div>
    </div>
  );
}

function Icon({ label, onOpen }: { label: string; onOpen: () => void }) {
  const clicks = useRef(0);
  const onClick = () => {
    clicks.current++;
    if (clicks.current === 1) setTimeout(() => (clicks.current = 0), 300);
    if (clicks.current >= 2) onOpen();
  };
  const snap = (v: number, step: number) => Math.round(v / step) * step;

  return (
    <motion.div
      className="w-28 select-none"
      drag
      dragMomentum={false}
      onClick={onClick}
      onDragEnd={(e, info) => {
        const el = e.currentTarget as HTMLElement;
        const x = snap(info.point.x, GRID.x);
        const y = snap(info.point.y, GRID.y);
        el.style.transform = `translate(${x}px, ${y}px)`;
      }}
    >
      <div className="flex flex-col items-center gap-1">
        <div className="p-2 bg-white/70 border border-mac-ink rounded-xl shadow-md">
          <div className="w-8 h-8 bg-mac-bg1 border border-mac-ink" />
        </div>
        <span
  className="text-[10px] text-center leading-tight"
  style={{ textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.55)" }}
>
  {label}
</span>

      </div>
    </motion.div>
  );
}
