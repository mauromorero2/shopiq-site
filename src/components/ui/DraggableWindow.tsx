"use client";

import { useState } from "react";
import Draggable from "./Draggable";
import WindowChrome from "./WindowChrome";

export default function DraggableWindow({
  title,
  infoLeft,
  infoCenter,
  infoRight,
  width,
  height,
  initial,
  children,
}: {
  title: string;
  infoLeft?: string;
  infoCenter?: string;
  infoRight?: string;
  width: number;
  height: number;
  initial: { x: number; y: number };
  children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(true);

  return (
    <Draggable
      initial={initial}
      snap={8}
      onFocus={() => setFocused(true)}
      className="cursor-default"
    >
      <div onMouseDown={() => setFocused(true)} onPointerDown={() => setFocused(true)}>
        <WindowChrome
          width={width}
          height={height}
          title={title}
          infoLeft={infoLeft}
          infoCenter={infoCenter}
          infoRight={infoRight}
          focused={focused}
        >
          {children}
        </WindowChrome>
      </div>
    </Draggable>
  );
}
