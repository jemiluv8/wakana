import { Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { startCase, truncate } from "lodash";

import { Card, CardContent, CardHeader } from "~/components/ui/card";

import { ProjectTimeImage } from "./project-time-image";

interface ProjectData {
  id: string;
  name: string;
  last_heartbeat_at: string;
  human_readable_last_heartbeat_at: string;
  urlencoded_name: string;
  created_at: string;
}

export default function ProjectListCard({ project }: { project: ProjectData }) {
  // Calculate last updated time
  const lastUpdatedAt = formatDistanceToNow(
    new Date(project.last_heartbeat_at),
    { addSuffix: true }
  );

  // Calculate project age
  const projectAge = formatDistanceToNow(new Date(project.created_at), {
    addSuffix: false,
  });

  // Generate a random color based on project name (for consistency)
  const getRandomColor = (name: string) => {
    // Generate a hash from the string
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to hex color
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }

    return color;
  };

  // Get initials from project name
  const getProjectInitials = (name: string) => {
    return name
      .split("-")
      .map((word) => word[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
  };

  const displayName = startCase(truncate(project.name, { length: 20 }));
  const projectId = truncate(project.name, { length: 15 });

  return (
    <Link
      to="/projects/$id"
      params={{ id: project.id }}
      className="block w-full border-border"
    >
      <Card className="w-full overflow-hidden border-border/80 p-3 shadow-sm duration-300 ease-in-out hover:border-white/15 hover:bg-white/4 sm:p-4">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center font-semibold text-white"
                style={{ backgroundColor: getRandomColor(project.name) }}
              >
                {getProjectInitials(project.name)}
              </div>
              <div className="min-w-0">
                <h3
                  className="truncate text-lg font-semibold tracking-tight sm:text-xl"
                  title={startCase(project.name)}
                >
                  {displayName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Created {projectAge} ago
                </p>
              </div>
            </div>
            <div className="flex justify-start sm:justify-end">
              <ProjectTimeImage project={project} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-1">
          <div className="space-y-3">
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Project ID</span>
              <span className="font-mono break-all text-foreground">
                {projectId}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Last updated at</span>
              <span className="text-foreground">{lastUpdatedAt}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
