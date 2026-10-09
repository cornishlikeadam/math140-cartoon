// Art bible in code: palette, line weights, fonts. Every component imports from here
// so the whole cartoon stays visually consistent.
import { loadFont as loadLuckiest } from "@remotion/google-fonts/LuckiestGuy";
import { loadFont as loadBangers } from "@remotion/google-fonts/Bangers";
import { loadFont as loadFredoka } from "@remotion/google-fonts/Fredoka";

export const FONTS = {
  title: loadLuckiest().fontFamily, // chunky, playful titles
  impact: loadBangers().fontFamily, // comic SFX lettering
  body: loadFredoka("normal", { weights: ["500", "700"] }).fontFamily, // captions & UI
};

export const INK = "#1b1530"; // outline color (very dark purple, never pure black)
export const LINE = 8; // main outline weight (px at 1080p)
export const LINE_THIN = 5;

export const PALETTE = {
  ink: INK,
  white: "#fffdf4",
  paper: "#fff6d8",
  yellow: "#ffd23f",
  orange: "#ff8c1a",
  red: "#ff3b3b",
  pink: "#ff5fa2",
  magenta: "#d63af9",
  purple: "#7b2ff7",
  blue: "#2f80ff",
  cyan: "#22d3ee",
  teal: "#14b8a6",
  green: "#3ddc84",
  lime: "#b6f23a",
  chalk: "#24543f",
  chalkDark: "#173a2b",
  wood: "#c9773a",
  woodDark: "#8f4d1f",
  skinKJ: "#b9774a",
  skinKJShade: "#9a5f37",
  skinProf: "#f2c39b",
  skinProfShade: "#dca27a",
};

export const W = 1920;
export const H = 1080;
export const FPS = 30;

// Shared outline props for SVG shapes.
export const stroke = (w: number = LINE) => ({
  stroke: INK,
  strokeWidth: w,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
});
