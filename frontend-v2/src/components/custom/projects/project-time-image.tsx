import { useAuth } from "~/lib/providers/auth-provider";
import { Project } from "./projects-table";
import { VITE_PUBLIC_API_URL } from "~/config";

export function ProjectTimeImage({ project }: { project: Project }) {
  const { user, token } = useAuth();

  if (!user || !token) {
    return null;
  }

  const src = `${VITE_PUBLIC_API_URL}/badge/${user.id}/project:${project.id}/interval:all_time?label=total&token=${encodeURIComponent(token)}`;
  return (
    <img
      className="with-url-src h-auto w-[96px] max-w-full sm:w-[120px]"
      src={src}
      alt="Badge"
      width={120}
      height={15}
    />
  );
}
