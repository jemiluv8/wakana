import * as React from "react";
import { Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { apiFetch } from "~/lib/api";

export function KeystrokeTimeout({
  initialValue,
}: {
  initialValue?: number;
}) {
  const queryClient = useQueryClient();
  const [value, setValue] = React.useState(initialValue ?? 0);

  React.useEffect(() => {
    setValue(initialValue ?? 0);
  }, [initialValue]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiFetch("/v1/profile", {
        method: "PUT",
        body: JSON.stringify({
          heartbeats_timeout_sec: value,
        }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
      toast.success("Keystroke timeout saved", {
        description:
          "Future summaries will use the new keystroke timeout value.",
      });
    },
    onError: (error) => {
      toast.error("Error updating keystroke timeout", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="number"
        className="h-11 py-0"
        placeholder="Keystroke Timeout"
        disabled={saveMutation.isPending}
        value={value}
        onChange={(e) => setValue(+e.target.value)}
      />
      <Button
        type="button"
        variant="outline"
        disabled={saveMutation.isPending}
        onClick={() => saveMutation.mutate()}
      >
        <Save className="size-4" />
        Save
      </Button>
    </div>
  );
}

