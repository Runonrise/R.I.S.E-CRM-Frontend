import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

type Props = {
  rise: number;
  intensity?: number;
  horizon?: number;
  showSun?: boolean;
  showSea?: boolean;
  radius?: number;
  lift?: number;
};

export const SunriseGlow: React.FC<Props> = ({
  rise,
  intensity = 1,
  horizon = 840,
  showSun = true,
  showSea = true,
  radius = 170,
  lift = 90,
}) => {
  const startY = horizon + radius + 60;
  const endY = horizon - lift;
  const centerY = startY + (endY - startY) * rise;

  return (
    <AbsoluteFill>
      {showSea && (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon,
          bottom: 0,
          background: `linear-gradient(180deg, ${C.indigo}cc 0%, ${C.obsidian} 100%)`,
        }}
      />
      )}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: horizon + 220 * (1 - rise),
          width: 1900,
          height: 900,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse at center, ${C.pink}88 0%, ${C.orange}44 28%, ${C.violet}22 55%, transparent 72%)`,
          opacity: intensity * rise,
        }}
      />
      {showSun && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: horizon,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: centerY - radius,
              width: radius * 2,
              height: radius * 2,
              marginLeft: -radius,
              borderRadius: '50%',
              background: `linear-gradient(180deg, ${C.amber} 0%, ${C.orange} 55%, ${C.pink} 100%)`,
              opacity: intensity,
            }}
          />
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: horizon,
          width: 260,
          height: 300,
          marginLeft: -130,
          background: `linear-gradient(180deg, ${C.orange}88, transparent)`,
          filter: 'blur(18px)',
          opacity: rise * intensity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: horizon,
          height: 1,
          background: `linear-gradient(90deg, transparent, ${C.tint}44 30%, ${C.tint}44 70%, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
