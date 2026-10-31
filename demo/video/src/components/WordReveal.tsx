import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT_DISPLAY, GRADIENT_H} from '../theme';
import {sec} from '../timing';

type Props = {
  text: string;
  size: number;
  start?: number;
  stagger?: number;
  weight?: 500 | 700;
  gradientLast?: boolean;
};

export const WordReveal: React.FC<Props> = ({
  text,
  size,
  start = 0,
  stagger = 0.13,
  weight = 500,
  gradientLast = false,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      style={{
        fontFamily: FONT_DISPLAY,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.12,
        color: C.tint,
        textAlign: 'center',
        letterSpacing: '-0.02em',
      }}
    >
      {words.map((w, i) => {
        const p = spring({
          frame: frame - sec(start) - i * sec(stagger),
          fps,
          config: {damping: 20, stiffness: 140, mass: 0.8},
        });
        const isLast = gradientLast && i === words.length - 1;
        return (
          <span
            key={`${w}-${i}`}
            style={{
              display: 'inline-block',
              marginRight: i === words.length - 1 ? 0 : '0.26em',
              opacity: p,
              transform: `translateY(${(1 - p) * 34}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              ...(isLast
                ? {
                    background: GRADIENT_H,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }
                : {}),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
