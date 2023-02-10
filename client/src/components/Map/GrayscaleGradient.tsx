interface GrayscaleGradientProps {
  width: string;
  height: string;
}

export const GrayscaleGradient = (props: GrayscaleGradientProps) => {
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
          x1="25"
          y1="180"
          x2="25"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#000" offset="0" />
          <stop stopColor="#fff" offset="1" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="0"
        width="40"
        height="180"
        fill="url(#linearGradient5212)"
        stroke="none"
      />
    </svg>
  );
};
