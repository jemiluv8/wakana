import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataItem, LeaderboardApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils";

import { RenderLanguages } from "./render-languages";
import { TooltipWithProvider } from "./tooltip-with-provider";

export function Hireable() {
  return (
    <div
      className="rounded-md border border-border"
      style={{ color: "#afc9f2", fontSize: "0.65rem", maxWidth: "50px" }}
    >
      hireable
    </div>
  );
}

interface iProps {
  title: string;
  data: LeaderboardApiResponse;
  titleClass?: string;
  searchParams?: Record<string, any>;
}

function rowMapper(dataItem: DataItem, index: number) {
  return {
    rank: index + 1,
    programmer: dataItem.user.display_name || "Anonymous User",
    hours_coded: dataItem.running_total.human_readable_total,
    daily_average: dataItem.running_total.human_readable_daily_average,
    languages: dataItem.running_total.languages.map((l) => l.name),
    hireable: true,
  };
}

export function LeaderBoardTable({
  title,
  data: leaderboardData,
  titleClass = "",
  searchParams,
}: iProps) {
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
    .map((item, index) => rowMapper(item, index));

  const subtitle = searchParams?.language ? `- ${searchParams.language}` : "";
  return (
    <div>
      <div className="mb-2 text-left">
        <h1 className={cn("text-3xl", titleClass)}>
          {title} {subtitle}
        </h1>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableCaption>
            <p>
              Leaderboard for the {range.text}. {range.start_text} -{" "}
              {range.end_text}
            </p>
          </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead className="w-48 text-left">Programmer</TableHead>
            <TableHead className="w-32 text-left">
              <div className="flex items-center gap-2">
                Hours Coded
                <TooltipWithProvider description="Total hours coded over the last 7 days from Yesterday, using default 15 minute timeout, only showing coding activity from known languages." />
              </div>
            </TableHead>
            <TableHead className="flex w-28 items-center gap-2 text-left">
              Daily Average
              <TooltipWithProvider description="Average hours coded per day, excluding days with zero coding activity." />
            </TableHead>
            <TableHead className="text-left min-w-0">
              Languages Used
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((leader) => (
            <TableRow key={leader.rank}>
              <TableCell className="w-16">{leader.rank}</TableCell>
              <TableCell className="w-48">{leader.programmer}</TableCell>
              <TableCell className="w-32">{leader.hours_coded}</TableCell>
              <TableCell className="w-28">{leader.daily_average}</TableCell>
              <TableCell className="min-w-0 max-w-none">
                <div className="flex flex-wrap gap-1 items-center">
                  <RenderLanguages languages={leader.languages} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter></TableFooter>
        </Table>
      </div>
    </div>
  );
}
