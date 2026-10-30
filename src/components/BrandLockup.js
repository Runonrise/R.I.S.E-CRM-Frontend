import React from "react";
import lockupForDark from "../assets/brand/rise-crm-lockup-for-dark.png";
import lockupForLight from "../assets/brand/rise-crm-lockup.png";

// Full R.I.S.E CRM logo. Both versions render; App.css shows the one that
// matches the active theme (see .rise-logo-on-dark / .rise-logo-on-light).
// Source images are 1856x1368.
export default function BrandLockup({ width = 160, style }) {
  const height = Math.round((width * 1368) / 1856);
  const imgStyle = { width, height, ...style };
  return (
    <>
      <img src={lockupForDark} alt="R.I.S.E CRM" width={width} height={height} className="rise-logo-on-dark" style={imgStyle} />
      <img src={lockupForLight} alt="R.I.S.E CRM" width={width} height={height} className="rise-logo-on-light" style={imgStyle} />
    </>
  );
}
