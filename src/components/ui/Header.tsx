// src/components/ui/Header.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import BrainIcon from "@/components/icons/BrainIcon"; // <-- aggiungi questa import

export default function Header() {
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative z-20 h-14 border-b border-black bg-white">
      <div className="mx-4 flex h-full items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Sostituisce l'immagine: */}
          <BrainIcon size={22} className="text-black" />

          <nav className="flex items-center gap-10">
            <Link href="/" className="hover:underline underline-offset-2">ShopIQ</Link>
            <Link href="/servizi" className="hover:underline underline-offset-2">Servizi</Link>
            <Link href="/blog" className="hover:underline underline-offset-2">Blog</Link>
            <Link href="/contatti" className="hover:underline underline-offset-2">Contatti</Link>
          </nav>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-6">
            <button className="hover:underline underline-offset-2">IT</button>
            <button className="hover:underline underline-offset-2">EN</button>
          </div>

          <button
            aria-label={muted ? "Audio disattivato" : "Audio attivo"}
            onClick={() => setMuted(m => !m)}
            className="group relative h-6 w-8"
            title="Mute"
          >
            <div className="absolute left-0 top-1/2 -translate-y-1/2 border border-black h-4 w-3 [clip-path:polygon(0%_0%,100%_25%,100%_75%,0%_100%)]" />
            {muted ? (
              <>
                <div className="absolute left-5 top-1 h-[2px] w-5 bg-black rotate-45" />
                <div className="absolute left-5 bottom-1 h-[2px] w-5 bg-black -rotate-45" />
              </>
            ) : (
              <>
                <div className="absolute left-5 top-0 h-6 w-6 rounded-full border border-black" />
                <div className="absolute left-6 top-1 h-4 w-4 rounded-full border border-black" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
