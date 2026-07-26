import { startOfDay } from "date-fns";
import { SummariesApiResponse } from "~/types";
import { useApiQuery } from "~/hooks/useApiQuery";
import React from "react";

export function CurrentWorkTime() {
  const url = React.useMemo(() => {
    const start = startOfDay(new Date()).toISOString();

    return `/v1/users/current/summaries?${new URLSearchParams({
      start,
      end: new Date().toISOString(),
    })}`;
  }, []);

  const { data, isLoading } = useApiQuery<SummariesApiResponse>(url, {
    refetchInterval: 20_000,
  });

  const todaysCodingTime = data?.cumulative_total.text ?? "- hrs - mins";

  return (
    <div
      className="flex items-center justify-center rounded-lg border-2 border-gray-800 px-3 align-middle text-slate-100 shadow"
      style={{
        paddingLeft: "10px",
        paddingRight: "10px",
        fontWeight: "bold",
        lineHeight: "2rem",
        fontFamily: "monaco",
        fontSize: "0.95rem",
      }}
    >
      <div className="flex items-center justify-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full border-double bg-red-500 outline outline-white mr-1 slow-pulse"></div>
        {todaysCodingTime}
      </div>
    </div>
  );
}
