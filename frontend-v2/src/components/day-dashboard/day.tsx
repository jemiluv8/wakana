import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Group } from "@visx/group";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Bar, Line } from "@visx/shape";
import { addDays, format, isToday, subDays } from "date-fns";
import { startCase } from "lodash";
import { ChevronLeft, ChevronRight, FileBarChart, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

import { COLORS } from "~/lib/constants";
import { convertSecondsToHoursAndMinutes } from "~/lib/utils";

interface RawTimeEntry {
  time: number;
  project: string;
  duration: number;
  color: string | null;
  [key: string]: any;
}

interface RawData {
  data: RawTimeEntry[];
  start: string;
  end: string;
  timezone: string;
}

interface ProcessedActivity {
  id: string;
  start: Date;
  end: Date;
  project: string;
  duration: number;
  [key: string]: any;
}

interface DataGroup {
  name: string;
  activities: ProcessedActivity[];
  totalDuration: number;
}

interface TimeTrackingProps {
  data: RawData;
  margin?: { top: number; right: number; bottom: number; left: number };
  sliceBy?: string;
}

const defaultMargin = { top: 80, right: 40, bottom: 40, left: 220 };
const ROW_HEIGHT = 45;
const LANE_HEIGHT = 33;

function ActivityModal({
  activity,
  open,
  onOpenChange,
  sliceBy = "project",
}: {
  activity: ProcessedActivity;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sliceBy?: string;
}) {
  if (!open) {
    return null;
  }

  const durationString = convertSecondsToHoursAndMinutes(activity.duration);
  const title = startCase(String(activity[sliceBy] || "Unknown"));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-zinc-400">Details of this activity.</p>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-4 text-sm">
          <div className="grid grid-cols-4 gap-2">
            <div className="text-zinc-400">{startCase(sliceBy)}:</div>
            <div className="col-span-3 font-semibold">{title}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-zinc-400">Duration:</div>
            <div className="col-span-3">{durationString}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-zinc-400">Start Time:</div>
            <div className="col-span-3">
              {format(activity.start, "yyyy-MM-dd hh:mm a")}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-zinc-400">End Time:</div>
            <div className="col-span-3">
              {format(activity.end, "yyyy-MM-dd hh:mm a")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DayHeader({
  data,
  totalTime,
}: {
  data: RawData;
  totalTime: number;
}) {
  const navigate = useNavigate();

  const totalHours = Math.floor(totalTime / 3600);
  const totalMinutes = Math.floor((totalTime % 3600) / 60);

  const currentDate = new Date(data.start);
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const DATE_FORMAT = "yyyy-MM-dd";
  const onCurrentDay = isToday(currentDate);

  return (
    <div className="flex w-full items-center justify-center p-4">
      <button
        onClick={() =>
          navigate({
            to: `/dashboard/day/${format(subDays(currentDate, 1), DATE_FORMAT)}`,
          })
        }
        className="flex size-8 items-center justify-start rounded-full border border-blue-500/50 transition-all hover:bg-blue-500/10"
        aria-label="Previous day"
      >
        <ChevronLeft className="size-8 text-blue-500 transition-colors hover:text-blue-400" />
      </button>

      <div className="mx-5 flex items-center">
        <span className="mr-3 text-4xl font-bold text-white">
          {totalHours} hrs {totalMinutes} mins
        </span>
        <span className="mr-3 text-2xl text-gray-400">on</span>
        <span className="text-3xl text-blue-500">{formattedDate}</span>
      </div>

      <button
        onClick={() => {
          if (onCurrentDay) return;

          const nextDate = addDays(currentDate, 1);
          navigate({
            to: `/dashboard/day/${format(nextDate, DATE_FORMAT)}`,
          });
        }}
        className="flex size-8 items-center justify-end rounded-full border border-blue-500/50 transition-all hover:bg-blue-500/10"
        aria-label="Next day"
        disabled={onCurrentDay}
      >
        <ChevronRight className="size-8 text-blue-500 transition-colors hover:text-blue-400" />
      </button>
    </div>
  );
}

function EmptyState({ date }: { date: Date }) {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex h-96 w-full flex-col items-center justify-center">
      <div className="mb-6 rounded-full bg-blue-500/10 p-6">
        <FileBarChart className="size-16 text-blue-500" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-white">
        No time entries found
      </h3>
      <p className="mb-6 max-w-md text-center text-gray-400">
        There are no time entries recorded for {formattedDate}.
      </p>
    </div>
  );
}

export default function TimeTrackingVisualization({
  data: rawData,
  margin = defaultMargin,
  sliceBy = "project",
}: TimeTrackingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [modalActivity, setModalActivity] = useState<ProcessedActivity | null>(
    null
  );
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    activity: ProcessedActivity;
  } | null>(null);

  const getColor = useCallback(
    (activity: ProcessedActivity) => {
      const defaultColor = "#3b82f6";

      if (sliceBy === "language") {
        return COLORS.languages[activity.language] || defaultColor;
      }

      if (sliceBy === "editor") {
        return COLORS.editors[activity.editor] || defaultColor;
      }

      if (sliceBy === "category") {
        return COLORS.categories[activity.category] || defaultColor;
      }

      return defaultColor;
    },
    [sliceBy]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current) return;

      const { width } = containerRef.current.getBoundingClientRect();
      setDimensions((prev) => ({ ...prev, width }));
    };

    updateDimensions();

    const currentContainer = containerRef.current;
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(currentContainer);

    return () => {
      resizeObserver.unobserve(currentContainer);
      resizeObserver.disconnect();
    };
  }, []);

  const { timeScale, yScale, groups, totalTime, calculatedHeight } =
    useMemo(() => {
      const startDate = new Date(rawData.start);
      const endDate = new Date(rawData.end);

      const activities: ProcessedActivity[] = rawData.data.map((item) => ({
        id: item.time.toString(),
        start: new Date(item.time * 1000),
        end: new Date((item.time + item.duration) * 1000),
        project: item.project,
        duration: item.duration,
        ...Object.fromEntries(
          Object.keys(item)
            .filter((key) => key !== "time" && key !== "duration")
            .map((key) => [key, item[key]])
        ),
      }));

      const dataGroups: Record<string, ProcessedActivity[]> = {};
      activities.forEach((activity) => {
        const groupKey = activity[sliceBy] || "Unknown";
        if (!dataGroups[groupKey]) {
          dataGroups[groupKey] = [];
        }
        dataGroups[groupKey].push(activity);
      });

      const groups: DataGroup[] = Object.entries(dataGroups)
        .map(([name, activities]) => ({
          name,
          activities,
          totalDuration: activities.reduce((sum, act) => sum + act.duration, 0),
        }))
        .sort((a, b) => b.totalDuration - a.totalDuration);

      const totalTime = groups.reduce(
        (sum, group) => sum + group.totalDuration,
        0
      );

      const calculatedHeight =
        groups.length * ROW_HEIGHT + margin.top + margin.bottom;

      const timeScale = scaleTime({
        domain: [startDate, endDate],
        range: [margin.left, dimensions.width - margin.right],
      });

      const yScale = scaleLinear({
        domain: [0, groups.length],
        range: [margin.top, calculatedHeight - margin.bottom],
      });

      return { timeScale, yScale, groups, totalTime, calculatedHeight };
    }, [dimensions.width, margin, rawData, sliceBy]);

  useEffect(() => {
    setDimensions((prev) => ({ ...prev, height: calculatedHeight }));
  }, [calculatedHeight]);

  const getHourLabel = (date: Date) => {
    const hour = date.getHours();
    if (hour === 0) return "12a";
    if (hour === 12) return "12p";
    return `${hour % 12}${hour < 12 ? "a" : "p"}`;
  };

  const tickCount = useMemo(() => {
    const width = dimensions.width;
    if (width < 600) return 6;
    if (width < 960) return 12;
    return 24;
  }, [dimensions.width]);

  const hasNoData = rawData.data.length === 0;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-xl bg-[rgb(18,18,18)] p-4"
    >
      <DayHeader data={rawData} totalTime={totalTime} />

      {hasNoData ? (
        <EmptyState date={new Date(rawData.start)} />
      ) : (
        <>
          <svg width="100%" height={dimensions.height}>
            <Line
              from={{ x: margin.left, y: margin.top }}
              to={{ x: margin.left, y: calculatedHeight - margin.bottom }}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
            <Line
              from={{ x: dimensions.width - margin.right, y: margin.top }}
              to={{
                x: dimensions.width - margin.right,
                y: calculatedHeight - margin.bottom,
              }}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />

            <Group top={margin.top - 25}>
              {timeScale.ticks(tickCount).map((date, index) => {
                const x = timeScale(date);
                const label = getHourLabel(date);
                const isEdge = index === 0 || index === tickCount - 1;

                return (
                  <g key={date.toISOString()}>
                    <text
                      x={x}
                      y={15}
                      textAnchor={isEdge ? (index === 0 ? "start" : "end") : "middle"}
                      fill="#6b7280"
                      fontSize={12}
                      fontFamily="monospace"
                    >
                      {label}
                    </text>
                    <Line
                      from={{ x, y: 20 }}
                      to={{ x, y: 25 }}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
            </Group>

            {groups.map((group, index) => {
              const yPos = yScale(index);

              return (
                <Group key={group.name} top={yPos}>
                  {index === 0 && (
                    <Line
                      from={{ x: margin.left, y: 0 }}
                      to={{ x: dimensions.width - margin.right, y: 0 }}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={1}
                    />
                  )}

                  <rect
                    x={margin.left}
                    y={0}
                    width={dimensions.width - margin.left - margin.right}
                    height={ROW_HEIGHT}
                    fill="rgba(255,255,255,0.03)"
                  />

                  <text
                    x={margin.left - 20}
                    y={ROW_HEIGHT / 2 + 10}
                    fill="#fff"
                    textAnchor="end"
                    fontSize={14}
                    fontFamily="monospace"
                  >
                    {`${group.name} ${Math.floor(group.totalDuration / 3600)}:${String(
                      Math.floor((group.totalDuration % 3600) / 60)
                    ).padStart(2, "0")}`}
                  </text>

                  {group.activities.map((activity) => (
                    <Bar
                      key={activity.id}
                      x={timeScale(activity.start)}
                      y={(ROW_HEIGHT - LANE_HEIGHT) / 2}
                      width={Math.max(
                        2,
                        timeScale(activity.end) - timeScale(activity.start)
                      )}
                      height={LANE_HEIGHT}
                      fill={getColor(activity)}
                      rx={2}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={(event) => {
                        setTooltip({
                          x: event.clientX,
                          y: event.clientY,
                          activity,
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onClick={() => setModalActivity(activity)}
                    />
                  ))}

                  <Line
                    from={{ x: margin.left, y: ROW_HEIGHT }}
                    to={{ x: dimensions.width - margin.right, y: ROW_HEIGHT }}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={1}
                  />
                </Group>
              );
            })}
          </svg>

          {tooltip && (
            <div
              className="custom-tooltip absolute z-10 rounded p-2 text-xs text-white shadow-lg"
              style={{
                left: `${tooltip.x}px`,
                top: `${tooltip.y}px`,
                transform: "translateY(-100%) translateX(-150%)",
                pointerEvents: "none",
              }}
            >
              <div className="custom-tooltip-header text-center shadow">
                {tooltip.activity[sliceBy] || "Unknown"}
              </div>
              <div>
                {format(tooltip.activity.start, "h:mm a")} -{" "}
                {format(tooltip.activity.end, "h:mm a")}
              </div>
              <div>
                Duration:{" "}
                {convertSecondsToHoursAndMinutes(tooltip.activity.duration)}
              </div>
              {sliceBy !== "project" && <div>Project: {tooltip.activity.project}</div>}
            </div>
          )}
        </>
      )}

      {modalActivity && (
        <ActivityModal
          activity={modalActivity}
          open={Boolean(modalActivity)}
          onOpenChange={(open) => {
            if (!open) {
              setModalActivity(null);
            }
          }}
          sliceBy={sliceBy}
        />
      )}
    </div>
  );
}
