---
name: cartoon-producer
description: >-
  Converts a screenplay into a complete, rendered 2D cartoon production using
  Remotion, Rhubarb Lip Sync, Manim, and FFmpeg. Use when the user supplies a
  script/screenplay and wants a finished animated video (character dialogue,
  lip sync, math animations, music, captions, final MP4), or asks to re-time,
  re-voice, re-render, or QA an existing cartoon production.
---

# Cartoon Producer

Turn a script into a finished animation through **six gated stages**. Each stage
has a concrete output file; never start a stage until the previous stage's output
exists and passes its check. Never present a placeholder or storyboard as the
finished video — if a dependency (API key, asset, tool) is missing, stop and
report the blocker explicitly.

## Default delivery spec

Unless the user overrides it: **1920×1080, 30 fps, H.264 (yuv420p) + AAC MP4**.
Total duration is fixed up front (e.g. 3600 frames = 120.000 s) and every scene
has an exact frame range. Scene boundaries are authoritative; dialogue is fitted
to scenes, never the other way round.

## Toolchain (macOS)

| Tool | Purpose | Install / check |
| --- | --- | --- |
| Remotion (`npx remotion`) | Animation, editing, render | `npm i` in project |
| Rhubarb Lip Sync | Mouth cues from WAV | `rhubarb --version` (installed to `~/.local/opt/rhubarb`, symlinked in `~/.local/bin`) |
| Manim CE | Math explainer clips | `uv tool install manim` (needs `brew install pkgconf cairo pango`; LaTeX via `brew install --cask basictex`) |
| FFmpeg / ffprobe | Audio conversion, music/SFX synthesis, validation | `brew install ffmpeg` |
| TTS provider | Voices | `ELEVENLABS_API_KEY` or `OPENAI_API_KEY` in `.env`; fallback macOS `say` |

Run `npm run doctor` (scripts/doctor.mjs) before stage 3 to verify all tools.

## Project layout (convention)

```
production/
  screenplay.md          # human-authored source dialogue (never auto-edited)
  script.json            # Stage 1 output — single source of truth for timing
  storyboard.md          # Stage 1/2 output — shot list per scene
  art-bible.md           # Stage 2 output — palette, line rules, character specs
public/
  audio/voice/<lineId>.wav       # Stage 3
  audio/lipsync/<lineId>.json    # Stage 3 (Rhubarb)
  audio/music/*.wav, audio/sfx/*.wav  # Stage 5
  manim/<clip>.mp4               # Stage 4
src/
  data/timeline.json     # generated: frame-accurate line placement
  characters/            # KJ, Professor, BOT … (SVG/React, viseme-driven mouths)
  components/            # Camera, SpeechBubble, Effects, Transitions, Typography, LipSync
  scenes/Scene<N>.tsx    # one composition per scene (for previews)
  Main.tsx               # full timeline composition
scripts/                 # pipeline scripts (voice, lipsync, timing, audio, qa)
out/                     # previews and final MP4
```

## Stage 1 — Screenwriting → `production/script.json`

1. Read `production/screenplay.md`. Preserve meaning and wording; only trim for
   time and mark trims in `storyboard.md`.
2. Split into the agreed scenes with exact `startFrame`/`endFrame`.
3. For every line record: `id` (`s<scene>_l<nn>`), `speaker`, `text`,
   `emotion` (one of the character's expression set), optional `action`, `sfx`,
   `math` (Manim clip id) and `gapAfter` (seconds).
4. Estimate speech time at ~2.6 words/s; a scene's dialogue must fit in
   ≤ 90 % of its duration. If it does not, shorten and log the change.
5. Write a per-scene shot list in `storyboard.md` (camera, staging, effects).

Check: `node scripts/validate-script.mjs` — scene ranges contiguous, sum to the
total, unique line ids, known speakers/emotions.

## Stage 2 — Art direction → character sheets & backgrounds

- Write `art-bible.md`: palette, outline weight, shape language per character.
- Build characters as parameterised React/SVG components so they are 100 %
  consistent: props `expression`, `viseme` (Rhubarb A–H, X), `pose`, `blink`,
  `squash`, `facing`. Thick wobbly outlines come from an SVG turbulence filter
  (`<BoilFilter>`) that re-seeds every 3 frames ("line boil").
- Backgrounds are React/SVG components per location with parallax layers.
- Render a **character sheet still** for review:
  `npx remotion still CharacterSheet out/character-sheet.png`.
- Never copy existing proprietary characters; designs must be original.

## Stage 3 — Voice production → WAV + lip-sync JSON

1. `npm run voices` → `scripts/voice.mjs` reads `script.json`, calls the TTS
   provider per line with the character's configured voice, writes
   `public/audio/voice/<id>.wav` (48 kHz mono, loudness-normalised to −16 LUFS).
   Imported recordings with the same filename are kept and not regenerated.
2. `npm run lipsync` → runs
   `rhubarb -f json --extendedShapes GHX -d <dialog.txt> <wav>` per line
   (the dialog text improves accuracy) → `public/audio/lipsync/<id>.json`.
3. `npm run timing` → measures each WAV with ffprobe, places lines inside their
   scene (scene start + lead-in, sequential, `gapAfter`), and writes
   `src/data/timeline.json`. Fails loudly if any scene overflows.

## Stage 4 — Animation → scene compositions

- Each scene is a component reading its lines from `timeline.json`.
- Talking character: `<LipSync cues>` maps current frame → viseme; the
  non-speaking characters react (blinks, head turns, emotion changes).
- Use springs + squash-and-stretch for every entrance/exit; no static talking
  heads — every shot has camera motion (`<Camera>` keyframes: pan/zoom/shake).
- Math explainers: `scripts/manim/*.py` rendered at 1920×1080/30 fps with a
  transparent or matching background, embedded via `<OffthreadVideo>` inside a
  chalkboard/screen frame. Remotion-native math is acceptable for simple text.
- Preview each scene before full render:
  `npx remotion render Scene<N> out/previews/scene<N>.mp4 --scale=0.5`
  and/or stills at key frames. Inspect them (view the frames) and fix issues.

## Stage 5 — Editing → complete timeline

- `src/Main.tsx` sequences the scene compositions at their exact frames, with
  transitions (`@remotion/transitions` or custom wipes) that do **not** shift
  scene boundaries (overlap inside the outgoing scene's tail).
- `npm run audio` generates original music bed and SFX (FFmpeg synthesis) or
  uses licensed files placed in `public/audio/music|sfx`.
- Music ducks under dialogue (volume callback: ~0.10 under speech, ~0.30
  otherwise). Dialogue must stay intelligible.
- Burned-in captions from `timeline.json` (word-highlight optional), titles
  per scene, animated typography for key terms.

## Stage 6 — Quality assurance → final MP4

1. `npm run qa:pre` — every line has WAV + lip-sync JSON, every referenced
   asset exists, no scene overflow, timeline total == target frames.
2. Render: `npx remotion render Main out/final.mp4 --codec=h264
   --pixel-format=yuv420p --audio-codec=aac`.
3. `npm run qa:post` — ffprobe asserts: 1920×1080, 30/1 fps, h264, frame count
   == target, duration == target ±1 frame, audio stream present; FFmpeg
   `loudnorm` analysis reports integrated loudness ≈ −16 LUFS, no clipping
   (true peak < −1 dBTP). Extracts a contact sheet `out/contact-sheet.png`
   (one frame per 5 s) for visual review.
4. Report results honestly, listing anything not done.

## Changing things later

- **Dialogue**: edit `screenplay.md` → update `script.json` → `npm run voices
  && npm run lipsync && npm run timing` → re-render.
- **Scene duration**: change `startFrame/endFrame` in `script.json` (keep the
  total), re-run `npm run timing`.
- **Character design**: edit `src/characters/<Name>.tsx`; keep the props API.
