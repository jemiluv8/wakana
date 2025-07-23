import { format, subDays } from "date-fns";
import Link from "next/link";

import { fetchData } from "@/actions";
import { ProjectCard } from "@/components/project-card";
import { SummariesApiResponse } from "@/lib/types";
import {
  convertSecondsToHoursAndMinutes,
  makePieChartDataFromRawApiResponse,
} from "@/lib/utils";

interface DashboardProjectsProps {
  searchParams: Record<string, any>;
}

export async function DashboardProjects({
  searchParams,
}: DashboardProjectsProps) {
  const start =
    searchParams.start || format(subDays(new Date(), 6), "yyyy-MM-dd");
  const end = searchParams.end || format(new Date(), "yyyy-MM-dd");
  const url = `/v1/users/current/summaries?${new URLSearchParams({ start, end })}`;

  const durationData = await fetchData<SummariesApiResponse>(url, true);

  if (!durationData) {
    return (
      <div className="text-center text-red-500">
        Error fetching projects data
      </div>
    );
  }

  const projects = makePieChartDataFromRawApiResponse(
    durationData.data,
    "projects"
  );

  return (
    <div className="my-5">
      <div className="flex items-baseline gap-1 align-middle">
        <h1 className="text-2xl mb-4">Projects</h1>
      </div>
      <div className="w-full">
        <div className="three-grid" id="projects">
          {projects.map((project: { key: string; total: number }) => (
            <ProjectCard
              key={project.key}
              title={project.key}
              duration={convertSecondsToHoursAndMinutes(project.total, true)}
            />
          ))}
          {projects.length === 0 && (
            <div className="project-wrapper">
              <a className="project-card">
                <div className="project-content">
                  <h3>No projects available yet</h3>
                  <p>
                    Check your plugin status to see if any of your plugins have
                    been detected.
                  </p>
                  <p className="mt-2 cursor-pointer">
                    You may also checkout{" "}
                    <Link href="/installation" className="underline">
                      Installation Guide
                    </Link>
                  </p>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
