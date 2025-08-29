import { PixelBackground } from "@/components/pixel-background";
import { TopBar } from "@/components/topbar";
import { DesktopOS } from "@/components/desktop-os";

export default function Page() {
  return (
    <main className="relative h-dvh overflow-hidden">
      <PixelBackground />
      <TopBar />
      <DesktopOS />
      <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] opacity-70">
        Double-click an icon · Doppio clic su un'icona
      </div>
    </main>
  );
}
