"use client";

import React from "react";

/**
 * Titlebar rigata, bezel centrale con doppia riga, banda info,
 * scrollbar larghe e grow box. Tutto 1px “crisp”.
 */
export default function WindowChrome({
  width,
  height,
  title,
  infoLeft,
  infoCenter,
  infoRight,
  hideTitleLines = false,
  focused = true,
  children,
}: {
  width: number;
  height: number;
  title: string;
  infoLeft?: string;
  infoCenter?: string;
  infoRight?: string;
  hideTitleLines?: boolean;
  focused?: boolean;
  children?: React.ReactNode;
}) {
  const tb = 40; // titlebar
  const ib = 28; // info band
  const stroke = "#000"; // puoi alleggerire per la finestra non focalizzata

  return (
    <div
      className="relative bg-white"
      style={{ width, height, border: `2px solid ${stroke}` }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        shapeRendering="crispEdges"
      >
        {/* Titlebar */}
        <rect x={1} y={1} width={width - 2} height={tb - 2} fill="#fff" stroke={stroke} />
        {!hideTitleLines &&
          Array.from({ length: Math.floor((tb - 12) / 4) }).map((_, i) => {
            const y = 6 + i * 4;
            return <line key={i} x1={6} y1={y} x2={width - 6} y2={y} stroke={stroke} />;
          })}

        {/* Bezel centrale con doppia riga */}
        {!!title && (
          <>
            <rect
              x={width / 2 - 110}
              y={8}
              width={220}
              height={tb - 16}
              fill="#fff"
              stroke={stroke}
              strokeWidth={2}
            />
            <line x1={width / 2 - 104} y1={14} x2={width / 2 + 104} y2={14} stroke={stroke} />
            <line x1={width / 2 - 104} y1={tb - 14} x2={width / 2 + 104} y2={tb - 14} stroke={stroke} />
          </>
        )}

        {/* Banda info */}
        <rect x={1} y={tb} width={width - 2} height={ib} fill="#fff" stroke={stroke} />

        {/* Area contenuto */}
        <rect
          x={1}
          y={tb + ib}
          width={width - 2}
          height={height - (tb + ib) - 2}
          fill="#fff"
          stroke={stroke}
        />

        {/* Scrollbar destra */}
        <rect
          x={width - 32}
          y={tb + ib + 1}
          width={30}
          height={height - (tb + ib) - 34}
          fill="#fff"
          stroke={stroke}
        />
        {/* frecce */}
        <polygon
          points={`${width - 17},${tb + ib + 8} ${width - 25},${tb + ib + 18} ${width - 9},${tb + ib + 18}`}
          fill={stroke}
        />
        <polygon
          points={`${width - 17},${height - 26} ${width - 25},${height - 36} ${width - 9},${height - 36}`}
          fill={stroke}
        />

        {/* Scrollbar bottom */}
        <rect x={1} y={height - 32} width={width - 32} height={30} fill="#fff" stroke={stroke} />
        <polygon points={`12,${height - 17} 22,${height - 9} 22,${height - 25}`} fill={stroke} />
        <polygon
          points={`${width - 44},${height - 17} ${width - 54},${height - 9} ${width - 54},${height - 25}`}
          fill={stroke}
        />

        {/* Grow box */}
        <polygon
          points={`${width - 32},${height - 2} ${width - 2},${height - 2} ${width - 2},${height - 32}`}
          fill="#fff"
          stroke={stroke}
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1={width - 8 - i * 6}
            y1={height - 2}
            x2={width - 2}
            y2={height - 8 - i * 6}
            stroke={stroke}
          />
        ))}

        {/* Corner widgets */}
        {/* bottom-left */}
        <rect x={3} y={height - 32 - 18} width={18} height={18} fill="#fff" stroke={stroke} />
        <polygon points={`7,${height - 23} 11,${height - 29} 11,${height - 17}`} fill="none" stroke={stroke} />
        {/* bottom-right (sopra grow) */}
        <rect x={width - 20} y={height - 32 - 18} width={18} height={18} fill="#fff" stroke={stroke} />
        <polygon
          points={`${width - 6},${height - 23} ${width - 10},${height - 29} ${width - 10},${height - 17}`}
          fill="none"
          stroke={stroke}
        />
        {/* top-right dell’area contenuto */}
        <rect x={width - 20} y={tb + ib + 2} width={18} height={18} fill="#fff" stroke={stroke} />
        <polygon
          points={`${width - 11},${tb + ib + 6} ${width - 17},${tb + ib + 10} ${width - 5},${tb + ib + 10}`}
          fill="none"
          stroke={stroke}
        />
      </svg>

      {/* Titolo (Jersey 10) */}
      {!!title && (
        <div
          className="absolute text-[18px] leading-none"
          style={{ left: width / 2 - 100, top: 12, width: 200, textAlign: "center" }}
        >
          {title}
        </div>
      )}

      {/* Banda info (testi) */}
      <div className="absolute top-[40px] flex w-full items-center justify-between px-3 text-[16px] leading-none">
        <span>{infoLeft}</span>
        <span>{infoCenter}</span>
        <span>{infoRight}</span>
      </div>

      {/* Contenuto */}
      <div
        className="absolute"
        style={{
          left: 1,
          top: tb + 28,
          width: width - 2,
          height: height - (tb + 28) - 2,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
