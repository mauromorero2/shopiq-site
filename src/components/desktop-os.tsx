"use client";
import { motion } from "framer-motion";
import { useRef } from "react";
import { useUI, type Section } from "@/lib/store/ui";
import { playClick } from "@/lib/sfx";

/** Griglia snap */
const GRID = { x: 120, y: 120 };

/** Voci di menu con icona dedicata */
const ICONS: {
  key: Extract<Section, "services" | "about" | "blog" | "contact">;
  label_it: string;
  label_en: string;
  kind: "services" | "about" | "blog" | "contact";
}[] = [
  { key: "services", label_it: "Servizi", label_en: "Services", kind: "services" },
  { key: "about", label_it: "Chi siamo", label_en: "About", kind: "about" },
  { key: "blog", label_it: "Blog", label_en: "Blog", kind: "blog" },
  { key: "contact", label_it: "Contatti", label_en: "Contact", kind: "contact" },
];

export function DesktopOS() {
  const setSection = useUI((s) => s.setSection);
  const lang = useUI((s) => s.lang);
  const muted = useUI((s) => s.muted);

  return (
    <div className="absolute inset-0 pt-12">
      <div className="absolute left-6 top-16 space-y-6">
        {ICONS.map((it) => (
          <Icon
            key={it.key}
            label={lang === "it" ? it.label_it : it.label_en}
            kind={it.kind}
            onOpen={() => {
              playClick(muted);
              setSection(it.key);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function Icon({
  label,
  kind,
  onOpen,
}: {
  label: string;
  kind: "services" | "about" | "blog" | "contact";
  onOpen: () => void;
}) {
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
        {/* Tile stile Mac: bianco, bordo soft, ombra leggera */}
        <div className="p-2 bg-white border border-mac-ink/15 rounded-xl shadow-sm">
          <div className="w-8 h-8 flex items-center justify-center">
            <MacIcon kind={kind} />
          </div>
        </div>
        <span
          className="text-[10px] text-center leading-tight"
          style={{
            textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 0 2px rgba(255,255,255,0.55)",
          }}
        >
          {label}
        </span>
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * Icone stile Mac OS (monocrome, pulite)
 * ──────────────────────────────────────────────────────────────────────────── */

function MacIcon({ kind }: { kind: "services" | "about" | "blog" | "contact" }) {
  const ink = "#0F2A24";
  const stroke = { stroke: ink, strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" as const };

  switch (kind) {
    case "services":
      // Ingranaggio semplice e leggibile
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Services" role="img">
          <g {...stroke}>
            {/* denti */}
            <rect x="11" y="2" width="2" height="3" rx="1" fill={ink} />
            <rect x="11" y="19" width="2" height="3" rx="1" fill={ink} />
            <rect x="2" y="11" width="3" height="2" rx="1" fill={ink} />
            <rect x="19" y="11" width="3" height="2" rx="1" fill={ink} />
            <rect x="4.2" y="4.2" width="2" height="3" rx="1" transform="rotate(-45 4.2 4.2)" fill={ink} />
            <rect x="17.8" y="16.8" width="2" height="3" rx="1" transform="rotate(-45 17.8 16.8)" fill={ink} />
            <rect x="4.2" y="16.8" width="2" height="3" rx="1" transform="rotate(45 4.2 16.8)" fill={ink} />
            <rect x="17.8" y="4.2" width="2" height="3" rx="1" transform="rotate(45 17.8 4.2)" fill={ink} />
            {/* corpo */}
            <circle cx="12" cy="12" r="5.5" />
            <circle cx="12" cy="12" r="2.4" />
          </g>
        </svg>
      );

    case "about":
      // Profilo utente dentro tonda
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" aria-label="About" role="img">
          <g {...stroke}>
            <circle cx="12" cy="12" r="8.5" />
            {/* testa */}
            <circle cx="12" cy="10" r="2.8" />
            {/* spalle */}
            <path d="M6.5 17c1.8-2.1 4-3.2 5.5-3.2s3.7 1 5.5 3.2" />
          </g>
        </svg>
      );

    case "blog":
      // Documento con angolo piegato e righe
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Blog" role="img">
          <g {...stroke}>
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5" />
            {/* righe testo */}
            <path d="M9.5 12h8" />
            <path d="M9.5 15h8" />
            <path d="M9.5 18h6" />
          </g>
        </svg>
      );

    case "contact":
      // Busta (envelope)
      return (
        <svg width="28" height="28" viewBox="0 0 24 24" aria-label="Contact" role="img">
          <g {...stroke}>
            <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
            <path d="M4.5 8l7.5 6 7.5-6" />
          </g>
        </svg>
      );
  }
}
