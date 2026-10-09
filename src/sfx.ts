// Type-safe references to synthesized cartoon SFX
export const SFX = {
  boing: "audio/sfx/boing.wav",
  bonk: "audio/sfx/bonk.wav",
  buzzer: "audio/sfx/buzzer.wav",
  compute: "audio/sfx/compute.wav",
  ding: "audio/sfx/ding.wav",
  drumroll: "audio/sfx/drumroll.wav",
  impact: "audio/sfx/impact.wav",
  pop: "audio/sfx/pop.wav",
  robot_beep: "audio/sfx/robot_beep.wav",
  sad_trombone: "audio/sfx/sad_trombone.wav",
  scratch: "audio/sfx/scratch.wav",
  slide_down: "audio/sfx/slide_down.wav",
  slide_up: "audio/sfx/slide_up.wav",
  sparkle: "audio/sfx/sparkle.wav",
  tada: "audio/sfx/tada.wav",
  thud: "audio/sfx/thud.wav",
  whoosh: "audio/sfx/whoosh.wav",
  zip: "audio/sfx/zip.wav",
} as const;

export type SfxName = keyof typeof SFX;
