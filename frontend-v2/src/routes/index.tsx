import { createFileRoute } from "@tanstack/react-router";

import FeatureSection from "~/components/hero/features-section";
import { Hero } from "~/components/hero/hero";
import HowItWorks from "~/components/hero/how-it-works";
import { MainLayout } from "~/components/layouts/main-layout";
import { getAuthState } from "~/lib/guards/auth";

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
  loader: async () => {
    return {
      auth: await getAuthState(),
    };
  },
  component: HomePage,
});

function HomePage() {
  const { auth } = Route.useLoaderData();
  return (
    <MainLayout isLoggedIn={!!auth.authenticated}>
      <div className="flex flex-col justify-center items-center">
        <Hero />
        <FeatureSection />
        <HowItWorks />
      </div>
    </MainLayout>
  );
}
