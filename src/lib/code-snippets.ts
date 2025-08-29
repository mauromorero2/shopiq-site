export const SNIPPET = `import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "ShopIQ",
    message: "We Build, You Sell.",
  });
}

/** Zustand UI store */
type Section = "home" | "services" | "about" | "blog" | "contact";

export const createUI = () => ({
  section: "home" as Section,
  lang: "it" as "it" | "en",
  muted: false,
  setSection: (s: Section) => {},
});

/** Simple React component */
export default function Card({ title }: { title: string }) {
  return <div className="rounded border px-4 py-3">{title}</div>;
}
`;
