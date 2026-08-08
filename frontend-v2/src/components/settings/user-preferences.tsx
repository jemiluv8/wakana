import * as React from "react";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { apiFetch } from "~/lib/api";
import type { UserProfile } from "~/types";

type PreferenceKey =
  | "hireable"
  | "show_email_in_public"
  | "public_leaderboard";

export function UserPreferences({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient();
  const [values, setValues] = React.useState({
    hireable: user.hireable,
    show_email_in_public: user.show_email_in_public,
    public_leaderboard: user.public_leaderboard,
  });
  const [pendingPreference, setPendingPreference] = React.useState<PreferenceKey | null>(null);

  React.useEffect(() => {
    setValues({
      hireable: user.hireable,
      show_email_in_public: user.show_email_in_public,
      public_leaderboard: user.public_leaderboard,
    });
  }, [user]);

  const savePreference = useMutation({
    mutationFn: ({
      key,
      value,
    }: {
      key: PreferenceKey;
      value: boolean;
    }) =>
      apiFetch<UserProfile>("/v1/profile", {
        method: "PUT",
        body: JSON.stringify({ [key]: value }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      toast.success("Preference updated");
    },
    onError: (error) => {
      toast.error("Error updating preference", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
    onSettled: () => {
      setPendingPreference(null);
    },
  });

  const toggle = (key: PreferenceKey, value: boolean) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
    setPendingPreference(key);
    savePreference.mutate({ key, value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-6">
        <div className="space-y-0.5">
          <Label htmlFor="hireable-badge">Hireable Badge</Label>
          <p className="text-sm text-muted-foreground">
            Display a badge indicating you're open for hire.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingPreference === "hireable" ? <Loader2 className="size-4 animate-spin" /> : null}
          <Switch
            id="hireable-badge"
            checked={values.hireable}
            onCheckedChange={(checked) => toggle("hireable", checked)}
            disabled={pendingPreference !== null}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="space-y-0.5">
          <Label htmlFor="display-email">Display Email Publicly</Label>
          <p className="text-sm text-muted-foreground">
            Show your email address on your public profile.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingPreference === "show_email_in_public" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          <Switch
            id="display-email"
            checked={values.show_email_in_public}
            onCheckedChange={(checked) => toggle("show_email_in_public", checked)}
            disabled={pendingPreference !== null}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="space-y-0.5">
          <Label htmlFor="display-code-time">Public Leaderboard</Label>
          <p className="text-sm text-muted-foreground">
            You'll be shown on the public leaderboard.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingPreference === "public_leaderboard" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          <Switch
            id="display-code-time"
            checked={values.public_leaderboard}
            onCheckedChange={(checked) => toggle("public_leaderboard", checked)}
            disabled={pendingPreference !== null}
          />
        </div>
      </div>
    </div>
  );
}

