import { ApiKeyCopier } from "@/components/copy-api-key";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getSession } from "@/actions";
import { WakatimeIntegration } from "@/components/wakatime-integration";

export default async function Page() {
  const session = await getSession();

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
          <ApiKeyCopier token={session.token} />
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
          <WakatimeIntegration
            token={session.token}
            hasWakatimeIntegration={session.user.has_wakatime_integration}
          />
        </CardContent>
        <p></p>
        {session.user.has_wakatime_integration && (
          <CardFooter className="border-t px-6 py-4">
            <p className="text-green-500 text-sm">
              You have integrated wakatime. Our server will relay all heartbeats
              to your wakatime account
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}