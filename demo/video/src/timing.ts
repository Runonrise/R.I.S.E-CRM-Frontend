export const FPS = 60;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export const sec = (s: number) => Math.round(s * FPS);

export const CLIP_FRAMES = {hero: sec(4.234)};

const wipeFrom = sec(6.9);
const wipeDur = sec(1.2);

export const T = {
  c1: {from: 0, dur: sec(1.93)},
  c2: {from: sec(1.93), dur: sec(1.73)},
  c3: {from: sec(3.67), dur: sec(1.67)},
  c4: {from: sec(5.33), dur: sec(2.77)},
  turn: {from: wipeFrom, dur: sec(3.0)},
  hero: {from: sec(9.5), dur: sec(5.5)},
  wipe: {from: wipeFrom, dur: wipeDur},
  total: sec(15),
};
