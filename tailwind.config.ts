import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
export default {
  darkMode: ["class"],
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mac: { bg1: "#d9dee7", bg2: "#c9d3e3", bg3: "#b9c6db", ink: "#0f172a", paper: "#f6f8fb" },
        accent: "#39FF14"
      },
      fontFamily: { mono: ["'Press Start 2P'", ...fontFamily.mono] },
      animation: { "fade-in": "fade-in .2s ease both" },
      keyframes: { "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } } }
    }
  },
  plugins: []
} satisfies Config;
