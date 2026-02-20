"use client";

import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type ErrorPoint = {
  second: number;
  wpm: number;
};

type WpmGraphProps = {
  wpmData: number[];
  rawWpmData: number[];
  errorPoints: ErrorPoint[];
  durationSeconds?: number;
};

const chartConfig = {
  wpm: {
    label: "WPM",
    color: "hsl(48 96% 53%)",
  },
  rawWpm: {
    label: "Raw WPM",
    color: "hsl(220 10% 70%)",
  },
} satisfies ChartConfig;

export default function WpmGraph({
  wpmData,
  rawWpmData,
  errorPoints,
  durationSeconds,
}: WpmGraphProps) {
  const maxErrorSecond = errorPoints.reduce(
    (maxSecond, point) =>
      Number.isFinite(point.second) ? Math.max(maxSecond, point.second) : maxSecond,
    0,
  );
  const sampledPoints = Math.max(
    wpmData.length,
    rawWpmData.length,
    Math.ceil(maxErrorSecond) + 1,
  );
  const axisMaxSeconds = Math.max(
    1,
    Math.round(durationSeconds ?? Math.max(1, sampledPoints - 1)),
  );

  const allXTicks = Array.from(
    { length: axisMaxSeconds + 1 },
    (_, index) => index,
  );
  const tickStep = axisMaxSeconds <= 20 ? 1 : axisMaxSeconds <= 60 ? 2 : 5;
  const xTicks = allXTicks.filter(
    (second) => second % tickStep === 0 || second === axisMaxSeconds,
  );

  const chartData = useMemo(
    () =>
      Array.from({ length: axisMaxSeconds + 1 }, (_, second) => ({
        second,
        wpm:
          second < wpmData.length
            ? Math.max(0, wpmData[second] ?? 0)
            : null,
        rawWpm:
          second < rawWpmData.length
            ? Math.max(0, rawWpmData[second] ?? 0)
            : null,
      })),
    [axisMaxSeconds, rawWpmData, wpmData],
  );

  return (
    <Card className="w-full overflow-hidden gap-2 border-neutral-900 bg-neutral-900 py-2.5 shadow-none">
      <CardHeader className="px-3 pb-1 md:px-4">
        <CardTitle className="flex items-center gap-2 text-neutral-200 font-mono mx-5 mt-3">
          Typing speeed
        </CardTitle>
        <CardDescription className="font-mono text-neutral-500 mx-5 mb-3 mt-2">
          0s to {axisMaxSeconds}s
        </CardDescription>
      </CardHeader>

      <CardContent className="px-2 pt-1 md:px-3">
        <ChartContainer
          className="h-[clamp(10rem,30vh,22rem)] w-full md:h-[clamp(14rem,34vh,24rem)]"
          config={chartConfig}
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 8,
              right: 8,
              top: 8,
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="hsl(0 0% 100%)"
              strokeOpacity={0.16}
            />

            <XAxis
              dataKey="second"
              type="number"
              domain={[0, axisMaxSeconds]}
              ticks={xTicks}
              allowDecimals={false}
              interval="preserveStartEnd"
              minTickGap={24}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value: number) => `${value}s`}
            />

            <YAxis
              domain={[0, "auto"]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />

            <Line
              dataKey="wpm"
              type="bump"
              stroke={chartConfig.wpm.color}
              dot={false}
              strokeWidth={2.5}
            />

            <Line
              dataKey="rawWpm"
              type="bump"
              stroke={chartConfig.rawWpm.color}
              dot={false}
              strokeWidth={2.5}
            />

            {errorPoints.map((point, index) => {
              if (!Number.isFinite(point.second) || !Number.isFinite(point.wpm)) {
                return null;
              }

              const x = Math.max(0, Math.min(axisMaxSeconds, point.second));
              const y = Math.max(0, point.wpm);

              return (
                <ReferenceDot
                  key={`error-${index}-${x.toFixed(3)}`}
                  x={x}
                  y={y}
                  r={4}
                  fill="hsl(0 84% 60%)"
                  stroke="none"
                  ifOverflow="extendDomain"
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
