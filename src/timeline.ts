// Typed access to the generated timeline (src/data/timeline.json) plus helpers
// that scenes use to anchor animation to dialogue.
import timelineJson from "./data/timeline.json";

export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";
export type Speaker = "KJ" | "PROF" | "BOT";
export type MouthCue = { start: number; end: number; value: Viseme };

export type Line = {
  id: string;
  speaker: Speaker;
  emotion?: string;
  text: string;
  ttsText?: string;
  localStart: number; // frame relative to scene start
  startFrame: number; // absolute frame
  durationFrames: number;
  durationSec: number;
  audio: string;
  mouthCues: MouthCue[];
  rule?: number;
  gag?: string;
  toCamera?: boolean;
};

export type SceneData = {
  id: string;
  title: string;
  startFrame: number;
  endFrame: number;
  background: string;
  lines: Line[];
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  title: string;
  scenes: SceneData[];
};

export const timeline = timelineJson as unknown as Timeline;

export const getScene = (id: string): SceneData => {
  const s = timeline.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

export const allLines = (): Line[] => timeline.scenes.flatMap((s) => s.lines);

export const getLine = (id: string): Line => {
  const l = allLines().find((x) => x.id === id);
  if (!l) throw new Error(`Unknown line ${id}`);
  return l;
};

/** Scene-local frame where a line starts / ends (optionally offset). */
export const lineStart = (id: string, offset = 0) => getLine(id).localStart + offset;
export const lineEnd = (id: string, offset = 0) => {
  const l = getLine(id);
  return l.localStart + l.durationFrames + offset;
};
/** Frame at a fraction (0..1) through a line, scene-local. */
export const lineAt = (id: string, fraction: number) => {
  const l = getLine(id);
  return Math.round(l.localStart + l.durationFrames * fraction);
};
/** Frame where a given word/phrase of the line is spoken (approximate, by character position). */
export const phraseAt = (id: string, phrase: string) => {
  const l = getLine(id);
  const text = (l.ttsText ?? l.text).toLowerCase();
  const idx = text.indexOf(phrase.toLowerCase());
  if (idx < 0) throw new Error(`Phrase "${phrase}" not in ${id}`);
  return Math.round(l.localStart + l.durationFrames * (idx / text.length));
};

/** The line being spoken by `speaker` at scene-local `frame`, if any. */
export const speakingLine = (scene: SceneData, speaker: Speaker, frame: number) =>
  scene.lines.find(
    (l) => l.speaker === speaker && frame >= l.localStart && frame < l.localStart + l.durationFrames,
  );

/** Most recent line spoken by anyone up to `frame` (for reaction staging). */
export const currentLine = (scene: SceneData, frame: number) =>
  [...scene.lines].reverse().find((l) => frame >= l.localStart);

/** Rhubarb viseme for `speaker` at scene-local `frame` (X = rest). */
export const visemeAt = (scene: SceneData, speaker: Speaker, frame: number, fps: number): Viseme => {
  const l = speakingLine(scene, speaker, frame);
  if (!l) return "X";
  const t = (frame - l.localStart) / fps;
  const cue = l.mouthCues.find((c) => t >= c.start && t < c.end);
  return cue ? cue.value : "X";
};

/** Emotion for `speaker`: their current line's emotion, else their last line's, else fallback. */
export const emotionAt = (scene: SceneData, speaker: Speaker, frame: number, fallback: string) => {
  const mine = scene.lines.filter((l) => l.speaker === speaker && l.localStart <= frame + 4);
  return mine.length ? mine[mine.length - 1].emotion ?? fallback : fallback;
};

/** Mouth-openness 0..1 for a viseme (used to drive head bob / squash while talking). */
export const visemeOpenness: Record<Viseme, number> = {
  X: 0, A: 0.05, B: 0.25, C: 0.6, D: 1, E: 0.55, F: 0.35, G: 0.3, H: 0.5,
};
