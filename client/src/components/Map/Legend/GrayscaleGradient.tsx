import { observer } from "mobx-react";

interface GrayscaleGradientProps {
  width: string;
  height: string;
}

/**
 * GrayscaleGradient-component for the legend
 */

export const GrayscaleGradient = observer((props: GrayscaleGradientProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width}
      height={props.height}
    >
      <title>Linear Grayscale Gradient (Vertical)</title>
      <desc>A linear grayscale gradient</desc>
      <defs>
        <linearGradient
          id="linearGradient5212"
          x1="180"
          y1="0"
          x2="0"
          y2="0"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#000" offset="0" />
          <stop stopColor="#fff" offset="1" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width={props.width}
        height={props.height}
        fill="url(#linearGradient5212)"
        stroke="none"
      />
    </svg>
  );
});
