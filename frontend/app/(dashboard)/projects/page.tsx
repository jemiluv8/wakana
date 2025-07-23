import { Suspense } from "react";
import { Metadata } from "next";
import { ProjectsList } from "@/components/projects/ProjectsList";
import { ProjectsSkeleton } from "@/components/ui/SectionSkeleton";

interface PageProps {
  searchParams: Record<string, any>;
}

export const metadata: Metadata = {
  title: "Projects",
  description: "Wakana projects, view all projects tracked by wakana.",
};

export default function Projects({ searchParams }: PageProps) {
  return (
    <div className="my-6">
      <div className="mb-5 flex items-center justify-start">
        <h1 className="text-4xl">Projects</h1>
      </div>
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
