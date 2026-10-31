import React from 'react';
import {
  AbsoluteFill,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {SunriseGlow} from '../components/SunriseGlow';
import {WordReveal} from '../components/WordReveal';
import {C} from '../theme';
import {sec} from '../timing';

const LOGO_H = 470;
const LOGO_W = Math.round((LOGO_H * 1856) / 1368);

export const SunriseTurn: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const rise = spring({
    frame: frame - sec(0.47),
    fps,
    durationInFrames: sec(2),
    config: {damping: 200},
  });
  const logo = spring({
    frame: frame - sec(1.4),
    fps,
    config: {damping: 200},
    durationInFrames: sec(0.9),
  });

  return (
    <AbsoluteFill style={{background: C.obsidian}}>
      <Backdrop />
      <SunriseGlow rise={rise} intensity={0.9} horizon={960} radius={150} lift={40} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 100,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <WordReveal text="Meet R.I.S.E." size={96} start={0.87} stagger={0.2} weight={700} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 250,
          width: LOGO_W * 1.6,
          height: LOGO_H * 1.3,
          marginLeft: -(LOGO_W * 0.8),
          marginTop: -(LOGO_H * 0.15),
          background: `radial-gradient(ellipse at center, ${C.violet}55 0%, ${C.pink}2a 35%, transparent 68%)`,
          opacity: logo * 0.9,
          filter: 'blur(30px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 250,
          width: LOGO_W,
          height: LOGO_H,
          marginLeft: -LOGO_W / 2,
          opacity: logo,
          clipPath: `inset(${(1 - logo) * 100}% 0 0 0)`,
          transform: `translateY(${(1 - logo) * 36}px)`,
          filter: `drop-shadow(0 0 36px ${C.pink}55)`,
        }}
      >
        <Img
          src={staticFile('brand/rise-crm-lockup-for-dark.png')}
          style={{width: LOGO_W, height: LOGO_H}}
        />
      </div>
    </AbsoluteFill>
  );
};
