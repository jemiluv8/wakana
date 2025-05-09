"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useState } from "react";
import {
  Bar,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { SAMPLE_COLORS } from "@/lib/constants";
import type { SummariesResponse } from "@/lib/types";
import {
  getUniqueProjects,
  prepareDailyCodingData,
  transparentize,
} from "@/lib/utils";

import { EmptyChartWrapper } from "./EmptyChartWrapper";
import { StackedTooltipContent } from "./StackedTooltipContent";

const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill, stroke, strokeWidth } = props;

  return (
    <>
      {/* Main fill rectangle */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="none"
        strokeWidth={0}
        style={{ cursor: "pointer" }}
      />
      {/* Top stroke */}
      <line
        x1={x}
        y1={y}
        x2={x + width}
        y2={y}
        stroke={stroke}
        strokeWidth={strokeWidth || 1}
        style={{ cursor: "pointer" }}
      />
      {/* Left stroke */}
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y + height}
        stroke={stroke}
        strokeWidth={strokeWidth || 1}
        style={{ cursor: "pointer" }}
      />
      {/* Right stroke */}
      <line
        x1={x + width}
        y1={y}
        x2={x + width}
        y2={y + height}
        stroke={stroke}
        strokeWidth={strokeWidth || 1}
        style={{ cursor: "pointer" }}
      />
    </>
  );
};

export interface iProps {
  data: SummariesResponse[];
}

export function DailyCodingSummaryOverTimeComponent({ data }: iProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const lineColor = theme === "dark" ? "#ffffff" : "#000";
  // Resolve whatever fuckery is afoot here.
  // Normalizing seems to bring us closer to an optimum solution but has its own
  // pitfals? It just looks nicer but the labels are fucked
  const chartData = data.map(prepareDailyCodingData);
  const uniqueProjects = getUniqueProjects(chartData);

  const customUniqueProjects: Record<string, string> = uniqueProjects.reduce(
    (prev, cur, index) => ({
      ...prev,
      [cur]: SAMPLE_COLORS[index % SAMPLE_COLORS.length],
    }),
    {}
  );

  const handleBarClick = (barData: any) =>
    router.push(`/dashboard/day/${barData.date}`);

  const [focusDataIndex, setFocusDataIndex] = useState<number | null>(null);
  return (
    <ResponsiveContainer
      width="100%"
      height={220}
      style={{ background: "transparent" }}
    >
      <ComposedChart
        style={{ background: "transparent" }}
        width={500}
        height={220}
        data={chartData}
        barGap={"100%"}
        barCategoryGap={3}
        margin={{
          top: 20,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="name"
          stroke="#8a8e91"
          tickLine={true}
          axisLine={true}
          className="chart-x-axis"
        />
        <Tooltip
          wrapperStyle={{ zIndex: 500 }}
          content={StackedTooltipContent as any}
          cursor={false}
        />
        {Object.entries(customUniqueProjects).map(([dataKey, color]) => (
          <Bar
            key={dataKey}
            dataKey={dataKey}
            fill={transparentize(color, 0.83)}
            stroke={color}
            stackId={"groot"}
            strokeWidth={1.8}
            shape={CustomBarShape}
            onMouseMove={(e: any) => {
              if (e.activeTooltipIndex !== focusDataIndex) {
                setFocusDataIndex(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setFocusDataIndex(null)}
            onClick={handleBarClick}
            className="cursor-pointer"
          />
        ))}
        <Line
          type="natural"
          dataKey="total"
          stroke={lineColor}
          dot={false}
          strokeWidth={1.45}
          tooltipType="none"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function DailyCodingSummaryOverTime({ data }: iProps) {
  const totalSeconds = data
    .map((d) => d.grand_total.total_seconds || 0)
    .reduce((a, b) => a + b, 0);
  return (
    <EmptyChartWrapper hasData={totalSeconds > 0}>
      <DailyCodingSummaryOverTimeComponent data={data} />
    </EmptyChartWrapper>
  );
}
