"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Label,
} from "recharts";
import {
  prepareDailyCodingData,
  transparentize,
  convertSecondsToHours,
} from "@/lib/utils";
import { StackedTooltipContent } from "./StackedTooltipContent";
import { SummariesResponse } from "@/lib/types";

export interface iProps {
  data: SummariesResponse[];
}

export function DailyCodingSummaryLineChart({ data }: iProps) {
  const chartData = data.map(prepareDailyCodingData);

  return (
    <ResponsiveContainer
      width="100%"
      height={220}
      style={{ background: "transparent" }}
    >
      <AreaChart width={500} data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#8a8e91"
          tickLine={true}
          axisLine={true}
          className="chart-x-axis"
        />
        <YAxis
          tickFormatter={convertSecondsToHours}
          className="chart-x-axis"
          tickLine={true}
          axisLine={true}
        >
          <Label angle={-90} value="Hours" />
        </YAxis>
        <Tooltip content={StackedTooltipContent as any} cursor={false} />
        <Area
          type="natural"
          dataKey="total"
          stroke="#8884d8"
          dot={false}
          strokeWidth={1.45}
          tooltipType="none"
          fill={transparentize("#8884d8", 0.65)}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}