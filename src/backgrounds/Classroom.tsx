import React from "react";
import { AbsoluteFill, random } from "remotion";
import { BoilDefs } from "../components/Boil";
import { FONTS, INK, PALETTE, stroke } from "../theme";
import { BG_SVG_STYLE, BG_VIEWBOX, jitter, wobblyLine, wobblyPoly, wobblyRect } from "./sketch";

const CEIL = 92; // bottom edge of the ceiling strip
const HORIZON = 790; // where the wall meets the floor
const VP: [number, number] = [960, 260]; // floor vanishing point

/** Jagged hole in the ceiling around x≈1150; `amt` 0..1 grows it from a crack to a full hole. */
const CeilingCrack: React.FC<{ amt: number }> = ({ amt }) => {
  if (amt <= 0) return null;
  const cx = 1150;
  const cy = 10;
  const n = 14;
  const holeR = Math.max(0, (amt - 0.2) / 0.8); // hole opens after initial cracking
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const spike = i % 2 === 0 ? 1 : 0.68 + random("ck" + i) * 0.15;
    const rx = 210 * holeR * spike;
    const ry = 120 * holeR * spike;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  const cracks = [
    [-1, 0.25, 290],
    [-0.6, 1, 230],
    [0.15, 1, 260],
    [0.8, 0.9, 210],
    [1, 0.15, 300],
    [-0.9, 0.7, 180],
  ];
  return (
    <g>
      {holeR > 0.01 && (
        <g>
          {/* dark attic/sky behind */}
          <path d={wobblyPoly(pts, "hole", 3)} fill="#120a2a" {...stroke(7)} />
          {holeR > 0.4 && (
            <g opacity={Math.min(1, (holeR - 0.4) * 2)}>
              <circle cx={cx - 60} cy={cy - 30} r={5} fill={PALETTE.yellow} />
              <circle cx={cx + 70} cy={cy - 10} r={4} fill={PALETTE.white} />
              <circle cx={cx + 10} cy={cy - 60} r={3} fill={PALETTE.white} />
              {/* broken beam ends poking into the hole */}
              <path
                d={`M ${cx - 210 * holeR} ${cy - 40} L ${cx - 90 * holeR} ${cy - 50} L ${cx - 110 * holeR} ${cy - 30} L ${cx - 80 * holeR} ${cy - 20} L ${cx - 210 * holeR} ${cy - 10} Z`}
                fill={PALETTE.woodDark}
                {...stroke(5)}
              />
              <path
                d={`M ${cx + 210 * holeR} ${cy + 20} L ${cx + 100 * holeR} ${cy + 25} L ${cx + 120 * holeR} ${cy + 40} L ${cx + 90 * holeR} ${cy + 55} L ${cx + 210 * holeR} ${cy + 55} Z`}
                fill="#d8cdb0"
                {...stroke(5)}
              />
            </g>
          )}
        </g>
      )}
      {/* crack lines radiating out across ceiling and wall */}
      {cracks.map(([dx, dy, len], i) => {
        const L = len * Math.min(1, amt * 1.6);
        const sx = cx + dx * 150 * holeR;
        const sy = cy + dy * 80 * holeR;
        const mx = sx + dx * L * 0.5 + jitter("cm" + i, 25);
        const my = sy + dy * L * 0.5 * 0.6 + jitter("cn" + i, 15);
        const ex = sx + dx * L;
        const ey = sy + dy * L * 0.6;
        return (
          <path
            key={i}
            d={`M ${sx} ${sy} L ${mx} ${my} L ${(mx + ex) / 2 + jitter("co" + i, 20)} ${(my + ey) / 2 + 10} L ${ex} ${ey}`}
            fill="none"
            {...stroke(5)}
          />
        );
      })}
    </g>
  );
};

export const Classroom: React.FC<{ crack?: number }> = ({ crack = 0 }) => {
  // floor plank lines converging to VP
  const plankLines: string[] = [];
  for (let x0 = -1400; x0 <= 3400; x0 += 150) {
    const t = (1180 - VP[1]) / (HORIZON - VP[1]);
    const xb = VP[0] + (x0 / 1 - VP[0]) * 1;
    const hx = VP[0] + (xb - VP[0]) * ((HORIZON - VP[1]) / (1180 - VP[1]));
    plankLines.push(wobblyLine(hx, HORIZON, VP[0] + (hx - VP[0]) * t, 1180, "pl" + x0, 4));
  }
  const seams = [835, 900, 990, 1110];

  const wallStrokes = Array.from({ length: 46 }, (_, i) => {
    const x = -140 + random("wx" + i) * 2200;
    const y = CEIL + 40 + random("wy" + i) * (HORIZON - CEIL - 100);
    const len = 30 + random("wl" + i) * 50;
    return `M ${x} ${y} q ${len / 2} ${-8 + random("wq" + i) * 16} ${len} ${jitter("wz" + i, 6)}`;
  });

  return (
    <AbsoluteFill>
      <svg viewBox={BG_VIEWBOX} style={BG_SVG_STYLE}>
        <BoilDefs />
        <defs>
          <linearGradient id="classroom-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffe066" />
            <stop offset="1" stopColor="#ffab3d" />
          </linearGradient>
          <linearGradient id="classroom-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b8642c" />
            <stop offset="1" stopColor="#e08c48" />
          </linearGradient>
          <linearGradient id="classroom-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4fb6ff" />
            <stop offset="1" stopColor="#b9ecff" />
          </linearGradient>
          <radialGradient id="classroom-board" cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="#2e6a50" />
            <stop offset="1" stopColor={PALETTE.chalkDark} />
          </radialGradient>
        </defs>

        {/* ---------- big flat fills ---------- */}
        <rect x={-200} y={-120} width={2320} height={HORIZON + 120} fill="url(#classroom-wall)" />
        <rect x={-200} y={HORIZON} width={2320} height={500} fill="url(#classroom-floor)" />
        <rect x={-200} y={-120} width={2320} height={CEIL + 120} fill="#f3e6c4" />
        {/* ceiling tiles */}
        <g opacity={0.5}>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={wobblyLine(-160 + i * 150, -100, -160 + i * 150 + 20, CEIL, "ct" + i, 3)} stroke="#c9b88f" strokeWidth={4} fill="none" />
          ))}
          <path d={wobblyLine(-160, 0, 2080, 0, "ctl", 4)} stroke="#c9b88f" strokeWidth={4} fill="none" />
        </g>

        {/* wall texture & vertical stripe pattern */}
        <g opacity={0.35} fill="none" stroke="#e8892a" strokeWidth={4} strokeLinecap="round">
          {wallStrokes.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <rect x={-200} y={560} width={2320} height={HORIZON - 560} fill="#ff9a3d" opacity={0.55} />

        {/* ---------- outlined line-art ---------- */}
        <g filter="url(#boil)">
          {/* ceiling molding + chair rail + baseboard */}
          <path d={wobblyRect(-180, CEIL - 6, 2280, 26, "mold", 3)} fill="#fff1c9" {...stroke(6)} />
          <path d={wobblyRect(-180, 548, 2280, 22, "rail", 3)} fill={PALETTE.wood} {...stroke(6)} />
          <path d={wobblyRect(-180, HORIZON - 34, 2280, 40, "base", 3)} fill={PALETTE.woodDark} {...stroke(7)} />
        </g>

        {/* floor planks */}
        <g fill="none" stroke={PALETTE.woodDark} strokeWidth={5} strokeLinecap="round" opacity={0.7}>
          {plankLines.map((d, i) => (
            <path key={i} d={d} />
          ))}
          {seams.map((y, i) => (
            <path key={"s" + i} d={wobblyLine(-160, y, 2080, y, "seam" + i, 3)} />
          ))}
        </g>
        <g fill="#ffd9a8" opacity={0.25}>
          <path d="M 300 1180 L 620 820 L 760 820 L 560 1180 Z" />
          <path d="M 1300 1180 L 1150 820 L 1250 820 L 1480 1180 Z" />
        </g>

        <g filter="url(#boil)">
          {/* --- left window --- */}
          <path d={wobblyRect(-130, 150, 330, 360, "winf", 4)} fill={PALETTE.wood} {...stroke(8)} />
          <path d={wobblyRect(-108, 172, 286, 316, "wing", 3)} fill="url(#classroom-sky)" {...stroke(6)} />
          <path d="M 2 220 q 20 -40 60 -20 q 30 -30 64 4 q 34 0 30 30 q -2 22 -30 22 l -120 0 q -30 -6 -4 -36 z" fill={PALETTE.white} {...stroke(5)} />
          <circle cx={-40} cy={250} r={34} fill={PALETTE.yellow} {...stroke(5)} />
          <path d={wobblyLine(35, 172, 35, 488, "wmul", 2)} {...stroke(8)} />
          <path d={wobblyLine(-108, 330, 178, 330, "wmul2", 2)} {...stroke(8)} />
          <path d={wobblyRect(-145, 505, 360, 30, "sill", 3)} fill={PALETTE.woodDark} {...stroke(7)} />
          {/* little potted plant on sill */}
          <path d="M 130 505 l 8 -48 l 50 0 l 8 48 z" fill={PALETTE.red} {...stroke(5)} />
          <path d="M 162 457 q -30 -40 -10 -70 q 20 20 10 70 M 162 457 q 10 -50 40 -60 q 6 30 -40 60 M 162 457 q -40 -10 -50 -40 q 30 -4 50 40" fill={PALETTE.green} {...stroke(5)} />

          {/* --- chalkboard --- */}
          <path d={wobblyRect(270, 140, 840, 430, "cbf", 5)} fill={PALETTE.wood} {...stroke(9)} />
          <path d={wobblyRect(298, 166, 784, 376, "cbb", 4)} fill="url(#classroom-board)" {...stroke(6)} />
          <path d={wobblyRect(250, 555, 880, 26, "tray", 3)} fill={PALETTE.woodDark} {...stroke(7)} />
          <rect x={380} y={544} width={50} height={12} rx={5} fill={PALETTE.white} {...stroke(4)} />
          <rect x={460} y={546} width={36} height={10} rx={5} fill={PALETTE.pink} {...stroke(4)} />
          <path d={wobblyRect(900, 538, 80, 20, "eraser", 2)} fill={PALETTE.blue} {...stroke(5)} />
        </g>
        {/* chalk doodles (soft, not boiled to stay legible) */}
        <g fill="none" stroke="#e9f5e9" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={0.55}>
          <path d="M 360 470 L 560 470 L 360 300 Z" />
          <path d="M 360 445 L 385 445 L 385 470" />
          <circle cx={900} cy={330} r={95} />
          <path d="M 900 330 L 985 290" />
          <circle cx={900} cy={330} r={5} fill="#e9f5e9" />
        </g>
        <g fill="#e9f5e9" opacity={0.6} fontFamily={FONTS.body} fontWeight={700}>
          <text x={590} y={260} fontSize={58}>
            a²+b²=c²
          </text>
          <text x={945} y={300} fontSize={36}>
            r
          </text>
          <text x={340} y={290} fontSize={30}>
            c
          </text>
          <text x={450} y={505} fontSize={30}>
            b
          </text>
          <text x={600} y={470} fontSize={42} opacity={0.7}>
            π ≈ 3.14
          </text>
        </g>

        <g filter="url(#boil)">
          {/* --- clock --- */}
          <circle cx={1290} cy={235} r={78} fill={PALETTE.red} {...stroke(8)} />
          <circle cx={1290} cy={235} r={60} fill={PALETTE.white} {...stroke(5)} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={1290 + Math.cos(a) * 48} cy={235 + Math.sin(a) * 48} r={4} fill={INK} />;
          })}
          <path d="M 1290 235 L 1290 194 M 1290 235 L 1320 248" {...stroke(7)} />
          <circle cx={1290} cy={235} r={7} fill={INK} />

          {/* --- MATH 140 pennant --- */}
          <path d="M 1450 170 Q 1640 186 1820 230 Q 1640 262 1452 300 Q 1440 236 1450 170 Z" fill={PALETTE.purple} {...stroke(8)} />
          <path d="M 1438 160 L 1438 312" {...stroke(9)} stroke={PALETTE.woodDark} />
          <path d="M 1438 160 L 1438 312" fill="none" stroke={INK} strokeWidth={14} opacity={0} />
          <text x={1480} y={258} fontFamily={FONTS.title} fontSize={52} fill={PALETTE.yellow} stroke={INK} strokeWidth={4} paintOrder="stroke" transform="rotate(3 1600 240)">
            MATH 140
          </text>

          {/* --- poster on right wall --- */}
          <path d={wobblyRect(1880, 140, 190, 260, "post", 5)} fill={PALETTE.cyan} {...stroke(7)} />
          <path d="M 1975 190 L 1925 300 L 2025 300 Z" fill={PALETTE.yellow} {...stroke(5)} />
          <text x={1975} y={370} textAnchor="middle" fontFamily={FONTS.title} fontSize={40} fill={PALETTE.white} stroke={INK} strokeWidth={3} paintOrder="stroke">
            ∑ !
          </text>

          {/* --- low bookshelf against right wall --- */}
          <path d={wobblyRect(1880, 560, 220, 210, "shelf", 4)} fill={PALETTE.wood} {...stroke(8)} />
          <path d={wobblyLine(1880, 665, 2100, 665, "sh1", 2)} {...stroke(6)} />
          {Array.from({ length: 6 }, (_, i) => {
            const cols = [PALETTE.red, PALETTE.blue, PALETTE.green, PALETTE.yellow, PALETTE.pink, PALETTE.cyan];
            const x = 1896 + i * 30;
            const h = 72 + random("bk" + i) * 18;
            return <path key={i} d={wobblyRect(x, 664 - h, 26, h, "bk" + i, 2)} fill={cols[i]} {...stroke(5)} />;
          })}
          {Array.from({ length: 5 }, (_, i) => {
            const cols = [PALETTE.purple, PALETTE.orange, PALETTE.teal, PALETTE.magenta, PALETTE.lime];
            const x = 1896 + i * 34;
            const h = 66 + random("bl" + i) * 22;
            return <path key={i} d={wobblyRect(x, 768 - h, 30, h, "bl" + i, 2)} fill={cols[i]} {...stroke(5)} />;
          })}

          {/* --- teacher's desk (low, right side) --- */}
          <path d={wobblyRect(1400, 690, 430, 210, "desk", 5)} fill={PALETTE.woodDark} {...stroke(8)} />
          <path d={wobblyRect(1440, 730, 160, 140, "dk1", 3)} fill={PALETTE.wood} {...stroke(6)} />
          <path d={wobblyRect(1630, 730, 160, 140, "dk2", 3)} fill={PALETTE.wood} {...stroke(6)} />
          <circle cx={1520} cy={800} r={8} fill={PALETTE.yellow} {...stroke(4)} />
          <circle cx={1710} cy={800} r={8} fill={PALETTE.yellow} {...stroke(4)} />
          <path d={wobblyRect(1380, 664, 470, 34, "dtop", 4)} fill={PALETTE.wood} {...stroke(8)} />
          {/* books + apple on desk */}
          <path d={wobblyRect(1440, 632, 150, 32, "db1", 2)} fill={PALETTE.blue} {...stroke(6)} />
          <path d={wobblyRect(1452, 604, 126, 30, "db2", 2)} fill={PALETTE.green} {...stroke(6)} />
          <path d="M 1720 664 q -40 -6 -36 -44 q 6 -34 36 -24 q 30 -10 36 24 q 4 38 -36 44 z" fill={PALETTE.red} {...stroke(6)} />
          <path d="M 1720 598 q 2 -16 -4 -26 M 1720 590 q 18 -18 32 -6 q -14 14 -32 6" fill={PALETTE.green} {...stroke(5)} />
          {/* pencil cup */}
          <path d="M 1790 664 l -6 -60 l 44 0 l -6 60 z" fill={PALETTE.cyan} {...stroke(6)} />
          <path d="M 1796 604 l -8 -40 M 1808 604 l 4 -46 M 1818 604 l 12 -36" stroke={PALETTE.yellow} strokeWidth={9} strokeLinecap="round" />

          {/* ceiling crack */}
          <CeilingCrack amt={crack} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
