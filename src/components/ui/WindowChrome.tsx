// src/components/ui/WindowChrome.tsx
"use client";

import React from "react";

/**
 * Finestra 1-bit: titlebar rigata, bezel centrale con doppia riga,
 * banda info “5 items…”, scrollbars larghe e grow box. Tutte le linee 1px.
 * Usa SVG con shapeRendering="crispEdges" per evitare blur.
 */
export default function WindowChrome({
  width,
  height,
  title,
  infoLeft,
  infoCenter,
  infoRight,
  hideTitleLines = false,
  children,
}: {
  width: number;
  height: number;
  title: string;
  infoLeft?: string;
  infoCenter?: string;
  infoRight?: string;
  hideTitleLines?: boolean;
  children?: React.ReactNode;
}) {
  const tb = 40; // titlebar
  const ib = 28; // info band

  return (
    <div
      className="bg-white"
      style={{
        width,
        height,
        boxShadow: "none",
        border: "2px solid #000",
      }}
    >
      {/* Chrome in SVG per controllo pixel-perfetto */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        shapeRendering="crispEdges"
      >
        {/* Titlebar area */}
        <rect x={1} y={1} width={width - 2} height={tb - 2} fill="#fff" stroke="#000" />
        {/* Strisce orizzontali (dense) su tutta la barra */}
        {!hideTitleLines &&
          Array.from({ length: Math.floor((tb - 12) / 4) }).map((_, i) => {
            const y = 6 + i * 4;
            return <line key={i} x1={6} y1={y} x2={width - 6} y2={y} stroke="#000" />;
          })}

        {/* Bezel centrale con doppia riga sopra/sotto */}
        {title && (
          <>
            <rect
              x={width / 2 - 110}
              y={8}
              width={220}
              height={tb - 16}
              fill="#fff"
              stroke="#000"
              strokeWidth={2}
            />
            <line x1={width / 2 - 104} y1={14} x2={width / 2 + 104} y2={14} stroke="#000" />
            <line
              x1={width / 2 - 104}
              y1={tb - 14}
              x2={width / 2 + 104}
              y2={tb - 14}
              stroke="#000"
            />
          </>
        )}

        {/* Banda info sotto la titlebar */}
        <rect x={1} y={tb} width={width - 2} height={ib} fill="#fff" stroke="#000" />

        {/* Contenuto area (bordo) */}
        <rect
          x={1}
          y={tb + ib}
          width={width - 2}
          height={height - (tb + ib) - 2}
          fill="#fff"
          stroke="#000"
        />

        {/* Scrollbar destra */}
        <rect
          x={width - 32}
          y={tb + ib + 1}
          width={30}
          height={height - (tb + ib) - 34}
          fill="#fff"
          stroke="#000"
        />
        {/* frecce */}
        <polygon
          points={`${width - 17},${tb + ib + 8} ${width - 25},${tb + ib + 18} ${width - 9},${
            tb + ib + 18
          }`}
          fill="#000"
        />
        <polygon
          points={`${width - 17},${height - 26} ${width - 25},${height - 36} ${width - 9},${
            height - 36
          }`}
          fill="#000"
        />

        {/* Scrollbar bottom */}
        <rect
          x={1}
          y={height - 32}
          width={width - 32}
          height={30}
          fill="#fff"
          stroke="#000"
        />
        <polygon
          points={`12,${height - 17} 22,${height - 9} 22,${height - 25}`}
          fill="#000"
        />
        <polygon
          points={`${width - 44},${height - 17} ${width - 54},${height - 9} ${width - 54},${
            height - 25
          }`}
          fill="#000"
        />

        {/* Grow box diagonale */}
        <polygon
          points={`${width - 32},${height - 2} ${width - 2},${height - 2} ${width - 2},${
            height - 32
          }`}
          fill="#fff"
          stroke="#000"
        />
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={i}
            x1={width - 8 - i * 6}
            y1={height - 2}
            x2={width - 2}
            y2={height - 8 - i * 6}
            stroke="#000"
          />
        ))}

        {/* Corner widgets (come nel mock) */}
        {/* bottom-left */}
        <rect x={3} y={height - 32 - 18} width={18} height={18} fill="#fff" stroke="#000" />
        <polygon
          points={`7,${height - 23} 11,${height - 29} 11,${height - 17}`}
          fill="none"
          stroke="#000"
        />
        {/* bottom-right (sopra grow) */}
        <rect
          x={width - 20}
          y={height - 32 - 18}
          width={18}
          height={18}
          fill="#fff"
          stroke="#000"
        />
        <polygon
          points={`${width - 6},${height - 23} ${width - 10},${height - 29} ${width - 10},${
            height - 17
          }`}
          fill="none"
          stroke="#000"
        />
        {/* top-right dell’area contenuto */}
        <rect x={width - 20} y={tb + ib + 2} width={18} height={18} fill="#fff" stroke="#000" />
        <polygon
          points={`${width - 11},${tb + ib + 6} ${width - 17},${tb + ib + 10} ${width - 5},${
            tb + ib + 10
          }`}
          fill="none"
          stroke="#000"
        />
      </svg>

      {/* Testi overlay (così usano Jersey 10 e restano perfettamente centrati) */}
      {/* Titolo */}
      {title && (
        <div
          className="absolute text-[18px] leading-none"
          style={{
            left: width / 2 - 100,
            top: 12,
            width: 200,
            textAlign: "center",
          }}
        >
          {title}
        </div>
      )}

      {/* Banda info */}
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
