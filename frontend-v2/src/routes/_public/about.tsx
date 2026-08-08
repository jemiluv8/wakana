import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Heart, History, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    title: "Open source and self-hosted",
    description:
      "Wakana is built to be owned by the people who use it, with the control and privacy that comes from running your own stack.",
    icon: ShieldCheck,
  },
  {
    title: "Feature parity first",
    description:
      "The rewrite focuses on matching the workflows people already depend on before layering in new ideas.",
    icon: Sparkles,
  },
  {
    title: "Built on the ecosystem",
    description:
      "The project leans on the same plugin ecosystem that made WakaTime useful in the first place.",
    icon: History,
  },
];

export const Route = createFileRoute("/_public/about")({
  head: () => ({
    meta: [
      {
        title: "About | Wakana",
      },
      {
        name: "description",
        content:
          "Learn about Wakana, an open source, self-hosted alternative to WakaTime for developer time tracking.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl py-8 sm:py-12 lg:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
          About Wakana
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Open tracking for teams and individuals who want control.
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          Wakana is a self-hosted, open source alternative to WakaTime. The goal
          is simple: keep the familiar editor workflow, preserve privacy, and
          make the product feel like something you can own.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <section
            key={item.title}
            className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {item.title}
            </h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              {item.description}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-8 grid gap-6 rounded-3xl border border-border bg-gradient-to-br from-background via-background to-muted/40 p-6 shadow-sm sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">
            Why this rewrite exists
          </h2>
          <div className="mt-4 space-y-4 text-base leading-8 text-muted-foreground">
            <p>
              The project started with the same practical expectation users have
              always had from WakaTime: point your plugin at an endpoint and
              get reliable tracking.
            </p>
            <p>
              From there, the rewrite focuses on clearer page structure, a more
              maintainable frontend, and a path to better product decisions
              without locking the app behind infrastructure complexity.
            </p>
            <p>
              The managed offering helps fund the work, but the core remains
              open and self-hostable for people who want the same codebase on
              their own infrastructure.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-background/90 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            In the same ecosystem
          </h3>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The rewrite was sped up by the broader open source ecosystem around
            WakaTime-compatible tooling, including projects that proved the
            core workflow was worth building on.
          </p>
          <a
            href="https://github.com/muety/wakapi"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Wakapi
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <div className="mt-6 rounded-xl bg-muted/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Heart className="h-4 w-4 text-rose-500" />
              Built for developers
            </div>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Self-hosted, open source, and focused on the everyday tracking
              workflow instead of trying to reshape it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
