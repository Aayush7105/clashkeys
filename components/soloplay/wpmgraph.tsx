import React from "react";

type WpmGraphProps = {
  data: number[];
};

const WpmGraph: React.FC<WpmGraphProps> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 500;
  const height = 160;
  const padding = 10;

  const max = Math.max(...data, 10);

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);

      const y = height - padding - (v / max) * (height - padding * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-40"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke="rgb(250 204 21)"
        strokeWidth="3"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default WpmGraph;
