import { format, subDays } from "date-fns";
import startCase from "lodash/startCase";
import { CalendarIcon, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import React from "react";
import { DateRange } from "react-day-picker";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Link } from "@tanstack/react-router";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { buildQueryForRangeQuery, cn, DashboardRangeQuery, getSelectedPeriodLabel } from "~/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function DashboardPeriodSelector({
  searchParams,
  baseUrl = "/dashboard",
}: {
  searchParams: Record<string, any>;
  baseUrl?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <span
          className="cursor-pointer"
          style={{ borderBottom: "1px solid black", color: "#36558b" }}
        >
          {getSelectedPeriodLabel(searchParams || {})}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="period-date-picker w-56">
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary hover:text-white"
          asChild
        >
          <a href={`${baseUrl}/day?date=${format(new Date(), "yyyy-MM-dd")}`}>
            Today
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-primary hover:text-white"
          asChild
        >
          <a
            href={`${baseUrl}/day?date=${format(
              subDays(new Date(), 1),
              "yyyy-MM-dd"
            )}`}
          >
            Yesterday
          </a>
        </DropdownMenuItem>
        {Object.values(DashboardRangeQuery).map((query, index) => (
          <DropdownMenuItem
            className="period-date-picker cursor-pointer hover:bg-primary hover:text-white"
            key={index}
          >
            <a href={baseUrl + buildQueryForRangeQuery(query)}>
              {startCase(query)}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardPeriodSelectorV2({
  searchParams,
  baseUrl = "/dashboard",
}: {
  searchParams: Record<string, any>;
  baseUrl?: string;
}) {
  const navigate = useNavigate();
  const linkToToday = `${baseUrl}/day/${format(new Date(), "yyyy-MM-dd")}`;
  const linkToYesterday = `${baseUrl}/day/${format(subDays(new Date(), 1), "yyyy-MM-dd")}`;
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    undefined
  );

  const applyFilter = React.useCallback(() => {
    if (dateRange && dateRange.to && dateRange.from) {
      const start = format(dateRange.from, "yyyy-MM-dd");
      const end = format(dateRange.to, "yyyy-MM-dd");
      const route = `${baseUrl}?start=${start}&end=${end}`;
      navigate({ to: route })
    }
  }, [dateRange, navigate, baseUrl]);

  return (
    <div className="flex items-center gap-3">
      <Link
        to={linkToToday}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "text-white hover:bg-gray-800 h-9 px-3",
          "border hover:border-gray-600"
        )}
      >
        <Zap className="w-4 h-4 mr-2" />
        Today
      </Link>
      <div className="flex items-center hover:bg-gray-800 rounded-md border border-gray-700 cursor-pointer">
        <Select
          onValueChange={(value: string) => {
            window.location.href = value;
          }}
        >
          <SelectTrigger
            className={cn(
              "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "text-white hover:bg-gray-800 h-9 px-3",
              "border border-gray-700 hover:border-gray-600"
            )}
          >
            <SelectValue
              placeholder={getSelectedPeriodLabel(searchParams || {})}
            />
          </SelectTrigger>
          <SelectContent className="text-white border-gray-700 cursor-pointer">
            {Object.values(DashboardRangeQuery).map((query, index) => (
              <SelectItem
                key={index}
                value={baseUrl + buildQueryForRangeQuery(query)}
                className="cursor-pointer"
              >
                {startCase(query)}
              </SelectItem>
            ))}
            <SelectItem
              className="cursor-pointer"
              key="today"
              value={linkToToday}
            >
              Today
            </SelectItem>
            <SelectItem
              className="cursor-pointer"
              key="yesterday"
              value={linkToYesterday}
            >
              Yesterday
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Popover modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn("pl-3 text-left font-normal")}
          >
            <CalendarIcon className="ml-auto size-4 opacity-80" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange as any}
            disabled={(date: Date) => date > new Date()}
            numberOfMonths={2}
          />
          <div className="flex justify-end items-center px-2">
            <Button onClick={applyFilter} className="block w-full" size="sm">
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
