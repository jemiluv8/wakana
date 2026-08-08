import { useLocation } from "@tanstack/react-router";
import { truncate } from "lodash";
import { HelpCircle } from "lucide-react";

import { COLORS } from "~/lib/constants";
import { cn, convertSecondsToHoursAndMinutes } from "~/lib/utils";
import type { LeaderboardApiResponse } from "~/types";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

function getLanguageColor(language: string): string {
  return COLORS.languages?.[language] ?? "#6b7280";
}

function TooltipWithProvider({ description }: { description: string }) {
  return (
    <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
          <HelpCircle className="size-4" />
          </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function RenderLanguages({ languages }: { languages: string[] }) {
  const currentPath = useLocation({
    select: (location) => location.pathname,
  });
  const truncated = truncate(languages.join(", "), { length: 75 });
  const truncatedArray = truncated.split(", ");
  const lastItem = truncatedArray.pop();

  const items = truncatedArray.map((item, index) => (
    <a
      key={index}
      href={`${currentPath}?language=${encodeURIComponent(item)}`}
      className="text-white hover:underline"
    >
      {item},
    </a>
  ));

  const totalCharacters = truncatedArray.reduce(
    (acc, item) => acc + item.length + 1,
    0
  );
  const remainingCharacters = 300 - totalCharacters;
  const lastItemText = lastItem
    ? truncate(lastItem, { length: remainingCharacters })
    : "";

  return (
    <div className="flex" style={{ gap: "1px" }} title={languages.join(", ")}>
      {items}
      {lastItem && (
        <a
          href={`${currentPath}?language=${encodeURIComponent(lastItem)}`}
          className="text-white hover:underline"
        >
          {lastItemText}
        </a>
      )}
    </div>
  );
}

interface LeaderboardProps {
  title: string;
  data: LeaderboardApiResponse;
  titleClass?: string;
  searchParams?: Record<string, any>;
}

export function LeaderBoardTable({
  title,
  data: leaderboardData,
  titleClass = "",
  searchParams,
}: LeaderboardProps) {
  const { data: rawLeaderboard, range } = leaderboardData;
  const users = new Set<string>();
  const leaderboard = rawLeaderboard
    .filter((leaderData) => {
      if (users.has(leaderData.user.id)) {
        return false;
      }
      users.add(leaderData.user.id);
      return true;
    })
    .map((item, index) => ({
      rank: index + 1,
      programmer: item.user.display_name || "Anonymous User",
      hours_coded: item.running_total.human_readable_total,
      daily_average: item.running_total.human_readable_daily_average,
      languages: item.running_total.languages.map((l) => l.name),
    }));

  const subtitle = searchParams?.language ? `- ${searchParams.language}` : "";

  return (
    <div>
      <div className="mb-2 text-left">
        <h1 className={cn("text-3xl", titleClass)}>
          {title} {subtitle}
        </h1>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <caption>
            <p>
              Leaderboard for the {range.text}. {range.start_text} -{" "}
              {range.end_text}
            </p>
          </caption>
          <thead>
            <tr>
              <th className="w-16 text-left">Rank</th>
              <th className="w-48 text-left">Programmer</th>
              <th className="w-32 text-left">
                <div className="flex items-center gap-2">
                  Hours Coded
                  <TooltipWithProvider description="Total hours coded over the last 7 days from Yesterday, using default 15 minute timeout, only showing coding activity from known languages." />
                </div>
              </th>
              <th className="flex w-28 items-center gap-2 text-left">
                Daily Average
                <TooltipWithProvider description="Average hours coded per day, excluding days with zero coding activity." />
              </th>
              <th className="min-w-0 text-left">Languages Used</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((leader) => (
              <tr key={leader.rank}>
                <td className="w-16">{leader.rank}</td>
                <td className="w-48">{leader.programmer}</td>
                <td className="w-32">{leader.hours_coded}</td>
                <td className="w-28">{leader.daily_average}</td>
                <td className="min-w-0 max-w-none">
                  <div className="flex flex-wrap items-center gap-1">
                    <RenderLanguages languages={leader.languages} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LeaderboardLanguageBadge({
  language,
  time,
  href,
  compact = false,
}: {
  language: string;
  time?: string;
  href?: string;
  compact?: boolean;
}) {
  const color = getLanguageColor(language);
  const displayName =
    compact && language.length > 10 ? `${language.substring(0, 9)}…` : language;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded font-medium text-white transition-opacity",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        href && "cursor-pointer hover:opacity-80"
      )}
      style={{ backgroundColor: color }}
      title={language}
    >
      {displayName}
      {time ? ` - ${time}` : null}
    </span>
  );

  if (!href) {
    return badge;
  }

  return <a href={href}>{badge}</a>;
}

export function LeaderBoardTableV2({
  title,
  data,
  titleClass = "",
  searchParams,
}: LeaderboardProps) {
  return (
    <LeaderBoardTable
      title={title}
      data={data}
      titleClass={titleClass}
      searchParams={searchParams}
    />
  );
}
