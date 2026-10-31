import React from 'react';
import {Img, staticFile} from 'remotion';
import {C, FONT_BODY} from '../theme';

type Props = {
  width: number;
  children: React.ReactNode;
};

const BAR = 46;

export const DeviceFrame: React.FC<Props> = ({width, children}) => {
  const contentHeight = Math.round((width * 9) / 16);

  return (
    <div
      style={{
        width,
        height: contentHeight + BAR,
        borderRadius: 22,
        overflow: 'hidden',
        background: '#14121f',
        border: '1px solid rgba(236,234,245,0.14)',
        boxShadow: `0 60px 120px rgba(0,0,0,0.6), 0 0 180px ${C.pink}2e`,
      }}
    >
      <div
        style={{
          height: BAR,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 10,
          background: '#1a1828',
          borderBottom: '1px solid rgba(236,234,245,0.08)',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgba(236,234,245,0.22)',
            }}
          />
        ))}
        <div
          style={{
            marginLeft: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '5px 22px',
            borderRadius: 999,
            background: 'rgba(236,234,245,0.08)',
            fontFamily: FONT_BODY,
            fontSize: 15,
            color: 'rgba(236,234,245,0.7)',
          }}
        >
          <Img src={staticFile('brand/rise-crm-mark.png')} style={{height: 20, width: 'auto'}} />
          R.I.S.E CRM
        </div>
      </div>
      <div style={{width, height: contentHeight, position: 'relative'}}>{children}</div>
    </div>
  );
};
