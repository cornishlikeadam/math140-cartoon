# Math 140 — AI vs. the Human Brain
> A 120-second (3,600 frames @ 30 FPS) educational cartoon animated in **Remotion**, powered by **Rhubarb Lip Sync**, **Manim Community**, and **FFmpeg**.

Inspired by early-2000s American Saturday morning television animation with hand-drawn line-boil, expressive characters, and rapid-fire visual comedy.

---

## 🎬 Project Overview

- **Format:** 1920 × 1080 (Full HD), 30 FPS, H.264 (yuv420p) + AAC Stereo.
- **Duration:** Exactly 120.000s (3,600 frames).
- **Core Characters:**
  - **KJ:** Energetic college student and interviewer in orange "140" hoodie.
  - **The Professor:** Intelligent, approachable, mildly sarcastic mathematician with purple argyle vest and round glasses.
  - **B.O.T.:** Enthusiastic floating robot with an animated LED matrix face and a running "HUMAN OVERSIGHT" censor bar gag.

---

## 🏗 Six Production Stages (`cartoon-producer` Skill)

The workflow is governed by the `cartoon-producer` skill located in `.agents/skills/cartoon-producer/SKILL.md`:

| Stage | Automated Task | Output |
|---|---|---|
| **1. Screenwriting** | Divide adapted dialogue into 6 timed scenes | `production/script.json`, `production/storyboard.md` |
| **2. Art Direction** | Character rigs, SVG line-boil filter, backgrounds | `src/characters/`, `src/backgrounds/`, `src/theme.ts` |
| **3. Voice Production** | Per-line TTS generation, Rhubarb phoneme sync, frame placement | `public/audio/voice/*.wav`, `public/audio/lipsync/*.json`, `src/data/timeline.json` |
| **4. Animation** | Manim math explainers, scene compositions, camera motion | `public/manim/*.mp4`, `src/scenes/Scene1..6.tsx` |
| **5. Sound & Editing** | Original 144 BPM theme music bed (ducked), cartoon SFX library, captions | `public/audio/music/`, `public/audio/sfx/`, `src/Main.tsx` |
| **6. Quality Assurance** | Frame-exact ffprobe validation, loudness normalization (−16 LUFS), contact sheet | `out/final.mp4`, `out/contact-sheet.png` |

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have the required tools installed on your operating system:
- **Node.js** v20+
- **FFmpeg & ffprobe** (`brew install ffmpeg`)
- **Rhubarb Lip Sync** (`rhubarb --version`)
- **Manim Community** (`manim --version`)

To verify your environment:
```bash
npm run doctor
```

### 2. Configure Voices & Automation API
Copy the `.env.example` file:
```bash
cp .env.example .env
```
Open `.env` and add your ElevenLabs API key:
```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```
*(If no API key is set, the system automatically falls back to macOS built-in voices via `say`).*

### 3. Generate Audio & Lip Sync
To re-run voice generation, Rhubarb lip sync, and frame-accurate timing:
```bash
npm run produce:audio
```

### 4. Render Math Animations (Manim)
```bash
npm run manim
```

### 5. Preview in Remotion Studio
```bash
npm run dev
```

### 6. Export Full Video & Run QA
```bash
npm run render
npm run qa:post
```
The final exported video will be saved to `out/final.mp4`.

---

## 🛠 How to Customize & Extend

### 1. Modifying Dialogue
1. Edit the source screenplay in `production/screenplay.md`.
2. Update the corresponding lines in `production/script.json`.
3. Re-generate voices, lip sync, and timeline:
   ```bash
   npm run produce:audio
   ```
4. Re-render:
   ```bash
   npm run render
   ```

### 2. Changing Scene Durations
1. Open `production/script.json`.
2. Adjust `startFrame` and `endFrame` for the scenes (maintaining the total 3,600 frames).
3. Update `src/Main.tsx` and `src/Root.tsx` sequence frame boundaries.
4. Run `npm run timing` to re-align dialogue within the new boundaries.

### 3. Replacing or Styling Characters
- **KJ:** `src/characters/KJ.tsx`
- **Professor:** `src/characters/Professor.tsx`
- **B.O.T.:** `src/characters/BOT.tsx`
- **Common Rig Parts (Viseme mouths, eyes, limbs):** `src/characters/parts.tsx`

---

## 📜 Scene Timeline

- **Scene 1 — The Big Question** (00:00 – 00:15 / Frames 0–450)
- **Scene 2 — The Five Rules** (00:15 – 00:45 / Frames 450–1350)
- **Scene 3 — Where Students Struggle** (00:45 – 01:05 / Frames 1350–1950)
- **Scene 4 — When AI Gets It Wrong** (01:05 – 01:25 / Frames 1950–2550)
- **Scene 5 — The Experiment** (01:25 – 01:45 / Frames 2550–3150)
- **Scene 6 — The Final Verdict** (01:45 – 02:00 / Frames 3150–3600)

---

## 📄 License
UNLICENSED — Math 140 AI Learning Research
