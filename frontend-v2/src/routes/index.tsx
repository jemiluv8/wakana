import { createFileRoute } from "@tanstack/react-router";

import FeatureSection from "~/components/hero/features-section";
import { Hero } from "~/components/hero/hero";
import HowItWorks from "~/components/hero/how-it-works";
import { MainLayout } from "~/components/layouts/main-layout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Homepage",
      },
      {
        name: "description",
        content: "Wakana homepage",
      },
    ],
  }),
  // middleware: [],
  component: HomePage,
});

function HomePage() {
  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center">
        <Hero />
        <FeatureSection />
        <HowItWorks />
      </div>
    </MainLayout>
  );
}
