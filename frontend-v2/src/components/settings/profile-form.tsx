import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { apiFetch } from "~/lib/api";
import type { UserProfile } from "~/types";

type ProfileFormValues = Pick<
  UserProfile,
  "name" | "username" | "bio" | "github_handle" | "twitter_handle" | "linked_in_handle"
>;

export function ProfileForm({ user }: { user: UserProfile }) {
  const queryClient = useQueryClient();
  const [form, setForm] = React.useState<ProfileFormValues>({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "",
    github_handle: user.github_handle || "",
    twitter_handle: user.twitter_handle || "",
    linked_in_handle: user.linked_in_handle || "",
  });

  React.useEffect(() => {
    setForm({
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      github_handle: user.github_handle || "",
      twitter_handle: user.twitter_handle || "",
      linked_in_handle: user.linked_in_handle || "",
    });
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiFetch<UserProfile>("/v1/profile", {
        method: "PUT",
        body: JSON.stringify(form),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      toast.success("Profile saved");
    },
    onError: (error) => {
      toast.error("Failed to save profile", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  const setField = <K extends keyof ProfileFormValues>(
    key: K,
    value: ProfileFormValues[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  return (
    <form
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        updateMutation.mutate();
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
        />
        <p className="text-sm text-muted-foreground">This is your public display name.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder="Your username"
          value={form.username}
          onChange={(e) => setField("username", e.target.value)}
        />
        <p className="text-sm text-muted-foreground">This is your public username.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us a little bit about yourself"
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="github_handle">GitHub</Label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input px-3 text-sm text-muted-foreground">
            https://github.com/
          </span>
          <Input
            id="github_handle"
            className="rounded-l-none"
            value={form.github_handle}
            onChange={(e) => setField("github_handle", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="twitter_handle">X (Twitter)</Label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input px-3 text-sm text-muted-foreground">
            https://x.com/@
          </span>
          <Input
            id="twitter_handle"
            className="rounded-l-none"
            value={form.twitter_handle}
            onChange={(e) => setField("twitter_handle", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="linked_in_handle">LinkedIn</Label>
        <div className="flex">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input px-3 text-sm text-muted-foreground">
            https://linkedin.com/in/
          </span>
          <Input
            id="linked_in_handle"
            className="rounded-l-none"
            value={form.linked_in_handle}
            onChange={(e) => setField("linked_in_handle", e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" disabled={updateMutation.isPending}>
        {updateMutation.isPending ? (
          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        Update profile
      </Button>
    </form>
  );
}

