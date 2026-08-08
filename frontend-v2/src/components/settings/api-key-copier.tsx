import * as React from "react";
import { Copy, Eye, EyeOff, RefreshCcw } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { apiFetch } from "~/lib/api";

type ApiKeyResponse = {
  apiKey: string;
};

export function ApiKeyCopier() {
  const queryClient = useQueryClient();
  const [masked, setMasked] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["settings", "api-key"],
    queryFn: () => apiFetch<ApiKeyResponse>("/v1/auth/api-key"),
    staleTime: 10 * 60 * 1000,
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiFetch<ApiKeyResponse>("/v1/auth/api-key/refresh", { method: "POST" }),
    onSuccess: async (response) => {
      setMasked(false);
      await queryClient.invalidateQueries({ queryKey: ["settings", "api-key"] });
      toast.success("API key refreshed", {
        description: "Copy the new key into your editor configuration.",
      });
    },
    onError: (error) => {
      toast.error("Failed to refresh api key", {
        description: error instanceof Error ? error.message : "Something went wrong",
      });
    },
  });

  const apiKey = data?.apiKey || "";
  const displayedKey = masked ? "*".repeat(24) : apiKey;

  const handleCopy = async () => {
    if (!apiKey) {
      return;
    }

    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input
        className="h-11 py-0 font-mono text-sm"
        placeholder="API Key"
        disabled
        value={isLoading ? "Loading..." : displayedKey}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setMasked((current) => !current)}
        disabled={!apiKey}
      >
        {masked ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => {
          const confirmed = window.confirm(
            "Refresh API key? This will invalidate the current key."
          );
          if (!confirmed) {
            return;
          }
          refreshMutation.mutate();
        }}
        disabled={refreshMutation.isPending}
      >
        <RefreshCcw className={refreshMutation.isPending ? "size-4 animate-spin" : "size-4"} />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={handleCopy}
        disabled={!apiKey}
      >
        <Copy className="size-4" />
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

