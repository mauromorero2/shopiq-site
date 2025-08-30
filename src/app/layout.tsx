// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Jersey_10 } from "next/font/google";

const jersey = Jersey_10({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShopIQ",
  description: "ShopIQ — OS-style UI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="h-full">
      <body
        className={`${jersey.className} h-full text-black bg-white select-none`}
        // rendering “crisp”
        style={{ imageRendering: "pixelated" }}
      >
        {children}
      </body>
    </html>
  );
}
