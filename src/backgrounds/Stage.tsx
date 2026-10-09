import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BoilDefs } from "../components/Boil";
import { INK, PALETTE, stroke } from "../theme";
import { BG_SVG_STYLE, BG_VIEWBOX, wobblyPoly } from "./sketch";

const HORIZON = 790;
const VP: [number, number] = [960, 330];

const THEMES = {
  magenta: {
    deep: "#2a0648",
    mid: "#8a1fc4",
    hot: "#f06bff",
    rayA: "#b52ee6",
    rayB: "#7d1bb8",
    floorA: "#ff5fa2",
    floorB: "#5b1491",
    curtain: "#e02f6b",
    curtainDark: "#9c1846",
    accent: PALETTE.yellow,
  },
  blue: {
    deep: "#061538",
    mid: "#1d4fc2",
    hot: "#5fe6ff",
    rayA: "#2f80ff",
    rayB: "#1a47b0",
    floorA: PALETTE.cyan,
    floorB: "#123a8f",
    curtain: "#2b49d6",
    curtainDark: "#18288a",
    accent: PALETTE.lime,
  },
};

export const Stage: React.FC<{ hue?: "magenta" | "blue" }> = ({ hue = "magenta" }) => {
  const frame = useCurrentFrame();
  const T = THEMES[hue];
  const id = (s: string) => `stage-${hue}-${s}`;
  const rot = frame * 0.25;
  const blink = Math.floor(frame / 8);

  // starburst wedges
  const rays = Array.from({ length: 28 }, (_, i) => {
    const a0 = (i / 28) * Math.PI * 2;
    const a1 = ((i + 1) / 28) * Math.PI * 2;
    const R = 2000;
    return `M 0 0 L ${Math.cos(a0) * R} ${Math.sin(a0) * R} L ${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`;
  });

  // marquee arch: semi-ellipse
  const archCx = 960;
  const archBaseY = 800;
  const archRx = 820;
  const archRy = 700;
  const archPt = (t: number): [number, number] => {
    const a = Math.PI + t * Math.PI; // left base -> top -> right base
    return [archCx + Math.cos(a) * archRx, archBaseY + Math.sin(a) * archRy];
  };
  const archPath = (rx: number, ry: number) =>
    `M ${archCx - rx} ${archBaseY} A ${rx} ${ry} 0 0 1 ${archCx + rx} ${archBaseY}`;
  const bulbs = Array.from({ length: 34 }, (_, i) => archPt(0.02 + (i / 33) * 0.96));

  // perspective checker floor
  const rows = 7;
  const rowY = (r: number) => HORIZON + (1180 - HORIZON) * Math.pow(r / rows, 1.5);
  const colX = (c: number, y: number) => {
    const xh = 960 + c * 150;
    return VP[0] + (xh - VP[0]) * ((y - VP[1]) / (HORIZON - VP[1]));
  };
  const cells: { d: string; on: boolean }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = -14; c < 14; c++) {
      const y0 = rowY(r);
      const y1 = rowY(r + 1);
      cells.push({
        d: `M ${colX(c, y0)} ${y0} L ${colX(c + 1, y0)} ${y0} L ${colX(c + 1, y1)} ${y1} L ${colX(c, y1)} ${y1} Z`,
        on: (r + c + 100) % 2 === 0,
      });
    }
  }

  const curtain = (side: 1 | -1) => {
    const x0 = side === -1 ? -200 : 2120;
    const x1 = side === -1 ? 70 : 1850;
    return wobblyPoly(
      [
        [x0, -120],
        [x1 + side * -10, -120],
        [x1 + side * 40, 300],
        [x1 - side * 10, 620],
        [x1 + side * 30, 820],
        [x0, 820],
      ],
      "curt" + side,
      6,
    );
  };

  return (
    <AbsoluteFill>
      <svg viewBox={BG_VIEWBOX} style={BG_SVG_STYLE}>
        <BoilDefs />
        <defs>
          <radialGradient id={id("bg")} cx="960" cy="380" r="1300" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={T.hot} />
            <stop offset="0.35" stopColor={T.mid} />
            <stop offset="1" stopColor={T.deep} />
          </radialGradient>
          <radialGradient id={id("fade")} cx="960" cy="380" r="1250" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={T.hot} stopOpacity={0.6} />
            <stop offset="0.5" stopColor={T.deep} stopOpacity={0} />
            <stop offset="1" stopColor={T.deep} stopOpacity={0.85} />
          </radialGradient>
          <linearGradient id={id("spot")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={id("gloss")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.45} />
            <stop offset="0.3" stopColor="#ffffff" stopOpacity={0.05} />
            <stop offset="1" stopColor={T.deep} stopOpacity={0.5} />
          </linearGradient>
          <radialGradient id={id("bulb")} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#fffbe0" />
            <stop offset="0.4" stopColor={PALETTE.yellow} stopOpacity={0.8} />
            <stop offset="1" stopColor={PALETTE.yellow} stopOpacity={0} />
          </radialGradient>
          <clipPath id={id("archClip")}>
            <path d={archPath(archRx - 40, archRy - 40) + " Z"} />
          </clipPath>
        </defs>

        {/* backdrop + rotating starburst */}
        <rect x={-200} y={-120} width={2320} height={1320} fill={`url(#${id("bg")})`} />
        <g transform={`translate(960 380) rotate(${rot})`} opacity={0.55}>
          {rays.map((d, i) => (
            <path key={i} d={d} fill={i % 2 === 0 ? T.rayA : T.rayB} />
          ))}
        </g>
        <rect x={-200} y={-120} width={2320} height={1320} fill={`url(#${id("fade")})`} />

        {/* inner glowing star + rings behind center */}
        <g opacity={0.5} fill="none" stroke="#ffffff" strokeWidth={6}>
          <circle cx={960} cy={380} r={240} strokeDasharray="4 26" strokeLinecap="round" transform={`rotate(${-rot * 2} 960 380)`} />
          <circle cx={960} cy={380} r={330} strokeDasharray="40 30" opacity={0.6} transform={`rotate(${rot * 1.5} 960 380)`} />
        </g>

        {/* glossy checker floor */}
        <g>
          <rect x={-200} y={HORIZON} width={2320} height={420} fill={T.floorB} />
          {cells
            .filter((c) => c.on)
            .map((c, i) => (
              <path key={i} d={c.d} fill={T.floorA} />
            ))}
          <rect x={-200} y={HORIZON} width={2320} height={420} fill={`url(#${id("gloss")})`} />
          {/* reflection streaks */}
          <g fill="#ffffff" opacity={0.18}>
            <path d="M 700 800 L 780 800 L 640 1180 L 520 1180 Z" />
            <path d="M 1180 800 L 1220 800 L 1400 1180 L 1330 1180 Z" />
          </g>
        </g>

        {/* line-art: arch, curtains, stage lip */}
        <g filter="url(#boil)">
          {/* back wall riser behind floor */}
          <path d={wobblyPoly([[-200, HORIZON - 30], [2120, HORIZON - 30], [2120, HORIZON + 6], [-200, HORIZON + 6]], "lip", 3)} fill={T.curtainDark} {...stroke(7)} />
          {/* marquee arch band */}
          <path d={archPath(archRx + 40, archRy + 40)} fill="none" stroke={INK} strokeWidth={98} />
          <path d={archPath(archRx + 40, archRy + 40)} fill="none" stroke={T.accent === PALETTE.yellow ? PALETTE.red : PALETTE.blue} strokeWidth={84} />
          <path d={archPath(archRx, archRy)} fill="none" stroke={INK} strokeWidth={7} opacity={0.6} />
          {/* arch feet / pillars */}
          {[-1, 1].map((s) => (
            <path
              key={s}
              d={wobblyPoly(
                [
                  [archCx + s * (archRx + 40) - 70, archBaseY - 40],
                  [archCx + s * (archRx + 40) + 70, archBaseY - 40],
                  [archCx + s * (archRx + 40) + 90, archBaseY + 30],
                  [archCx + s * (archRx + 40) - 90, archBaseY + 30],
                ],
                "foot" + s,
                3,
              )}
              fill={T.accent}
              {...stroke(7)}
            />
          ))}
        </g>

        {/* bulbs (not boiled so glow stays crisp) */}
        {bulbs.map(([x, y], i) => {
          const r = (i + blink) % 2 === 0;
          const [ox, oy] = [x + (x - archCx) * (40 / archRx), y + (y - archBaseY) * (40 / archRy)];
          return (
            <g key={i}>
              {r && <circle cx={ox} cy={oy} r={34} fill={`url(#${id("bulb")})`} />}
              <circle cx={ox} cy={oy} r={14} fill={r ? "#fffbe0" : "#8a6a2a"} stroke={INK} strokeWidth={5} />
            </g>
          );
        })}

        {/* spotlight cones */}
        <g style={{ mixBlendMode: "screen" }}>
          <path d="M 120 -100 L 260 -100 L 820 1050 L 380 1050 Z" fill={`url(#${id("spot")})`} />
          <path d="M 1800 -100 L 1660 -100 L 1100 1050 L 1540 1050 Z" fill={`url(#${id("spot")})`} />
          <path d="M 900 -100 L 1020 -100 L 1240 1000 L 680 1000 Z" fill={`url(#${id("spot")})`} opacity={0.6} />
          <ellipse cx={600} cy={1010} rx={240} ry={40} fill="#ffffff" opacity={0.18} />
          <ellipse cx={1320} cy={1010} rx={240} ry={40} fill="#ffffff" opacity={0.18} />
          <ellipse cx={960} cy={975} rx={300} ry={40} fill="#ffffff" opacity={0.12} />
        </g>

        <g filter="url(#boil)">
          {/* curtains */}
          {([-1, 1] as const).map((s) => (
            <g key={s}>
              <path d={curtain(s)} fill={T.curtain} {...stroke(8)} />
              {[0.25, 0.5, 0.75].map((f, k) => {
                const x = s === -1 ? -200 + 270 * f : 2120 - 270 * f;
                return <path key={k} d={`M ${x} -100 Q ${x + s * 12} 340 ${x - s * 6} 800`} fill="none" stroke={T.curtainDark} strokeWidth={7} strokeLinecap="round" />;
              })}
            </g>
          ))}
          {/* top valance with scallops */}
          <path
            d={
              "M -200 -120 L 2120 -120 L 2120 20 " +
              Array.from({ length: 12 }, (_, i) => {
                const x1 = 2120 - (i + 1) * (2320 / 12);
                return `Q ${x1 + 2320 / 24} 90 ${x1} 20`;
              }).join(" ") +
              " Z"
            }
            fill={T.curtain}
            {...stroke(8)}
          />
          <path d="M -200 -40 L 2120 -40" stroke={T.accent} strokeWidth={14} />
          <path d="M -200 -40 L 2120 -40" stroke={INK} strokeWidth={4} transform="translate(0 -9)" />
          <path d="M -200 -40 L 2120 -40" stroke={INK} strokeWidth={4} transform="translate(0 9)" />
          {/* spotlight cans */}
          {[190, 1730, 960].map((x, i) => (
            <g key={i} transform={`translate(${x} ${i === 2 ? 40 : 60}) rotate(${i === 0 ? -25 : i === 1 ? 25 : 0})`}>
              <path d="M -38 -40 L 38 -40 L 50 30 L -50 30 Z" fill="#3a3355" {...stroke(6)} />
              <ellipse cx={0} cy={30} rx={50} ry={14} fill="#fffbe0" {...stroke(6)} />
            </g>
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};
