import * as React from "react";

import { Icons } from "~/components/icons";
import { buttonVariants } from "~/components/ui/button";
import { startGithubLoginFlow } from "~/lib/oauth/github";
import { cn } from "~/lib/utils";

export function SocialLogin({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isGitHubLoading, setIsGitHubLoading] = React.useState(false);

  return (
    <div className={cn("grid gap-6 my-5", className)} {...props}>
      <a
        href={startGithubLoginFlow()}
        className={cn(buttonVariants({ variant: "secondary" }))}
        onClick={() => setIsGitHubLoading(true)}
        aria-disabled={isGitHubLoading}
      >
        {isGitHubLoading ? (
          <Icons.spinner className="mr-2 size-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 size-4" />
        )}
        Github
      </a>
    </div>
  );
}