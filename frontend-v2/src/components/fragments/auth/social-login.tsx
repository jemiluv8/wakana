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
    <div className={cn("grid gap-6 my-5 w-full", className)} {...props}>
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-12 w-full justify-center gap-3 px-4 text-base font-medium sm:h-12"
        )}
        onClick={() => {
          setIsGitHubLoading(true);
          window.location.href = startGithubLoginFlow();
        }}
        disabled={isGitHubLoading}
      >
        {isGitHubLoading ? (
          <Icons.spinner className="size-5 animate-spin" />
        ) : (
          <Icons.gitHub className="size-5" />
        )}
        Github
      </button>
    </div>
  );
}
