import { fetchData } from "@/actions";
import { humanizeDate } from "@/lib/utils";

export interface iPluginUserAgent {
  id: string;
  value: string;
  editor: string;
  version: string;
  os: string;
  last_seen_at: string;
  is_browser_extension: boolean;
  is_desktop_app: boolean;
  created_at: string;
  cli_version: string;
  go_version: string;
}

function PluginStatusCard({ agent }: { agent: iPluginUserAgent }) {
  const status = "Up";

  return (
    <div className="plugin-status surface flex-col justify-center gap-5 md:flex-row">
      <div className="flex flex-col justify-center">
        <h1 className="text-2xl">{agent.editor}</h1>
        <p className="text-sm">
          <b>Last Seen: </b>
          {humanizeDate(agent.last_seen_at)}
        </p>
        <p className="text-sm">
          <b>Version: </b>
          {agent.version} <span></span>
          with cli {agent.cli_version}
        </p>
      </div>
      <div>
        <h1 className="text-4xl font-bold text-green-500">{status}</h1>
      </div>
    </div>
  );
}

export async function PluginStatusList() {
  const userAgents = await fetchData<{ data: iPluginUserAgent[] }>(
    "/v1/users/current/user-agents"
  );
  if (!userAgents) {
    return <p>Error fetching </p>;
  }

  return (
    <div className="mx-auto mr-12 flex w-full flex-col justify-center gap-5">
      {userAgents.data.map((agent) => (
        <PluginStatusCard agent={agent} key={agent.id} />
      ))}

      {userAgents.data.length === 0 && (
        <p className="text-center text-lg">
          We have not received any plugin activity for your account. <br />{" "}
          Check your plugin setup to ensure it is working correctly, code a
          bit and come back to check again.
        </p>
      )}
    </div>
  );
}