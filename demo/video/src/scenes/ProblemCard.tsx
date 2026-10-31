import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {WordReveal} from '../components/WordReveal';
import {sec} from '../timing';

type Props = {
  text: string;
  durationInFrames: number;
  fadeOut?: boolean;
  gradientLast?: boolean;
};

export const ProblemCard: React.FC<Props> = ({
  text,
  durationInFrames,
  fadeOut = true,
  gradientLast = false,
}) => {
  const frame = useCurrentFrame();
  const out = fadeOut
    ? interpolate(frame, [durationInFrames - sec(0.3), durationInFrames], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 160px',
        opacity: out,
      }}
    >
      <WordReveal text={text} size={124} start={0.07} gradientLast={gradientLast} />
    </AbsoluteFill>
  );
};
