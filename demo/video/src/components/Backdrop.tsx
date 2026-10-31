import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';

export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 110%, ${C.indigo}55 0%, ${C.obsidian} 60%)`,
    }}
  />
);
