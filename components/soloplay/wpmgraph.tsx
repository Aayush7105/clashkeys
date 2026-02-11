import React from "react";

type WpmGraphProps = {
  data: number[];
};

const WpmGraph: React.FC<WpmGraphProps> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 500;
  const height = 180;

  const paddingLeft = 40; // space for Y labels
  const paddingBottom = 28; // space for X labels
  const paddingTop = 10;
  const paddingRight = 10;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const max = Math.max(...data, 10);

  const points = data
    .map((v, i) => {
      const x = paddingLeft + (i / (data.length - 1)) * chartWidth;

      const y = paddingTop + chartHeight - (v / max) * chartHeight;

      return `${x},${y}`;
    })
    .join(" ");

  const yTicks = 4;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-44"
      preserveAspectRatio="none"
    >
      {/* Y axis */}
      <line
        x1={paddingLeft}
        y1={paddingTop}
        x2={paddingLeft}
        y2={paddingTop + chartHeight}
        stroke="rgb(82 82 82)"
        strokeWidth="1"
      />

      {/* X axis */}
      <line
        x1={paddingLeft}
        y1={paddingTop + chartHeight}
        x2={paddingLeft + chartWidth}
        y2={paddingTop + chartHeight}
        stroke="rgb(82 82 82)"
        strokeWidth="1"
      />

      {/* Y ticks + labels */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const value = Math.round((max / yTicks) * i);
        const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;

        return (
          <g key={i}>
            <line
              x1={paddingLeft - 4}
              y1={y}
              x2={paddingLeft}
              y2={y}
              stroke="rgb(82 82 82)"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgb(163 163 163)"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* X ticks (seconds) */}
      {data.map((_, i) => {
        // show only a few labels to avoid clutter
        if (i === 0 || i === data.length - 1 || i % 5 !== 0) return null;

        const x = paddingLeft + (i / (data.length - 1)) * chartWidth;

        return (
          <g key={i}>
            <line
              x1={x}
              y1={paddingTop + chartHeight}
              x2={x}
              y2={paddingTop + chartHeight + 4}
              stroke="rgb(82 82 82)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={paddingTop + chartHeight + 14}
              textAnchor="middle"
              fontSize="10"
              fill="rgb(163 163 163)"
            >
              {i + 1}s
            </text>
          </g>
        );
      })}

      {/* Graph line */}
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
