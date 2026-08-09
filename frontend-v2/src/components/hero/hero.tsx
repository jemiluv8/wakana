import { Link } from "@tanstack/react-router";
import { SparklesIcon } from "lucide-react";

import { FadeOnView } from "~/components/custom/fade-on-view";
import { cn } from "~/lib/utils";

import { Badge } from "../ui/badge";
import styles from "./hero.module.css";

export function Hero() {
  return (
    <section className="relative flex flex-col justify-center px-6 text-center">
      <div className="min-h-[30vh] py-8">
        <FadeOnView>
          <Badge variant="secondary" className="mx-auto w-fit">
            <SparklesIcon className="mr-2 size-4" />
            Beta Testing
          </Badge>
        </FadeOnView>
        <FadeOnView delay={0.2}>
          <h1
            className={cn(
              "sm:flex-center gap-4 py-4 sm:gap-4 md:py-6 font-semibold tracking-tighter text-secondary-foreground text-4xl leading-snug sm:text-5xl md:text-6xl lg:text-7xl"
            )}
          >
            Observe your work in real time
          </h1>
        </FadeOnView>
        <FadeOnView delay={0.4}>
          <p className="text-base leading-7 text-muted-foreground sm:text-lg md:text-xl">
            Developer dashboards for insights into your work habits
          </p>
        </FadeOnView>
        <div className="flex-gap justify-center">
          <FadeOnView delay={0.6} className="mt-12 space-x-2">
            <Link
              to="/auth/login"
              className={cn("font-heading", styles.heroCta)}
            >
              Try it for free
            </Link>
          </FadeOnView>
        </div>
      </div>
      <FadeOnView
        delay={1}
        className={cn(
          styles.heroBorderAnimation,
          "mx-auto mt-16 max-w-screen-xl rounded-2xl p-px"
        )}
        style={{
          maskImage: "linear-gradient(to bottom, black 30%, transparent 90%)",
          borderWidth: 0,
        }}
      >
        <div
          className={cn(
            "rounded-[1rem] overflow-hidden p-2 z-10",
            "bg-background"
          )}
        >
          <div className="z-10">
            <img
              src="/neo-dashboard.png"
              alt="App img"
              width={1920}
              height={1080}
              className="relative z-10 overflow-hidden rounded-[12px] border"
            />
            <img
              src="/bg-blur-1.webp"
              alt="background blur"
              width={1920}
              height={1080}
              className="absolute opacity-30"
            />
          </div>
        </div>
      </FadeOnView>
    </section>
  );
}
