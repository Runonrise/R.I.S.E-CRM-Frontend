import React from 'react';
import {Composition} from 'remotion';
import {DemoSlice} from './DemoSlice';
import {FPS, HEIGHT, T, WIDTH} from './timing';

export const Root: React.FC = () => (
  <Composition
    id="DemoSlice"
    component={DemoSlice}
    durationInFrames={T.total}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
