// src/components/ui/DesktopIcon.tsx
"use client";

type Kind = "disk" | "app" | "folder" | "trash" | "diamond" | "stack";
export default function DesktopIcon({
  label,
  kind,
  small = false,
  invertLabel = false, // per Trash/Kid Pix: label nera con testo bianco
}: {
  label: string;
  kind: Kind;
  small?: boolean;
  invertLabel?: boolean;
}) {
  const S = small ? 40 : 56;
  return (
    <div className="flex flex-col items-center">
      {/* pittogramma 1-bit minimale, con bordo 2px */}
      <div
        className="relative"
        style={{ width: S, height: S }}
        aria-hidden
        role="img"
      >
        <div className="absolute inset-0 border-2 border-black bg-white" />
        {/* semplici varianti per il mock; sostituibili con SVG custom in seguito */}
        {kind === "disk" && (
          <>
            <div className="absolute left-1/2 top-[55%] h-[18%] w-[40%] -translate-x-1/2 -translate-y-1/2 border border-black" />
            <div className="absolute left-1/2 top-[30%] h-[2px] w-[70%] -translate-x-1/2 bg-black" />
          </>
        )}
        {kind === "app" && (
          <div className="absolute inset-[15%] bg-black/0">
            <div className="absolute inset-0" />
            <div className="absolute left-[20%] right-[20%] top-[20%] bottom-[20%] border border-black" />
          </div>
        )}
        {kind === "folder" && (
          <>
            <div className="absolute left-[8%] right-[8%] top-[28%] bottom-[12%] border-2 border-black" />
            <div className="absolute left-[8%] top-[18%] h-[10%] w-[28%] border-2 border-black" />
          </>
        )}
        {kind === "diamond" && (
          <div className="absolute left-[20%] right-[20%] top-[20%] bottom-[20%] rotate-45 border-2 border-black" />
        )}
        {kind === "stack" && (
          <>
            <div className="absolute inset-[22%] border-2 border-black" />
            <div className="absolute inset-[26%] border-2 border-black translate-y-[6px]" />
          </>
        )}
      </div>

      {/* label: padding uniforme, NIENTE bordo; nero/bianco opzionale */}
      <div
        className={`mt-2 px-2 py-1 text-[14px] leading-none ${
          invertLabel ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {label}
      </div>
    </div>
  );
}
