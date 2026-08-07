// import Image from "next/image";


import { useAuth } from "~/lib/providers/auth-provider";
import { Project } from "./projects-table";
import { VITE_PUBLIC_API_URL } from "~/config";

export function ProjectTimeImage({ project }: { project: Project }) {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  const src = `${VITE_PUBLIC_API_URL}/badge/${user?.id}/project:${project.id}/interval:all_time?label=total`;
  return (
    <img
      className="with-url-src"
      src={src}
      alt="Badge"
      width={120}
      height={15}
    />
  );
}
