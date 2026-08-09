import { Link, useLocation } from "@tanstack/react-router";
import { Crown } from "lucide-react";

import { COLORS } from "~/lib/constants";
import { cn, convertSecondsToHoursAndMinutes } from "~/lib/utils";
import type { LeaderboardApiResponse } from "~/types";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

function getLanguageColor(language: string): string {
  return COLORS.languages?.[language] ?? "#6b7280";
}
interface LeaderboardProps {
  title: string;
  data: LeaderboardApiResponse;
  titleClass?: string;
  searchParams?: Record<string, any>;
}

function LeaderboardLanguageBadge({
  language,
  time,
  pathname,
  compact = false,
}: {
  language: string;
  time?: string;
  pathname: string;
  compact?: boolean;
}) {
  const color = getLanguageColor(language);
  const displayName =
    compact && language.length > 10 ? `${language.substring(0, 9)}…` : language;

  return (
    <Link
      to={pathname}
      search={{ language }}
      className="inline-flex"
      title={language}
    >
      <span
        className={cn(
          "inline-flex items-center rounded-md font-medium text-white transition-opacity hover:opacity-85",
          compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs"
        )}
        style={{ backgroundColor: color }}
      >
        {displayName}
        {time ? ` - ${time}` : null}
      </span>
    </Link>
  );
}

function LeaderboardCard({
  leader,
  pathname,
}: {
  leader: {
    rank: number;
    user: LeaderboardApiResponse["data"][number]["user"];
    totalTime: string;
    dailyAverage: string;
    languages: LeaderboardApiResponse["data"][number]["running_total"]["languages"];
  };
  pathname: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4 transition-colors hover:bg-muted/30">
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {leader.rank === 1 ? (
              <div className="flex items-center gap-1 font-bold text-yellow-500">
                <Crown className="h-5 w-5" />
                <span className="text-lg">#1</span>
              </div>
            ) : (
              <span className="flex-shrink-0 text-lg font-bold text-muted-foreground">
                #{leader.rank}
              </span>
            )}

            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                {leader.user.display_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0">
                <div className="truncate font-medium text-foreground">
                  {leader.user.display_name || "Anonymous User"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Hours Coded</div>
          <div className="font-mono text-base font-semibold text-foreground">
            {leader.totalTime}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Daily Avg</div>
          <div className="font-mono text-base text-foreground">
            {leader.dailyAverage}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs text-muted-foreground">Top Languages</div>
        <div className="flex flex-wrap gap-1">
          {leader.languages.slice(0, 3).map((lang) => (
            <LeaderboardLanguageBadge
              key={lang.name}
              language={lang.name}
              time={convertSecondsToHoursAndMinutes(lang.total_seconds)}
              pathname={pathname}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function LeaderBoardTableV2({
  title,
  data: leaderboardData,
  titleClass = "",
  searchParams,
}: LeaderboardProps) {
  const pathname = useLocation({
    select: (location) => location.pathname,
  });
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
      user: item.user,
      totalTime: item.running_total.human_readable_total,
      dailyAverage: item.running_total.human_readable_daily_average,
      languages: item.running_total.languages.slice(0, 3),
    }));

  const subtitle = searchParams?.language ? `- ${searchParams.language}` : "";

  return (
    <div className="mx-auto w-full">
      <div className="mb-8 text-center">
        <h1 className={cn("text-3xl font-bold tracking-tight", titleClass)}>
          {title} {subtitle}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {range.text} • {range.start_text} - {range.end_text}
        </p>
      </div>

      <div className="space-y-3 md:hidden">
        {leaderboard.map((leader) => (
          <LeaderboardCard key={leader.rank} leader={leader} pathname={pathname} />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-border bg-background md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                Rank
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                User
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                Hours Coded
              </th>
              <th className="whitespace-nowrap px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                Daily Avg
              </th>
              <th className="px-4 py-4 text-left text-sm font-medium text-muted-foreground">
                Languages
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((leader) => (
              <tr
                key={leader.rank}
                className="border-b border-border last:border-b-0 transition-colors hover:bg-muted/30"
              >
                <td className="px-4 py-5">
                  <div className="flex items-center gap-1">
                    {leader.rank === 1 ? (
                      <div className="flex items-center gap-1 font-bold text-yellow-500">
                        <Crown className="h-4 w-4" />
                        <span className="text-base">#1</span>
                      </div>
                    ) : (
                      <span className="font-medium text-base">#{leader.rank}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-foreground">
                      {leader.user.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-base font-medium text-foreground">
                        {leader.user.display_name || "Anonymous User"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-5 text-left">
                  <span className="font-mono text-base font-semibold text-foreground">
                    {leader.totalTime}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-5 text-left">
                  <span className="font-mono text-base text-muted-foreground">
                    {leader.dailyAverage}
                  </span>
                </td>
                <td className="px-4 py-5">
                  <div className="flex flex-wrap gap-1">
                    {leader.languages.map((lang) => (
                      <LeaderboardLanguageBadge
                        key={lang.name}
                        language={lang.name}
                        time={convertSecondsToHoursAndMinutes(lang.total_seconds)}
                        pathname={pathname}
                      />
                    ))}
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
