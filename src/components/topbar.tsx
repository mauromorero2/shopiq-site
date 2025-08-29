"use client";
import { useEffect } from "react";
import { useUI } from "@/lib/store/ui";
import { playClick } from "@/lib/sfx";

export function TopBar() {
  const { lang, setLang, muted, setMuted } = useUI();

  // sblocca reduce-motion se il sistema lo impone (solo per coerenza, non mostriamo toggle)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // non facciamo nulla nell'UI; lo sfondo già rispetta questa preferenza
    }
  }, []);

  return (
    <div className="fixed top-0 inset-x-0 z-40 h-12 bg-white border-b border-mac-ink/10 flex items-center px-3">
      {/* Logo/brand */}
      <span className="text-sm md:text-base tracking-wide select-none">ShopIQ</span>

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <LangSwitch lang={lang} onChange={(v) => { playClick(muted); setLang(v); }} />
        <MuteSwitch muted={muted} onToggle={() => setMuted(!muted)} />
      </div>
    </div>
  );
}

/* ------------------------
   Language switch: IT / EN
   ------------------------ */

function LangSwitch({
  lang,
  onChange,
}: {
  lang: "it" | "en";
  onChange: (v: "it" | "en") => void;
}) {
  const Btn = ({
    active,
    label,
    onClick,
    children,
  }: {
    active: boolean;
    label: string;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`inline-flex items-center justify-center rounded-md border px-1.5 py-1 transition
        ${active ? "bg-[#F7FFFB] border-mac-ink/30" : "bg-white border-mac-ink/15 hover:border-mac-ink/30"}`}
      style={{ boxShadow: active ? "0 1px 0 rgba(15,42,36,0.06)" : "none" }}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1">
      <Btn active={lang === "it"} label="Italiano" onClick={() => onChange("it")}>
        <FlagIT />
      </Btn>
      <Btn active={lang === "en"} label="English" onClick={() => onChange("en")}>
        <FlagEN />
      </Btn>
    </div>
  );
}

/* Pixel flags (stile 32-bit, crisp) */
function FlagIT() {
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" shapeRendering="crispEdges" aria-hidden>
      <rect width="28" height="18" fill="#FFFFFF" />
      <rect x="0" y="0" width="9" height="18" fill="#2ECC71" />   {/* verde */}
      <rect x="9" y="0" width="10" height="18" fill="#FFFFFF" />  {/* bianco */}
      <rect x="19" y="0" width="9" height="18" fill="#E74C3C" />  {/* rosso */}
      {/* bordo leggero per look più netto su sfondi chiari */}
      <rect x="0.5" y="0.5" width="27" height="17" fill="none" stroke="rgba(15,42,36,0.10)" />
    </svg>
  );
}

function FlagEN() {
  // Union Jack semplificata, geometria “pixel” per maggiore leggibilità
  return (
    <svg width="28" height="18" viewBox="0 0 28 18" shapeRendering="crispEdges" aria-hidden>
      <rect width="28" height="18" fill="#2C5AA0" /> {/* blu */}
      {/* croce bianca */}
      <rect x="0" y="7" width="28" height="4" fill="#FFFFFF" />
      <rect x="12" y="0" width="4" height="18" fill="#FFFFFF" />
      {/* croce rossa */}
      <rect x="0" y="8" width="28" height="2" fill="#E03131" />
      <rect x="13" y="0" width="2" height="18" fill="#E03131" />
      {/* diagonali bianche (semplificate) */}
      <polygon points="0,0 3,0 28,15 28,18 25,18 0,3" fill="#FFFFFF" opacity="0.9" />
      <polygon points="28,0 25,0 0,15 0,18 3,18 28,3" fill="#FFFFFF" opacity="0.9" />
      {/* diagonali rosse sottili */}
      <polygon points="0,0 1.6,0 28,14 28,15.6" fill="#E03131" />
      <polygon points="28,0 26.4,0 0,14 0,15.6" fill="#E03131" />
      {/* bordo */}
      <rect x="0.5" y="0.5" width="27" height="17" fill="none" stroke="rgba(15,42,36,0.10)" />
    </svg>
  );
}

/* ------------------------
   Mute switch (icona stile Mac)
   ------------------------ */

function MuteSwitch({
  muted,
  onToggle,
}: {
  muted: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      title={muted ? "Sound off" : "Sound on"}
      aria-pressed={muted}
      className={`inline-flex items-center justify-center rounded-md border px-2 py-1
        ${muted ? "bg-white border-mac-ink/30" : "bg-white border-mac-ink/15 hover:border-mac-ink/30"}`}
      onMouseDown={(e) => e.preventDefault()}
    >
      {muted ? <IconVolumeOff /> : <IconVolumeOn />}
    </button>
  );
}

function IconVolumeOn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#0F2A24" d="M3 9h4l5-4v14l-5-4H3z" />
      <path fill="#0F2A24" d="M16 8c2 1 2 7 0 8-.6-.4-.6-1.6 0-2 1-1 1-3 0-4-.6-.4-.6-1.6 0-2z" />
      <path fill="#0F2A24" d="M18.5 6.5c3.4 2 3.4 9 0 11-.7-.5-.7-1.7 0-2.2 2.4-1.7 2.4-5 0-6.6-.7-.5-.7-1.7 0-2.2z" />
    </svg>
  );
}

function IconVolumeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
      <path fill="#0F2A24" d="M3 9h4l5-4v14l-5-4H3z" />
      <path stroke="#0F2A24" strokeWidth="2" d="M16 9l5 6M21 9l-5 6" />
    </svg>
  );
}
