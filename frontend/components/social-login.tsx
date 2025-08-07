"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import { Icons } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { startGithubLoginFlow } from "@/lib/oauth/github";
import { cn } from "@/lib/utils";

export function SocialLogin({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const router = useRouter();

  return (
    <div className={cn("grid gap-6 my-5", className)} {...props}>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        onClick={() => {
          setIsGitHubLoading(true);
          router.push(startGithubLoginFlow());
        }}
        disabled={isGitHubLoading}
      >
        {isGitHubLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 size-4" />
        )}{" "}
        Github
      </button>
    </div>
  );
}
