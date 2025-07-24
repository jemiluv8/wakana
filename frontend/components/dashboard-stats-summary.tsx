"use client";

import { Clock, Code, GitBranch } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { SummariesApiResponse } from "@/lib/types";
import { convertSecondsToHoursAndMinutes } from "@/lib/utils";

import { DashboardPeriodSelectorV2 } from "./dashboard-period-selector";

export default function DashboardStatsSummary({
  data,
  searchParams,
}: {
  data: SummariesApiResponse;
  searchParams: Record<string, any>;
}) {
  const activeCodingTime =
    data.cumulative_total.seconds * (data.write_percentage / 100);

  const formattedActiveCodingTime =
    convertSecondsToHoursAndMinutes(activeCodingTime);

  const totalAiCodingTime = data.data.reduce((total, day) => {
    const aiCategory = day.categories.find(
      (category) => category.name.toLowerCase() === "ai coding"
    );
    return total + (aiCategory?.total_seconds || 0);
  }, 0);

  const aiCodingPercentage =
    data.cumulative_total.seconds > 0
      ? (totalAiCodingTime / data.cumulative_total.seconds) * 100
      : 0;

  const formattedAiCodingTime =
    convertSecondsToHoursAndMinutes(totalAiCodingTime);

  // Count days with non-zero activity for more accurate averages
  const nonZeroDays = data.data.filter(
    (day) => day.grand_total.total_seconds > 0
  ).length;
  const nonZeroAiDays = data.data.filter((day) => {
    const aiCategory = day.categories.find(
      (category) => category.name.toLowerCase() === "ai coding"
    );
    return (aiCategory?.total_seconds || 0) > 0;
  }).length;

  // Calculate average AI coding time per day (only non-zero AI days)
  const averageAiCodingTime =
    nonZeroAiDays > 0 ? totalAiCodingTime / nonZeroAiDays : 0;

  const formattedAverageAiTime =
    convertSecondsToHoursAndMinutes(averageAiCodingTime);

  return (
    <div className="w-full text-white">
      <div className="mx-auto">
        <div className="flex flex-col space-y-6">
          <div className="xs:flex-col md:flex items-center space-y-5 md:space-y-0 justify-between py-4 rounded-sm">
            <div className="xs:flex-col md:flex align-middle items-center space-y-5 md:space-y-0 md:space-x-4">
              <div>
                <h2 className="text-gray-400 text-sm font-medium mb-1">
                  Code Time
                </h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
                    {convertSecondsToHoursAndMinutes(
                      data.cumulative_total.seconds
                    )}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    in your editor
                  </span>
                </div>
                <div className="flex items-baseline mt-1">
                  <span className="text-sm text-gray-500">
                    Avg:{" "}
                    {convertSecondsToHoursAndMinutes(
                      nonZeroDays > 0
                        ? data.cumulative_total.seconds / nonZeroDays
                        : 0
                    )}
                    /day
                  </span>
                </div>
              </div>

              <div className="border-l border-border md:pl-4">
                <h2 className="text-gray-400 text-sm font-medium mb-1">
                  Active Code Time
                </h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold bg-gradient-to-r text-white bg-clip-text text-transparent">
                    {formattedActiveCodingTime}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    writing code
                  </span>
                </div>
                <div className="flex items-baseline mt-1">
                  <span className="text-sm text-gray-500">
                    Avg:{" "}
                    {convertSecondsToHoursAndMinutes(
                      nonZeroDays > 0
                        ? (data.cumulative_total.seconds *
                            (data.write_percentage / 100)) /
                            nonZeroDays
                        : 0
                    )}
                    /day
                  </span>
                </div>
              </div>

              <div className="border-l border-border md:pl-4">
                <h2 className="text-gray-400 text-sm font-medium mb-1">
                  AI Usage
                </h2>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {formattedAiCodingTime}
                  </span>
                  <span className="text-gray-400 ml-2 text-sm">
                    ({aiCodingPercentage.toFixed(1)}% of total)
                  </span>
                </div>
                <div className="flex items-baseline mt-1">
                  <span className="text-sm text-gray-500">
                    Avg: {formattedAverageAiTime}/day
                  </span>
                </div>
              </div>
            </div>

            <DashboardPeriodSelectorV2 searchParams={searchParams} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function StatsSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-gray-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Projects</h3>
              <Code className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Languages</h3>
              <Code className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold">8</p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Commits</h3>
              <GitBranch className="h-4 w-4 text-teal-400" />
            </div>
            <p className="text-2xl font-bold">47</p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-teal-600"></div>
        </CardContent>
      </Card>

      <Card className="border-gray-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm font-medium">Avg. Daily</h3>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold">5.4h</p>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-amber-600"></div>
        </CardContent>
      </Card>
    </div>
  );
}
