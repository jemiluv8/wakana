import { createFileRoute, redirect } from "@tanstack/react-router";
// import "@fontsource/rubik/500.css";

// import { redirectIfLoggedIn } from "@/actions";
import FeatureSection from "~/components/hero/features-section";
import HowItWorks from "~/components/hero/how-it-works";
import { Hero } from "~/components/hero/hero";

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

  beforeLoad: async () => {
    const isLoggedIn = false;

    if (isLoggedIn) {
      throw redirect({
        to: "/posts",
      });
    }
  },

  component: HomePage,
});

function HomePage() {
  return (
    <div className="font-rubik">
      <Hero />
      <FeatureSection />
      <HowItWorks />
    </div>
  );
}
