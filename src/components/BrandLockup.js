import React from "react";
import lockupForDark from "../assets/brand/rise-crm-lockup-for-dark.png";
import lockupForLight from "../assets/brand/rise-crm-lockup.png";

const SRC_W = 1856;
const SRC_H = 1368;

// Full R.I.S.E CRM logo. Both versions render; App.css shows the one that
// matches the active theme (see .rise-logo-on-dark / .rise-logo-on-light).
// Source images are 1856x1368.
//
// width: a number gives a fixed pixel size. A CSS string such as
// "min(100%, 300px)" makes the logo fluid, with height following the
// source aspect ratio.
export default function BrandLockup({ width = 160, style }) {
  const fluid = typeof width === "string";
  const height = fluid ? undefined : Math.round((width * SRC_H) / SRC_W);
  const imgStyle = fluid
    ? { width, height: "auto", aspectRatio: `${SRC_W} / ${SRC_H}`, ...style }
    : { width, height, ...style };
  const attrW = fluid ? SRC_W : width;
  const attrH = fluid ? SRC_H : height;
  return (
    <>
      <img src={lockupForDark} alt="R.I.S.E CRM" width={attrW} height={attrH} className="rise-logo-on-dark" style={imgStyle} />
      <img src={lockupForLight} alt="R.I.S.E CRM" width={attrW} height={attrH} className="rise-logo-on-light" style={imgStyle} />
    </>
  );
}
