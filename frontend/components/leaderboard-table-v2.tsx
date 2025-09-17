"use client";

import { Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { COLORS } from "@/lib/constants/colors";
import { LeaderboardApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { convertSecondsToHoursAndMinutes } from "@/lib/utils/utils";

function getLanguageColor(language: string): string {
  const color = COLORS.languages?.[language];
  if (!color) return "#6b7280"; // gray-500 equivalent
  return color;
}

function LanguageBadge({
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
  const colorClass = getLanguageColor(language);

  // Truncate language name for compact mode
  const displayName =
    compact && language.length > 10 ? language.substring(0, 9) + "…" : language;

  const badge = (
    <span
      className={cn(
        "inline-flex items-center rounded font-medium transition-opacity text-white",
        compact ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        href && "hover:opacity-80 cursor-pointer"
      )}
      style={{ backgroundColor: colorClass }}
      title={language} // Show full name on hover
    >
      {displayName}
      {time && ` - ${time}`}
    </span>
  );

  if (href) {
    return <Link href={href}>{badge}</Link>;
  }

  return badge;
}

// Mobile Card Component
function LeaderboardCard({
  leader,
  pathname,
}: {
  leader: any;
  pathname: string;
}) {
  return (
    <div className="bg-background border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Rank */}
          <div className="flex-shrink-0">
            {leader.rank === 1 ? (
              <div className="flex items-center gap-1 font-bold text-yellow-500">
                <Crown className="w-5 h-5" />
                <span className="text-lg">#1</span>
              </div>
            ) : (
              <span className="text-lg font-bold text-muted-foreground">
                #{leader.rank}
              </span>
            )}
          </div>

          {/* Avatar and Name */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
              {leader.user.display_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <div className="font-medium truncate">
                {leader.user.display_name || "Anonymous"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">Hours Coded</div>
          <div className="font-mono font-semibold text-base">
            {leader.totalTime}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">Daily Avg</div>
          <div className="font-mono text-base">{leader.dailyAverage}</div>
        </div>
      </div>

      {/* Languages */}
      <div>
        <div className="text-xs text-muted-foreground mb-1">Top Languages</div>
        <div className="flex gap-1 flex-wrap">
          {leader.languages.slice(0, 3).map((lang: any, idx: number) => (
            <LanguageBadge
              key={idx}
              language={lang.name}
              time={convertSecondsToHoursAndMinutes(lang.total_seconds)}
              href={`${pathname}?language=${encodeURIComponent(lang.name)}`}
              compact={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface iProps {
  title: string;
  data: LeaderboardApiResponse;
  titleClass?: string;
  searchParams?: Record<string, any>;
}

export function LeaderBoardTableV2({
  title,
  data: leaderboardData,
  titleClass = "",
  searchParams,
}: iProps) {
  const pathname = usePathname();
  const { data: rawLeaderboard, range } = leaderboardData;
  const users = new Set();
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
      languages: item.running_total.languages.slice(0, 3), // Show top 3 languages
    }));

  const subtitle = searchParams?.language ? `- ${searchParams.language}` : "";

  return (
    <div className="w-full mx-auto px-2 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h1 className={cn("text-3xl font-bold", titleClass)}>
          {title} {subtitle}
        </h1>
        <p className="text-muted-foreground mt-2">
          {range.text} • {range.start_text} - {range.end_text}
        </p>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-3">
        {leaderboard.map((leader) => (
          <LeaderboardCard
            key={leader.rank}
            leader={leader}
            pathname={pathname}
          />
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-background border border-border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-3 font-medium text-muted-foreground text-sm">
                Rank
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground text-sm">
                User
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap text-sm">
                Hours Coded
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground whitespace-nowrap text-sm">
                Daily Avg
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground text-sm">
                Languages
              </th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((leader) => (
              <tr
                key={leader.rank}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {leader.rank === 1 ? (
                      <div className="flex items-center gap-1 font-bold text-yellow-500">
                        <Crown className="w-4 h-4" />
                        <span className="text-base">#1</span>
                      </div>
                    ) : (
                      <span className="font-medium text-base">
                        #{leader.rank}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {leader.user.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-base truncate">
                        {leader.user.display_name || "Anonymous"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-left whitespace-nowrap">
                  <span className="font-mono font-semibold text-base">
                    {leader.totalTime}
                  </span>
                </td>
                <td className="p-3 text-left whitespace-nowrap">
                  <span className="font-mono text-muted-foreground text-base">
                    {leader.dailyAverage}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {leader.languages.map((lang, idx) => (
                      <LanguageBadge
                        key={idx}
                        language={lang.name}
                        time={convertSecondsToHoursAndMinutes(
                          lang.total_seconds
                        )}
                        href={`${pathname}?language=${encodeURIComponent(lang.name)}`}
                        compact={false}
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
