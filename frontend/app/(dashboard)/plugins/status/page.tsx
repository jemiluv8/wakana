import { Metadata } from "next";
import { Suspense } from "react";
import { PluginStatusList } from "@/components/plugins/PluginStatusList";
import { PluginStatusSkeleton } from "@/components/ui/SectionSkeleton";

export const metadata: Metadata = {
  title: "Active Plugins",
  description: "Wakana plugins, check plugins and their health.",
};

export default function Page() {
  return (
    <div
      className="m-14 flex flex-col items-center justify-center md:px-32"
      style={{ minHeight: "60vh" }}
    >
      <h1 className="text-6xl">Plugin Status</h1>
      <p className="my-5 mb-12 text-lg">
        Your plugins and their health status.
      </p>

      <Suspense fallback={<PluginStatusSkeleton />}>
        <PluginStatusList />
      </Suspense>
    </div>
  );
}
