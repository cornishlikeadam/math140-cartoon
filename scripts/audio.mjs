// Stage 5a — Original music + cartoon SFX, synthesised from scratch (no samples,
// no licensing issues). Writes 48 kHz stereo WAVs to public/audio/music and
// public/audio/sfx.
//
// Music: 144 BPM, 4/4 → one bar = 5/3 s, so 120 s = 72 bars and every scene
// boundary (15/45/65/85/105 s) lands exactly on a bar line. The section map below
// gives each scene its own arrangement/energy.
//
// Usage: node scripts/audio.mjs [--music-only|--sfx-only]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ok, p, run } from "./lib.mjs";

const SR = 48000;
const TAU = Math.PI * 2;
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- deterministic noise ----------
let seed = 1337;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const noise = () => rnd() * 2 - 1;

// ---------- buffer + WAV ----------
class Buf {
  constructor(seconds) {
    this.n = Math.ceil(seconds * SR);
    this.L = new Float32Array(this.n);
    this.R = new Float32Array(this.n);
  }
  add(i, v, pan = 0) {
    if (i < 0 || i >= this.n) return;
    this.L[i] += v * Math.min(1, 1 - pan);
    this.R[i] += v * Math.min(1, 1 + pan);
  }
}

function writeWav(file, buf, { peakDb = -1, softClip = true } = {}) {
  let peak = 0;
  for (let i = 0; i < buf.n; i++) {
    if (softClip) { buf.L[i] = Math.tanh(buf.L[i]); buf.R[i] = Math.tanh(buf.R[i]); }
    peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  }
  const gain = peak > 0 ? Math.pow(10, peakDb / 20) / peak : 1;
  const data = Buffer.alloc(buf.n * 4);
  for (let i = 0; i < buf.n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf.L[i] * gain)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf.R[i] * gain)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

// ---------- instruments (all additive into a Buf) ----------
const env = (t, a, d, s, dur, r) =>
  t < a ? t / a : t < a + d ? 1 - (1 - s) * ((t - a) / d) : t < dur ? s : Math.max(0, s * (1 - (t - dur) / r));

function bass(b, t0, m, dur, vol = 0.32) {
  const f = mtof(m), n = Math.ceil((dur + 0.05) * SR), i0 = Math.round(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR, ph = (f * t) % 1;
    const tri = 1 - 4 * Math.abs(ph - 0.5);
    const v = Math.tanh(2.2 * (tri + 0.3 * Math.sin(TAU * f * t))) * env(t, 0.004, 0.08, 0.55, dur, 0.04);
    b.add(i0 + k, v * vol);
  }
}

function stab(b, t0, ms, dur = 0.11, vol = 0.07, pan = -0.35) {
  const n = Math.ceil((dur + 0.08) * SR), i0 = Math.round(t0 * SR);
  for (const m of ms) {
    const f = mtof(m);
    for (let k = 0; k < n; k++) {
      const t = k / SR;
      let v = 0;
      for (let h = 1; h <= 7; h += 2) v += Math.sin(TAU * f * h * t) / h; // soft square
      b.add(i0 + k, v * vol * env(t, 0.003, 0.06, 0.35, dur, 0.06), pan);
    }
  }
}

function marimba(b, t0, m, vol = 0.16, pan = 0.3, decay = 0.35) {
  const f = mtof(m), n = Math.ceil(decay * 4 * SR), i0 = Math.round(t0 * SR);
  for (let k = 0; k < n; k++) {
    const t = k / SR;
    const v = Math.sin(TAU * f * t) * Math.exp(-t / decay) + 0.3 * Math.sin(TAU * f * 3.98 * t) * Math.exp(-t / (decay * 0.2));
    b.add(i0 + k, v * vol * Math.min(1, t / 0.002), pan);
  }
}

function kick(b, t0, vol = 0.55) {
  const n = Math.ceil(0.32 * SR), i0 = Math.round(t0 * SR);
  let ph = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, f = 45 + 110 * Math.exp(-t / 0.03);
    ph += f / SR;
    b.add(i0 + k, Math.sin(TAU * ph) * Math.exp(-t / 0.11) * vol);
  }
}

function snare(b, t0, vol = 0.28) {
  const n = Math.ceil(0.22 * SR), i0 = Math.round(t0 * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, w = noise();
    lp += 0.35 * (w - lp);
    const v = (w - lp) * Math.exp(-t / 0.07) + 0.5 * Math.sin(TAU * 190 * t) * Math.exp(-t / 0.03);
    b.add(i0 + k, v * vol, 0.05);
  }
}

function hat(b, t0, vol = 0.07, len = 0.04) {
  const n = Math.ceil(len * 4 * SR), i0 = Math.round(t0 * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, w = noise();
    lp += 0.6 * (w - lp);
    b.add(i0 + k, (w - lp) * Math.exp(-t / len) * vol, 0.4);
  }
}

function crash(b, t0, vol = 0.18, len = 1.2) {
  const n = Math.ceil(len * 3 * SR), i0 = Math.round(t0 * SR);
  let lp = 0;
  for (let k = 0; k < n; k++) {
    const t = k / SR, w = noise();
    lp += 0.5 * (w - lp);
    b.add(i0 + k, (w - lp) * Math.exp(-t / len) * vol, (k % 2 ? 0.2 : -0.2));
  }
}

// ---------- music ----------
function makeMusic() {
  const BPM = 144, beat = 60 / BPM, bar = beat * 4, e8 = beat / 2;
  const totalBars = 72;
  const b = new Buf(totalBars * bar + 2);

  const MAJ = [[48, "M"], [45, "m"], [41, "M"], [43, "M"]]; // C Am F G
  const MIN = [[45, "m"], [41, "M"], [38, "m"], [40, "M"]]; // Am F Dm E
  const tones = (root, q) => (q === "M" ? [0, 4, 7] : [0, 3, 7]).map((x) => root + x);

  // Section map in bars (matches the six scenes).
  const sections = [
    { from: 0, to: 9, prog: MAJ, energy: 2, name: "big-question" },
    { from: 9, to: 27, prog: MAJ, energy: 3, name: "five-rules" },
    { from: 27, to: 39, prog: MAJ, energy: 1, name: "struggle" },
    { from: 39, to: 51, prog: MIN, energy: 2, name: "ai-wrong" },
    { from: 51, to: 63, prog: MAJ, energy: 3, name: "experiment", hats16: true },
    { from: 63, to: 72, prog: MAJ, energy: 3, name: "verdict", finale: true },
  ];
  const motifA = [0, 2, null, 1, 3, null, 2, 4];
  const motifB = [5, null, 4, 3, null, 2, 1, null];
  const fill = [3, 4, 5, 4, 3, 2, 1, 0];

  for (const s of sections) {
    for (let barIdx = s.from; barIdx < s.to; barIdx++) {
      const t = barIdx * bar;
      const local = barIdx - s.from;
      const isLastBar = barIdx === totalBars - 1;
      if (s.finale && isLastBar) {
        // Big ending hit.
        const [root, q] = s.prog[0];
        kick(b, t, 0.7); crash(b, t, 0.3, 1.6);
        bass(b, t, 36 + (root % 12), 1.4, 0.4);
        stab(b, t, tones(60 + (root % 12), q).concat(72 + (root % 12)), 1.3, 0.09, 0);
        for (const m of [72, 76, 79, 84]) marimba(b, t, m, 0.12, 0, 0.6);
        continue;
      }
      const [root, q] = s.prog[local % 4];
      const chord = tones(root, q);
      const bassRoot = 36 + (((root - 36) % 12) + 12) % 12;
      const ext = [0, 1, 2].map((i) => chord[i] + 24).concat([0, 1, 2].map((i) => chord[i] + 36));

      // Section entry accent.
      if (local === 0) crash(b, t, s.energy >= 2 ? 0.16 : 0.08, 1.0);

      // Bass: bouncy 8ths (half-notes when energy is low).
      const bassPat = [0, 0, 12, 0, 7, 0, 12, 7];
      for (let k = 0; k < 8; k++) {
        if (s.energy === 1 && k % 4 !== 0) continue;
        bass(b, t + k * e8, bassRoot + bassPat[k], s.energy === 1 ? beat * 1.8 : e8 * 0.7);
      }
      // Off-beat chord stabs.
      if (s.energy >= 2) for (let k = 1; k < 8; k += 2) stab(b, t + k * e8, chord.map((m) => m + 12));
      // Melody.
      const motif = local % 4 === 3 ? fill : local % 2 === 0 ? motifA : motifB;
      motif.forEach((d, k) => {
        if (d === null) return;
        marimba(b, t + k * e8, ext[d], s.energy === 1 ? 0.13 : 0.15, 0.3, s.energy === 1 ? 0.5 : 0.3);
      });
      // Drums.
      for (let k = 0; k < 4; k++) {
        if (k === 0 || (k === 2 && s.energy >= 2)) kick(b, t + k * beat);
        if ((k === 1 || k === 3) && s.energy >= 2) snare(b, t + k * beat);
      }
      if (s.energy >= 2 && local % 4 === 3) kick(b, t + 3.5 * beat, 0.4); // push into next phrase
      const hatStep = s.hats16 ? e8 / 2 : e8;
      if (s.energy >= 2) for (let x = 0; x < bar - 1e-6; x += hatStep) hat(b, t + x, s.hats16 ? 0.05 : 0.07);
      else for (let k = 1; k < 8; k += 2) hat(b, t + k * e8, 0.04);
    }
  }
  // Fade-in 0.25 s.
  for (let i = 0; i < 0.25 * SR; i++) { const g = i / (0.25 * SR); b.L[i] *= g; b.R[i] *= g; }
  // Trim to exactly 120 s.
  b.n = Math.round(120 * SR);
  return b;
}

// ---------- SFX ----------
function tone(seconds, fn, pan = 0) {
  const b = new Buf(seconds);
  const st = { ph: 0, lp: 0, lp2: 0 };
  for (let k = 0; k < b.n; k++) b.add(k, fn(k / SR, st), pan);
  return b;
}
const osc = (st, f, key = "ph") => { st[key] = (st[key] ?? 0) + f / SR; return st[key]; };

const SFX = {
  boing: () => tone(0.7, (t, s) => {
    const f = 160 * (1 + 0.9 * Math.min(t / 0.08, 1)) * (1 + 0.18 * Math.sin(TAU * 14 * t) * Math.exp(-3 * t));
    return Math.sin(TAU * osc(s, f)) * Math.exp(-4.5 * t) * Math.min(1, t / 0.004);
  }),
  pop: () => tone(0.1, (t, s) => Math.sin(TAU * osc(s, 900 * Math.exp(-t / 0.02) + 180)) * Math.exp(-t / 0.025)),
  whoosh: () => tone(0.55, (t, s) => {
    const x = t / 0.55, c = 0.02 + 0.35 * Math.sin(Math.PI * x);
    s.lp += c * (noise() - s.lp); s.lp2 += c * (s.lp - s.lp2);
    return (s.lp - s.lp2 * 0.6) * Math.sin(Math.PI * x) ** 2 * 2.5;
  }),
  ding: () => tone(1.6, (t, s) => {
    const f = 1318.5;
    return (Math.sin(TAU * f * t) + 0.45 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-3 * t) + 0.2 * Math.sin(TAU * f * 5.4 * t) * Math.exp(-6 * t)) * Math.exp(-2.2 * t);
  }),
  buzzer: () => tone(0.65, (t, s) => {
    const sq = (f) => (Math.sin(TAU * f * t) > 0 ? 1 : -1);
    return (sq(110) + sq(116.5)) * 0.4 * env(t, 0.01, 0.05, 0.9, 0.55, 0.08);
  }),
  bonk: () => tone(0.35, (t, s) => {
    s.lp += 0.2 * (noise() - s.lp);
    return Math.sin(TAU * osc(s, 120 + 280 * Math.exp(-t / 0.03))) * Math.exp(-t / 0.08) + s.lp * Math.exp(-t / 0.015) * 2;
  }),
  slide_up: () => tone(0.75, (t, s) => Math.sin(TAU * osc(s, 380 * Math.pow(4, t / 0.7) * (1 + 0.02 * Math.sin(TAU * 7 * t)))) * env(t, 0.03, 0.1, 0.8, 0.65, 0.08)),
  slide_down: () => tone(0.75, (t, s) => Math.sin(TAU * osc(s, 1500 * Math.pow(0.25, t / 0.7) * (1 + 0.02 * Math.sin(TAU * 7 * t)))) * env(t, 0.03, 0.1, 0.8, 0.65, 0.08)),
  sparkle: () => {
    const b = new Buf(0.9);
    for (let i = 0; i < 9; i++) {
      const t0 = i * 0.07 + rnd() * 0.02, f = 2000 + rnd() * 2500, i0 = Math.round(t0 * SR);
      for (let k = 0; k < 0.25 * SR; k++) { const t = k / SR; b.add(i0 + k, Math.sin(TAU * f * t) * Math.exp(-t / 0.05) * 0.5, rnd() - 0.5); }
    }
    return b;
  },
  robot_beep: () => {
    const b = new Buf(0.5);
    [988, 1319, 1175].forEach((f, i) => {
      const i0 = Math.round(i * 0.13 * SR);
      for (let k = 0; k < 0.1 * SR; k++) { const t = k / SR; b.add(i0 + k, (Math.sin(TAU * f * t) > 0 ? 0.35 : -0.35) * env(t, 0.003, 0.02, 0.8, 0.08, 0.015)); }
    });
    return b;
  },
  compute: () => {
    const b = new Buf(1.3);
    for (let i = 0; i < 16; i++) {
      const f = 600 + Math.floor(rnd() * 8) * 150, i0 = Math.round(i * 0.075 * SR);
      for (let k = 0; k < 0.05 * SR; k++) { const t = k / SR; b.add(i0 + k, (Math.sin(TAU * f * t) > 0 ? 0.25 : -0.25) * env(t, 0.002, 0.01, 0.7, 0.04, 0.008), (i % 2) * 0.4 - 0.2); }
    }
    return b;
  },
  tada: () => {
    const b = new Buf(1.8);
    const brass = (t0, ms, dur) => ms.forEach((m) => {
      const f = mtof(m), i0 = Math.round(t0 * SR);
      for (let k = 0; k < (dur + 0.3) * SR; k++) {
        const t = k / SR; let v = 0;
        for (let h = 1; h <= 8; h++) v += Math.sin(TAU * f * h * t * (1 + 0.003 * Math.sin(TAU * 5 * t))) / (h * 1.3);
        b.add(i0 + k, v * 0.12 * env(t, 0.02, 0.1, 0.7, dur, 0.25));
      }
    });
    brass(0, [60, 64, 67], 0.12); brass(0.18, [60, 64, 67, 72], 1.1);
    return b;
  },
  sad_trombone: () => {
    const b = new Buf(2.0);
    [[58, 0, 0.35], [57, 0.4, 0.35], [56, 0.8, 0.35], [55, 1.2, 0.75]].forEach(([m, t0, dur]) => {
      const f = mtof(m), i0 = Math.round(t0 * SR);
      for (let k = 0; k < (dur + 0.1) * SR; k++) {
        const t = k / SR, vib = t > 0.25 ? 1 + 0.015 * Math.sin(TAU * 6 * t) : 1;
        let v = 0; for (let h = 1; h <= 6; h++) v += Math.sin(TAU * f * vib * h * t) / h;
        b.add(i0 + k, v * 0.25 * env(t, 0.03, 0.05, 0.85, dur, 0.08));
      }
    });
    return b;
  },
  drumroll: () => {
    const b = new Buf(2.2);
    for (let x = 0, i = 0; x < 1.5; x += 0.035, i++) snare(b, x, 0.08 + 0.2 * (x / 1.5));
    kick(b, 1.55, 0.7); crash(b, 1.55, 0.35, 0.6);
    return b;
  },
  scratch: () => tone(0.45, (t, s) => {
    const sp = Math.sin(TAU * 7 * t);
    s.lp += (0.05 + 0.25 * Math.abs(sp)) * (noise() - s.lp);
    return (s.lp * 3 + 0.3 * Math.sin(TAU * osc(s, 300 + 900 * Math.abs(sp)))) * env(t, 0.005, 0.05, 0.8, 0.38, 0.06);
  }),
  impact: () => {
    const b = new Buf(1.0);
    kick(b, 0, 0.9); crash(b, 0, 0.25, 0.35);
    for (let k = 0; k < SR; k++) { const t = k / SR; b.add(k, Math.sin(TAU * 55 * t) * Math.exp(-t / 0.25) * 0.5); }
    return b;
  },
  zip: () => tone(0.25, (t, s) => Math.sin(TAU * osc(s, 300 + 3000 * (t / 0.25))) * Math.sin(Math.PI * t / 0.25) * 0.8),
  thud: () => { const b = new Buf(0.5); kick(b, 0, 0.9); return b; },
};

const mode = process.argv[2];
const tmp = os.tmpdir();

if (mode !== "--sfx-only") {
  const raw = path.join(tmp, "music_raw.wav");
  writeWav(raw, makeMusic(), { peakDb: -3 });
  const out = p("public", "audio", "music", "theme.wav");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  // Master the bed to -18 LUFS; Remotion ducks it further under dialogue.
  run("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-18:TP=-2:LRA=9", "-ar", "48000", "-t", "120", out]);
  ok("Music: public/audio/music/theme.wav (120 s, 144 BPM)");
}
if (mode !== "--music-only") {
  for (const [name, make] of Object.entries(SFX)) {
    writeWav(p("public", "audio", "sfx", `${name}.wav`), make(), { peakDb: -3 });
  }
  ok(`SFX: ${Object.keys(SFX).length} files in public/audio/sfx/ (${Object.keys(SFX).join(", ")})`);
}
