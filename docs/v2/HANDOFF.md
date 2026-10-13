# Finish the Math 140 friendly anime version

This branch is the repo-first v2 production refresh requested by Kendren. It contains new artwork, new dialogue, a new six-scene visual assembly, a real VoiceStudio adapter and a portable HyperFrames composition. It is not a completed voiced film. Original v1 media and compositions remain available.

## Start here

1. Read `production/v2/script.json`, `production/v2/art-bible.md`, `production/v2/engine-handoff.json` and `videos/friendly-v2/BRIEF.md`.
2. Run `npm run v2:script:check`, `npm run v2:check` and `npx tsc --noEmit`.
3. Preview `FriendlyV2` or the individual `FriendlyV2-s1` through `FriendlyV2-s6` compositions in Remotion. HyperFrames: `cd videos/friendly-v2 && npm run dev`.

## VoiceStudio is the voice source

Use https://github.com/debpalash/VoiceStudio. The downloaded macOS app was launched during this refresh, but no working backend or generated speech was available. Finish backend/engine setup and check `GET http://127.0.0.1:3900/v1/audio/voices`.

Create/save three distinct synthetic voices. Recipes are in the characters' `voice.design` fields. Use KJ's curious young-adult voice, the professor's calm older voice, and B.O.T.'s bright higher-pitched voice. The OmniVoice attribute vocabulary supports age, gender, pitch and accent; freeform emotional directions are audition notes, not guaranteed engine controls. Do not imitate actors or clone a real speaker from unrelated material.

Copy the settings in `production/v2/voicestudio.env.example` into the root `.env` and set actual saved profile IDs. `npm run v2:audio` generates each WAV, normalizes it to mono 48 kHz, analyzes Rhubarb mouth cues and measures actual timing. No v1 speech or macOS voice fallback is permitted for v2. If a line overflows, shorten the adaptation; do not falsely mark estimated timing measured. `npm run v2:render` checks voice readiness before exporting.

## Finish character acting and sound

The current sprites have one facial pose each. They are not lip-sync rigs, even though the audio pipeline can generate mouth cues. Build separate eyes, viseme mouths, arms and gesture poses based on these sprites. Replace the simple whole-sprite movement with speaking/listening reactions, pointing, checking four dots and warm nods. Check mouth placement at full resolution.

Create a gentle original soundtrack and restrained friendly accents. The legacy 144 BPM theme, impact, scratch and buzzer are intentionally not used in v2. Mix and listen for intelligible dialogue before claiming sound is finished.

## Use the other repositories and engines

OpenMontage is available at `/Users/kjcornish/OpenMontage`, upstream https://github.com/calesthio/OpenMontage. Read its AGENTS.md and AGENT_GUIDE.md, then its `character-animation` pipeline and relevant stage directors. Import this branch as source/reference assets. `production/v2/engine-handoff.json` is explicitly an input packet, not a native validated OpenMontage checkpoint. Use OpenMontage's rig plan, pose library, character reviewer, audio mixing and composition tools; do not fabricate pipeline approval/checkpoint records.

Remotion (`FriendlyV2`) is the working React assembly and supports the original production. HyperFrames (`videos/friendly-v2`) is an independent HTML timeline with six sub-compositions, shared assets and line-level captions. Choose the final acting/render approach after reviewing the proof. Run `npm run v2:export` after measured audio changes so both engines use the same script and timeline.

## Completion evidence

Require real three-character VoiceStudio audio, measured line timing, visible mouth/gesture acting, no missing assets, reviewed scene midpoints, readable math and captions, and an inspected 1920×1080/30 fps/120-second H.264 + AAC output. Record actual audio loudness and peak results. A silent visual proof is not the final film.
