import Link from "next/link";

import { fetchData, getSession } from "@/actions";
import { ApiKeyCopier } from "@/components/copy-api-key";
import { DisconnectWakatime } from "@/components/disconnect-wakatime";
import { KeystrokeTimeout } from "@/components/keystroke-timeout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WakatimeIntegration } from "@/components/wakatime-integration";
import { UserProfile } from "@/lib/types";

export default async function Page() {
  const session = await getSession();
  const user = await fetchData<UserProfile>("/v1/profile");

  return (
    <div className="grid gap-6">
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Api Key</CardTitle>
          <CardDescription>
            This is used by our plugin to authenticate heartbeats sent from your
            editor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeyCopier />
        </CardContent>
      </Card>
      <Card x-chunk="dashboard-04-chunk-2">
        <CardHeader>
          <CardTitle>Wakatime Integration - Api Key</CardTitle>
          <CardDescription>
            To aide your transition from wakatime, we provide a means to forward
            heartbeats received to your wakatime account. The api key you enter
            here shall not be displayed on the user interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WakatimeIntegration />
        </CardContent>
        <p></p>
        {session.user.has_wakatime_integration && (
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <p className="text-sm text-green-500">
              You have integrated wakatime. Our server will relay all heartbeats
              to your wakatime account
            </p>
            <DisconnectWakatime />
          </CardFooter>
        )}
      </Card>
      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Keystroke Timeout</CardTitle>
          <CardDescription>
            This setting affects how a series of consecutive heartbeats sent by
            your IDE are aggregated to compute your total coding time.
            <Link href="/faqs">faqs</Link> to learn more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <KeystrokeTimeout initialValue={user?.heartbeats_timeout_sec} />
        </CardContent>
      </Card>
    </div>
  );
}
