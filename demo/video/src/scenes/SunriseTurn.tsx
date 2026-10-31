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
// The PNG has ~80px of transparent padding, so the wordmark ink starts
// about 27px below LOGO_TOP. This puts it near y 220, under the heading.
const LOGO_TOP = 192;
// Height of the soft edge on the upward reveal, as a % of the logo box.
const FEATHER = 28;

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

  // Soft upward wipe: a feathered edge rises from the bottom like the sun.
  const edge = logo * (100 + FEATHER);
  const reveal =
    logo >= 0.999 ? 'none' : `linear-gradient(to top, black ${edge - FEATHER}%, transparent ${edge}%)`;

  return (
    <AbsoluteFill style={{background: C.obsidian}}>
      <Backdrop />
      <SunriseGlow rise={rise} intensity={0.9} horizon={960} radius={150} lift={40} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 96,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <WordReveal text="Meet R.I.S.E." size={64} start={0.87} stagger={0.2} weight={700} />
      </div>
      {/* Outer layer carries the glow and is never clipped, so no box edges. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: LOGO_TOP,
          width: LOGO_W,
          height: LOGO_H,
          marginLeft: -LOGO_W / 2,
          opacity: logo,
          transform: `translateY(${(1 - logo) * 36}px)`,
          filter: `drop-shadow(0 0 16px ${C.pink}40)`,
        }}
      >
        {/* Inner layer does the reveal; the glow follows its soft edge. */}
        <div style={{width: LOGO_W, height: LOGO_H, maskImage: reveal, WebkitMaskImage: reveal}}>
          <Img
            src={staticFile('brand/rise-crm-lockup-for-dark.png')}
            style={{width: LOGO_W, height: LOGO_H, display: 'block'}}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
