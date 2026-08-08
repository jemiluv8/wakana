import * as React from "react";
import { Pen, PenOff, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { apiFetch } from "~/lib/api";
import { useAuth } from "~/lib/providers/auth-provider";

export function WakatimeIntegration() {
  const queryClient = useQueryClient();
  const { token, user, setSession } = useAuth();
  const [showEditable, setShowEditable] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/v1/settings", {
        method: "POST",
        body: JSON.stringify({
          action: "toggle_wakatime",
          api_url: "https://api.wakatime.com/api/v1",
          api_key: apiKey,
        }),
      }),
    onSuccess: async () => {
      if (token && user) {
        setSession({
          token,
          user: {
            ...user,
            has_wakatime_integration: true,
          },
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      setShowEditable(false);
      setApiKey("");
      toast.success("WakaTime integration saved");
    },
    onError: (error) => {
      toast.error("Failed to save WakaTime api key", {
        description:
          error instanceof Error
            ? error.message
            : "Your WakaTime api key could not be saved right now.",
      });
    },
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        className="h-11 py-0"
        placeholder="WakaTime api key"
        value={showEditable ? apiKey : "*******************"}
        onChange={(e) => setApiKey(e.target.value)}
        disabled={!showEditable}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setShowEditable((current) => !current)}
      >
        {showEditable ? <PenOff className="size-4" /> : <Pen className="size-4" />}
      </Button>
      {showEditable ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!apiKey || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Save className="size-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
}

