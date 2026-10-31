import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';

const ROWS = 15;
const COLS = [220, 340, 180, 260, 200, 150];

const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const ClutterTable: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drift = (frame / fps) * 24;

  return (
    <div
      style={{
        position: 'absolute',
        inset: -80,
        padding: 120,
        transform: `translateY(${-drift}px) scale(1.05)`,
        filter: 'blur(7px)',
        opacity: 0.35,
      }}
    >
      {Array.from({length: ROWS}).map((_, r) => (
        <div
          key={r}
          style={{
            display: 'flex',
            gap: 28,
            height: 62,
            alignItems: 'center',
            borderBottom: '1px solid rgba(236,234,245,0.12)',
          }}
        >
          {COLS.map((w, c) => (
            <div
              key={c}
              style={{
                width: w * (0.55 + seeded(r * 7 + c) * 0.45),
                height: 16,
                borderRadius: 8,
                background: 'rgba(236,234,245,0.22)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
