import { create } from "zustand";
export type Section = "home" | "services" | "about" | "blog" | "contact";
type UI = {
  section: Section; setSection: (s: Section) => void;
  reduceMotion: boolean; setReduceMotion: (v: boolean) => void;
  muted: boolean; setMuted: (v: boolean) => void;
  lang: "it"|"en"; setLang: (l: "it"|"en") => void;
};
export const useUI = create<UI>((set)=> ({
  section: "home", setSection: (section)=> set({ section }),
  reduceMotion: false, setReduceMotion: (reduceMotion)=> set({ reduceMotion }),
  muted: false, setMuted: (muted)=> set({ muted }),
  lang: "it", setLang: (lang)=> set({ lang }),
}));
