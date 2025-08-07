"use client";

import { LeaderboardApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { COLORS } from "@/lib/constants/colors";

function getLanguageColor(language: string): string {
  const color = COLORS.languages?.[language];
  if (!color) return "#6b7280"; // gray-500 equivalent
  return color;
}

function LanguageBadge({
  language,
  time,
  href,
}: {
  language: string;
  time?: string;
  href?: string;
}) {
  const colorClass = getLanguageColor(language);

  const badge = (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium transition-opacity text-white",
        href && "hover:opacity-80 cursor-pointer"
      )}
      style={{ backgroundColor: colorClass }}
    >
      {language}
      {time && ` - ${time}`}
    </span>
  );

  if (href) {
    return <Link href={href}>{badge}</Link>;
  }

  return badge;
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
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className={cn("text-3xl font-bold", titleClass)}>
          {title} {subtitle}
        </h1>
        <p className="text-muted-foreground mt-2">
          {range.text} • {range.start_text} - {range.end_text}
        </p>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 font-medium text-muted-foreground">
                Position
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
                User
              </th>
              <th className="text-right p-4 font-medium text-muted-foreground">
                Hours Coded
              </th>
              <th className="text-right p-4 font-medium text-muted-foreground">
                Daily Average
              </th>
              <th className="text-left p-4 font-medium text-muted-foreground">
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
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {leader.rank === 1 ? (
                      <div className="flex items-center gap-1 font-bold text-yellow-500">
                        <Crown className="w-4 h-4" />
                        <span>#1</span>
                      </div>
                    ) : (
                      <span className="font-medium">#{leader.rank}</span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                      {leader.user.display_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div className="font-medium">
                        {leader.user.display_name || "Anonymous"}
                      </div>
                      {leader.user.username && (
                        <div className="text-sm text-muted-foreground">
                          @{leader.user.username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="font-mono font-medium">
                    {leader.totalTime}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-mono text-muted-foreground">
                    {leader.dailyAverage}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2 flex-wrap">
                    {leader.languages.map((lang, idx) => (
                      <LanguageBadge
                        key={idx}
                        language={lang.name}
                        time={
                          lang.total_seconds > 3600
                            ? `${Math.floor(lang.total_seconds / 3600)} h ${Math.floor((lang.total_seconds % 3600) / 60)} m`
                            : `${Math.floor(lang.total_seconds / 60)} m`
                        }
                        href={`${pathname}?language=${encodeURIComponent(lang.name)}`}
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
