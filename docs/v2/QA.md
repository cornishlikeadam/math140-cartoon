# V2 repository verification — October 13, 2026

- Six scenes, 39 unique lines, contiguous 3,600-frame timeline at 30 fps: passed.
- Seven generated PNG assets are present; transparent character alpha confirmed. Full prompts and source checksums are recorded.
- TypeScript compilation and lint on the changed React components: passed.
- VoiceStudio adapter simulated-service tests: saved profile selection, WAV output, raw cache invalidation when voice profile changes, rejection of aliases and rejection of one profile reused across the cast: passed. Run `npm run v2:test:voice`.
- Six Remotion scene stills and the contact sheet were rendered and visually inspected. The triangle area label was widened after review to prevent cropping.
- HyperFrames 0.8.153: lint 0 errors/0 warnings; runtime 0 errors/0 warnings; layout 0 issues across 9 samples; motion 0 errors/0 warnings; contrast 25/25 pass. A midpoint and end snapshot were inspected.
- Background Studio preview was verified running. This is a local review service, not a published site.
- VoiceStudio live synthesis attempt: blocked because `http://127.0.0.1:3900/v1` has no responding backend. No speech was generated or substituted. The downloaded 0.5.6 desktop app was launched but its setup UI could not be read successfully in this session.
- Final export readiness check correctly rejects missing v2 voice WAVs, mouth cues and estimated timing.

No final video/audio loudness claim is made. The sprites have static facial poses; lip-sync/gesture rigs and the new soundtrack remain production work for the finishing agent. The full HyperFrames folder must travel with its external image assets (background plates exceed the single-file inline threshold).
