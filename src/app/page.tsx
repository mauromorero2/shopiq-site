// src/app/page.tsx
import Header from "@/components/ui/Header";
import Wallpaper from "@/components/ui/Wallpaper";
import DraggableIcon from "@/components/ui/DraggableIcon";
import DraggableWindow from "@/components/ui/DraggableWindow";
import DesktopIcon from "@/components/ui/DesktopIcon";

export default function Page() {
  return (
    <div className="relative h-screen overflow-hidden">
      <Header />
      <Wallpaper />

      {/* Colonna destra — icone draggabili con snap */}
      <DraggableIcon label="Macintosh HD" kind="disk" initialY={200} />
      <DraggableIcon label="Kid Pix" kind="app" initialY={320} />
      {/* valore fisso lato server; poi l’utente la può trascinare */}
      <DraggableIcon label="Trash" kind="trash" initialY={760} />

      {/* Finestra frontale — draggabile */}
      <DraggableWindow
        title="System Disk"
        infoLeft="5 items"
        infoCenter="232K in disk"
        infoRight="167K available"
        width={760}
        height={420}
        initial={{ x: 220, y: 140 }}
      >
        <div className="grid grid-cols-3 gap-x-20 gap-y-10 p-6 pt-8">
          <DesktopIcon label="Empty Folder" kind="folder" small />
          <DesktopIcon label="System Folder" kind="folder" small />
          <DesktopIcon label="Disk Copy" kind="disk" small />
          <DesktopIcon label="Font Mover" kind="diamond" small />
          <DesktopIcon label="Fonts" kind="stack" small />
        </div>
      </DraggableWindow>

      {/* Finestra “sotto” — draggabile */}
      <DraggableWindow title="" width={660} height={240} initial={{ x: 360, y: 520 }}>
        <div className="p-6" />
      </DraggableWindow>
    </div>
  );
}
