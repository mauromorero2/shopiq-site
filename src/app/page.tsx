// src/app/page.tsx
import Header from "@/components/ui/Header";
import Wallpaper from "@/components/ui/Wallpaper";
import DesktopIcon from "@/components/ui/DesktopIcon";
import WindowChrome from "@/components/ui/WindowChrome";

export default function Page() {
  return (
    <div className="relative h-screen overflow-hidden">
      <Header />

      {/* Wallpaper 1-bit dither */}
      <Wallpaper />

      {/* Right column icons */}
      <div className="absolute right-10 top-28 flex flex-col items-center gap-16">
        <DesktopIcon label="Macintosh HD" kind="disk" />
        <DesktopIcon label="Kid Pix" kind="app" />
      </div>

      {/* Trash in basso a destra */}
      <div className="absolute right-10 bottom-10">
        <DesktopIcon label="Trash" kind="trash" invertLabel />
      </div>

      {/* Finestra principale (dimensioni e proporzioni come nel mock) */}
      <div className="absolute left-[220px] top-[140px]">
        <WindowChrome
          width={760}   // ~ identico al tuo png
          height={420}
          title="System Disk"
          infoLeft="5 items"
          infoCenter="232K in disk"
          infoRight="167K available"
        >
          {/* Slot contenuto (qui placeholder con icone) */}
          <div className="grid grid-cols-3 gap-x-20 gap-y-10 p-6 pt-8">
            <DesktopIcon label="Empty Folder" kind="folder" small />
            <DesktopIcon label="System Folder" kind="folder" small />
            <DesktopIcon label="Disk Copy" kind="disk" small />
            <DesktopIcon label="Font Mover" kind="diamond" small />
            <DesktopIcon label="Fonts" kind="stack" small />
          </div>
        </WindowChrome>
      </div>

      {/* Finestra “sotto” come nel mock */}
      <div className="absolute left-[360px] top-[520px] opacity-100">
        <WindowChrome width={660} height={240} title="" hideTitleLines>
          <div className="p-6" />
        </WindowChrome>
      </div>
    </div>
  );
}
