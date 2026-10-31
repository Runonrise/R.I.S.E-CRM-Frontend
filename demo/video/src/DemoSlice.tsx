import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {Backdrop} from './components/Backdrop';
import {ClutterTable} from './components/ClutterTable';
import {HeroInFrame} from './scenes/HeroInFrame';
import {ProblemCard} from './scenes/ProblemCard';
import {SunriseTurn} from './scenes/SunriseTurn';
import {C} from './theme';
import {T, sec} from './timing';

const SLANT = 160;
const BAND = 620;

export const DemoSlice: React.FC = () => {
  const frame = useCurrentFrame();

  const edge = interpolate(frame, [T.wipe.from, T.wipe.from + T.wipe.dur], [-260, 2400], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wiping = frame >= T.wipe.from && frame < T.wipe.from + T.wipe.dur;
  const turnDone = frame >= T.wipe.from + T.wipe.dur;

  const clutterOpacity = interpolate(
    frame,
    [T.c3.from, T.c3.from + sec(0.33), T.c4.from + T.c4.dur - sec(0.67), T.c4.from + T.c4.dur],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{background: C.obsidian}}>
      <Backdrop />

      <AbsoluteFill style={{opacity: clutterOpacity}}>
        <ClutterTable />
      </AbsoluteFill>

      <Sequence from={T.c1.from} durationInFrames={T.c1.dur}>
        <ProblemCard text="Ever find out a client left?" durationInFrames={T.c1.dur} />
      </Sequence>
      <Sequence from={T.c2.from} durationInFrames={T.c2.dur}>
        <ProblemCard text="After they left..." durationInFrames={T.c2.dur} />
      </Sequence>
      <Sequence from={T.c3.from} durationInFrames={T.c3.dur}>
        <ProblemCard text="Your CRM knows everything," durationInFrames={T.c3.dur} />
      </Sequence>
      <Sequence from={T.c4.from} durationInFrames={T.c4.dur}>
        <ProblemCard
          text="yet warns you of nothing."
          durationInFrames={T.c4.dur}
          fadeOut={false}
          gradientLast
        />
      </Sequence>

      <Sequence from={T.turn.from} durationInFrames={T.turn.dur}>
        <AbsoluteFill
          style={{
            clipPath: turnDone
              ? 'none'
              : `polygon(0px 0px, ${edge}px 0px, ${edge - SLANT}px 100%, 0px 100%)`,
          }}
        >
          <SunriseTurn />
        </AbsoluteFill>
      </Sequence>

      {wiping && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: edge - BAND,
            width: BAND,
            height: '100%',
            transform: 'skewX(-8.4deg)',
            transformOrigin: 'top left',
            background: `linear-gradient(90deg, transparent 0%, ${C.blue} 22%, ${C.violet} 44%, ${C.pink} 64%, ${C.orange} 84%, ${C.amber} 100%)`,
          }}
        />
      )}

      <Sequence from={T.hero.from} durationInFrames={T.hero.dur}>
        <HeroInFrame durationInFrames={T.hero.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
