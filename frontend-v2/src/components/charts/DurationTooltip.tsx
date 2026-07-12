import { useSearch } from "@tanstack/react-router";
import { CircleQuestionMarkIcon } from "lucide-react";
import { getSelectedPeriodLabel } from "~/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface iProps {
  title: string;
  subtitle?: string;
}

export function DurationTooltip({ title, subtitle }: iProps) {
  const { start, end } = useSearch({ strict: false }) as any;

  const durationText = getSelectedPeriodLabel(
    end && start ? { end, start } : {}
  );
  return (
    <div className="chart-box-title">
      {title}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleQuestionMarkIcon className="cursor-pointer hover:opacity-70" />
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {subtitle} {durationText}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
