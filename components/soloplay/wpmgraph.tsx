import React from "react";

type WpmGraphProps = {
  data: number[];
};

const WpmGraph: React.FC<WpmGraphProps> = ({ data }) => {
  if (data.length < 2) return null;

  const width = 500;
  const height = 200;

  const paddingLeft = 42;
  const paddingBottom = 26;
  const paddingTop = 14;
  const paddingRight = 10;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const max = Math.max(...data, 10);

  const points = data.map((v, i) => {
    const x = paddingLeft + (i / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (v / max) * chartHeight;
    return { x, y };
  });

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const areaPoints = [
    `${points[0].x},${paddingTop + chartHeight}`,
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${paddingTop + chartHeight}`,
  ].join(" ");

  const yTicks = 4;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-48"
      preserveAspectRatio="none"
    >
      <defs>
        {/* Line gradient */}
        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#facc15" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>

        {/* Area gradient */}
        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#facc15" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
        </linearGradient>

        {/* Glow */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Horizontal grid + Y labels */}
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = paddingTop + chartHeight - (i / yTicks) * chartHeight;
        const value = Math.round((max / yTicks) * i);

        return (
          <g key={i}>
            <line
              x1={paddingLeft}
              y1={y}
              x2={paddingLeft + chartWidth}
              y2={y}
              stroke="rgb(63 63 70)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text
              x={paddingLeft - 8}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="rgb(161 161 170)"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* X axis */}
      <line
        x1={paddingLeft}
        y1={paddingTop + chartHeight}
        x2={paddingLeft + chartWidth}
        y2={paddingTop + chartHeight}
        stroke="rgb(82 82 82)"
      />

      {/* Area */}
      <polygon points={areaPoints} fill="url(#areaGradient)" />

      {/* Glow line (behind) */}
      <polyline
        points={linePoints}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="6"
        opacity="0.35"
        filter="url(#glow)"
      />

      {/* Main line */}
      <polyline
        points={linePoints}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      >
        <animate
          attributeName="stroke-dasharray"
          from="0 1"
          to="1 0"
          dur="0.8s"
          fill="freeze"
        />
      </polyline>

      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.2"
          fill="#facc15"
          stroke="#0f172a"
          strokeWidth="1.2"
        />
      ))}

      {/* X labels (seconds) */}
      {data.map((_, i) => {
        if (i !== 0 && i !== data.length - 1 && i % 5 !== 0) return null;

        const x = paddingLeft + (i / (data.length - 1)) * chartWidth;

        return (
          <text
            key={i}
            x={x}
            y={paddingTop + chartHeight + 16}
            textAnchor="middle"
            fontSize="10"
            fill="rgb(161 161 170)"
          >
            {i + 1}s
          </text>
        );
      })}
    </svg>
  );
};

export default WpmGraph;
