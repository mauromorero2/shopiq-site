"use client";
import Draggable from "./Draggable";
import DesktopIcon from "./DesktopIcon";

export default function DraggableIcon({
  label, kind, initialY,
}: {
  label: string;
  kind: "disk" | "app" | "folder" | "trash" | "diamond" | "stack";
  initialY: number;
}) {
  // colonna destra ~ come da mock (offset fisso)
  const colX = typeof window === "undefined" ? 1300 : window.innerWidth - 140;
  return (
    <Draggable initial={{ x: colX, y: initialY }} snap={16}>
      <DesktopIcon label={label} kind={kind} invertLabel />
    </Draggable>
  );
}
