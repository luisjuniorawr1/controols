import type { Metadata } from "next";
import PlaytestAlpha from "./PlaytestAlpha";

export const metadata: Metadata = {
  title: "Playtest Alpha — CONTROOLZ",
  description: "Playtest local do TCG CONTROOLZ.",
  robots: { index: false, follow: false },
};

export default function PlayPage() {
  return <PlaytestAlpha />;
}
