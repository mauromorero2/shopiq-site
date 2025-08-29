"use client";
import { TopBar } from "@/components/topbar";
import { DesktopOS } from "@/components/desktop-os";
import { PixelBackground } from "@/components/pixel-background";
import { BootSequence } from "@/components/boot-sequence";

export default function HomePage() {
  return (
    <>
      <BootSequence />
      <PixelBackground />
      <TopBar />
      <DesktopOS />
    </>
  );
}
