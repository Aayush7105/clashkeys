"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

type WpmGraphProps = {
  wpmData: number[];
  rawWpmData: number[];
  errorMarkers: (number | null)[];
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
  errorMarkers,
  durationSeconds,
}: WpmGraphProps) {
  const sampledPoints = Math.max(
    wpmData.length,
    rawWpmData.length,
    errorMarkers.length,
  );
  const axisMaxSeconds = Math.max(
    1,
    Math.round(durationSeconds ?? Math.max(1, sampledPoints - 1)),
  );

  const allXTicks = Array.from({ length: axisMaxSeconds + 1 }, (_, index) => index);
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
            ? Math.max(0, Math.round(wpmData[second] ?? 0))
            : null,
        rawWpm:
          second < rawWpmData.length
            ? Math.max(0, Math.round(rawWpmData[second] ?? 0))
            : null,
        errorMarker:
          second < errorMarkers.length &&
          typeof errorMarkers[second] === "number" &&
          Number.isFinite(errorMarkers[second])
            ? Math.max(0, Math.round(errorMarkers[second] as number))
            : null,
      })),
    [axisMaxSeconds, errorMarkers, rawWpmData, wpmData],
  );

  const wpmPoints = chartData
    .map((point) => point.wpm)
    .filter((value): value is number => typeof value === "number");
  const firstWpm = wpmPoints[0] ?? 0;
  const lastWpm = wpmPoints[wpmPoints.length - 1] ?? 0;
  const trendPercent = firstWpm > 0 ? ((lastWpm - firstWpm) / firstWpm) * 100 : 0;
  const trendPositive = trendPercent >= 0;

  return (
    <Card className="w-full overflow-hidden gap-2 border-neutral-900 bg-neutral-950/50 py-2.5 shadow-none">
      <CardHeader className="px-3 pb-1 md:px-4">
        <CardTitle className="flex items-center gap-2 text-neutral-200 font-mono">
          typing speed
          <Badge
            variant="outline"
            className={`border-none font-mono ${
              trendPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>
              {trendPositive ? "+" : ""}
              {trendPercent.toFixed(1)}%
            </span>
          </Badge>
        </CardTitle>
        <CardDescription className="font-mono text-neutral-500">
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

            {chartData.map((point) => {
              if (point.errorMarker === null) return null;
              return (
                <ReferenceDot
                  key={`error-${point.second}`}
                  x={point.second}
                  y={point.errorMarker}
                  r={3}
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
