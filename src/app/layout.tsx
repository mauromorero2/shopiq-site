import "./globals.css";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";

const pressStart = Press_Start_2P({ weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Shop IQ",
  description: "Pixel OS experimental site"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body className={`${pressStart.className} bg-mac-bg3 text-mac-ink overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
