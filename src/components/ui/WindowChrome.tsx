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
  const tb = 40;
  const ib = 28;
  const stroke = focused ? "#000" : "#000"; // puoi invertire palette se vuoi un “defocus” più leggero

  return (
    <div
      className="bg-white"
      style={{ width, height, border: `2px solid ${stroke}` }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} shapeRendering="crispEdges">
        {/* Titlebar */}
        <rect x={1} y={1} width={width - 2} height={tb - 2} fill="#fff" stroke={stroke} />
        {!hideTitleLines &&
          Array.from({ length: Math.floor((tb - 12) / 4) }).map((_, i) => {
            const y = 6 + i * 4;
            return <line key={i} x1={6} y1={y} x2={width - 6} y2={y} stroke={stroke} />;
          })}
        {/* Bezel centrale */}
        {!!title && (
          <>
            <rect x={width / 2 - 110} y={8} width={220} height={tb - 16} fill="#fff" stroke={stroke} strokeWidth={2} />
            <line x1={width / 2 - 104} y1={14} x2={width / 2 + 104} y2={14} stroke={stroke} />
            <line x1={width / 2 - 104} y1={tb - 14} x2={width / 2 + 104} y2={tb - 14} stroke={stroke} />
          </>
        )}
        {/* Banda info */}
        <rect x={1} y={tb} width={width - 2} height={ib} fill="#fff" stroke={stroke} />
        {/* Contenuto area */}
        <rect x={1} y={tb + ib} width={width - 2} height={height - (tb + ib) - 2} fill="#fff" stroke={stroke} />

        {/* Scrollbar destra */}
        <rect x={width - 32} y={tb + ib + 1} width={30} height={height - (tb + ib) - 34} fill="#fff" stroke={stroke} />
        {/* frecce */}
        <polygon points={`${width - 17},${tb + ib + 8} ${width - 25},${tb + ib + 18} ${width - 9},${tb + ib + 18}`} fill={stroke} />
        <polygon points={`${width - 17},${height - 26} ${width - 25},${height - 36} ${width - 9},${height - 36}`} fill={stroke} />

        {/* Scrollbar bottom */}
        <rect x={1} y={height - 32} width={width - 32} height={30} fill="#fff" stroke={stroke} />
        <polygon points={`12,${height - 17} 22,${height - 9} 22,${height - 25}`} fill={stroke} />
        <polygon points={`${width - 44},${height - 17} ${width - 54},${height - 9} ${width - 54},${height - 25}`} fill={stroke} />

        {/* Grow */}
        <polygon points={`${width - 32},${height - 2} ${width - 2},${height - 2} ${width - 2},${height - 32}`} fill="#fff" stroke={stroke} />
        {Array.from({ length: 4 }).map((_, i) => (
          <line key={i} x1={width - 8 - i * 6} y1={height - 2} x2={width - 2} y2={height - 8 - i * 6} stroke={stroke} />
        ))}

        {/* Corner widgets */}
        <rect x={3} y={height - 32 - 18} width={18} height={18} fill="#fff" stroke={stroke} />
        <polygon points={`7,${height - 23} 11,${height - 29} 11,${height - 17}`} fill="none" stroke={stroke} />
        <rect x={width - 20} y={height - 32 - 18} width={18} height={18} fill="#fff" stroke={stroke} />
        <polygon points={`${width - 6},${height - 23} ${width - 10},${height - 29} ${width - 10},${height - 17}`} fill="none" stroke={s
