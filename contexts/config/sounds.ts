// sounds.ts
export const soundConfig = {
  bgm: {
    src: '/audio/bgm.mp3',
    loop: true,
    volume: 0.5,
  },
  rollDice: {
    src: '/audio/shake-and-roll-dice-soundbible.mp3',
    loop: false,
    volume: 1,
  },
  stepDice: {
    src: '/audio/step.wav',
    loop: false,
    volume: 0.7,
  },
  countDown: {
    src: '/audio/stopwatch.wav',
    loop: false,
    volume: 0.7,
  },
  stopDice: {
    src: '/audio/ding.mp3',
    loop: false,
    volume: 1,
  },
};

export type SoundKey = keyof typeof soundConfig;
