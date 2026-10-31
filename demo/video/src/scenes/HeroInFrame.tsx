import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Freeze,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Backdrop} from '../components/Backdrop';
import {DeviceFrame} from '../components/DeviceFrame';
import {SunriseGlow} from '../components/SunriseGlow';
import {WordReveal} from '../components/WordReveal';
import {C} from '../theme';
import {CLIP_FRAMES, HEIGHT, WIDTH, sec} from '../timing';

const FRAME_W = 1360;
const clip = staticFile('clips/01-landing-hero.mp4');
const videoStyle: React.CSSProperties = {
  width: FRAME_W,
  height: Math.round((FRAME_W * 9) / 16),
  objectFit: 'cover',
};

export const HeroInFrame: React.FC<{durationInFrames: number}> = ({durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, sec(0.4)], [0, 1], {extrapolateRight: 'clamp'});
  const enter = spring({frame: frame - sec(0.2), fps, config: {damping: 22, stiffness: 90}});
  const push = interpolate(frame, [sec(0.8), durationInFrames], [1, 1.075], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bob = Math.sin((frame / fps) * 1.364) * 5;

  return (
    <AbsoluteFill style={{background: C.obsidian, opacity: fadeIn}}>
      <Backdrop />
      <SunriseGlow rise={1} intensity={0.5} horizon={930} showSun={false} showSea={false} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 62,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <WordReveal text="Built on AI. Not bolted on." size={76} start={0.53} stagger={0.17} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: (WIDTH - FRAME_W) / 2,
          top: 190,
          transform: `perspective(2400px) translateY(${(1 - enter) * 160 + bob}px) rotateX(${
            (1 - enter) * 12
          }deg) scale(${(0.94 + 0.06 * enter) * push})`,
          transformOrigin: `50% ${HEIGHT / 3}px`,
          opacity: enter,
        }}
      >
        <DeviceFrame width={FRAME_W}>
          <Sequence durationInFrames={CLIP_FRAMES.hero}>
            <OffthreadVideo src={clip} muted style={videoStyle} />
          </Sequence>
          <Sequence from={CLIP_FRAMES.hero}>
            <Freeze frame={0}>
              <OffthreadVideo
                src={clip}
                muted
                trimBefore={CLIP_FRAMES.hero - 2}
                style={videoStyle}
              />
            </Freeze>
          </Sequence>
        </DeviceFrame>
      </div>
    </AbsoluteFill>
  );
};
