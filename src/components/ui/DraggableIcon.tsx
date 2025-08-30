"use client";

import { useEffect, useState } from "react";
import Draggable from "./Draggable";
import DesktopIcon from "./DesktopIcon";

export default function DraggableIcon({
  label,
  kind,
  initialY,
}: {
  label: string;
  kind: "disk" | "app" | "folder" | "trash" | "diamond" | "stack";
  initialY: number;
}) {
  const [colX, setColX] = useState(0);

  useEffect(() => {
    // colonna destra fissa (simile al mock): 40px dal bordo
    function calc() {
      setColX(window.innerWidth - 140); // uguale a dove le stavi rendendo
    }
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <Draggable
      initial={{ x: colX, y: initialY }}
      snap={16}
      bounds="viewport"
    >
      <DesktopIcon label={label} kind={kind} invertLabel={label.toLowerCase() === "trash"} />
    </Draggable>
  );
}
