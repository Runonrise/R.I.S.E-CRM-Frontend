import {continueRender, delayRender} from 'remotion';
import sg500 from '@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff2';
import sg700 from '@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff2';
import inter400 from '@fontsource/inter/files/inter-latin-400-normal.woff2';
import inter500 from '@fontsource/inter/files/inter-latin-500-normal.woff2';

const faces: Array<[string, string, string]> = [
  ['Space Grotesk', sg500, '500'],
  ['Space Grotesk', sg700, '700'],
  ['Inter', inter400, '400'],
  ['Inter', inter500, '500'],
];

const handle = delayRender('Loading bundled fonts');
Promise.all(
  faces.map(async ([family, url, weight]) => {
    const face = new FontFace(family, `url(${url}) format('woff2')`, {weight});
    await face.load();
    document.fonts.add(face);
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error('Font load failed', err);
    continueRender(handle);
  });

export const FONT_DISPLAY = `'Space Grotesk', system-ui, sans-serif`;
export const FONT_BODY = `'Inter', system-ui, sans-serif`;

export const C = {
  obsidian: '#0A0910',
  indigo: '#1A1590',
  tint: '#ECEAF5',
  amber: '#FFC83D',
  orange: '#FF7A3D',
  pink: '#EC3B8B',
  violet: '#8B2BE2',
  blue: '#3B3FD6',
};

const stops = [C.amber, C.orange, C.pink, C.violet, C.blue];
export const GRADIENT_V = `linear-gradient(180deg, ${stops.join(', ')})`;
export const GRADIENT_H = `linear-gradient(90deg, ${[...stops].reverse().join(', ')})`;
