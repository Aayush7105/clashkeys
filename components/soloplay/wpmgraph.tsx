"use client";

import {
  CartesianGrid,
  Customized,
  Line,
  LineChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDynamicDasharray } from "@/components/ui/partial-line";

type WpmGraphProps = {
  wpmData: number[];
  rawWpmData: number[];
  errorMarkers: (number | null)[];
};

const chartConfig = {
  wpm: {
    label: "WPM",
    color: "hsl(48 96% 53%)",
  },
  rawWpm: {
    label: "Raw WPM",
    color: "hsl(0 0% 65%)",
  },
} satisfies ChartConfig;

export default function WpmGraph({
  wpmData,
  rawWpmData,
  errorMarkers,
}: WpmGraphProps) {
  const chartData = useMemo(
    () => {
      const points = Math.max(wpmData.length, rawWpmData.length, errorMarkers.length);
      return Array.from({ length: points }, (_, index) => ({
        second: index + 1,
        wpm: Math.max(0, Math.round(wpmData[index] ?? 0)),
        rawWpm: Math.max(0, Math.round(rawWpmData[index] ?? 0)),
        errorMarker:
          typeof errorMarkers[index] === "number" &&
          Number.isFinite(errorMarkers[index])
            ? Math.max(0, Math.round(errorMarkers[index] as number))
            : null,
      }));
    },
    [wpmData, rawWpmData, errorMarkers],
  );

  const splitIndex = Math.max(1, chartData.length - 10);
  const [DasharrayCalculator, lineDasharrays] = useDynamicDasharray({
    splitIndex,
    lineConfigs: [
      { name: "wpm", splitIndex },
      { name: "rawWpm", splitIndex },
    ],
  });

  if (chartData.length < 2) return null;

  return (
    <ChartContainer className="h-54 w-full" config={chartConfig}>
      <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
          left: 8,
          right: 8,
          top: 8,
        }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="second"
          type="number"
          domain={[1, Math.max(1, chartData.length)]}
          ticks={chartData.map((point) => point.second)}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tickFormatter={(value: number) => `${value}s`}
        />
        <YAxis
          domain={[0, "auto"]}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          label={{ value: "WPM", angle: -90, position: "insideLeft" }}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Line
          dataKey="wpm"
          type="linear"
          stroke={chartConfig.wpm.color}
          strokeWidth={3}
          dot={{
            r: 2.5,
            fill: chartConfig.wpm.color,
          }}
          strokeDasharray={
            lineDasharrays.find((line) => line.name === "wpm")?.strokeDasharray ||
            "0 0"
          }
        />
        <Line
          dataKey="rawWpm"
          type="linear"
          stroke={chartConfig.rawWpm.color}
          strokeWidth={2.5}
          dot={{
            r: 2.5,
            fill: chartConfig.rawWpm.color,
          }}
          strokeDasharray={
            lineDasharrays.find((line) => line.name === "rawWpm")
              ?.strokeDasharray || "0 0"
          }
        />
        {chartData.map((point) => {
          if (point.errorMarker === null) return null;
          return (
            <ReferenceDot
              key={`error-${point.second}`}
              x={point.second}
              y={point.errorMarker}
              r={4}
              fill="hsl(0 84% 60%)"
              stroke="hsl(0 0% 100%)"
              strokeWidth={1}
              ifOverflow="extendDomain"
            />
          );
        })}
        <Customized component={DasharrayCalculator} />
      </LineChart>
    </ChartContainer>
  );
}
