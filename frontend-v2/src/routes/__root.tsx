// src/routes/__root.tsx
import * as React from "react";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { ThemeProvider } from "~/providers/theme-provider";
import { Toaster } from "~/components/ui/sonner";

import appCss from "~/styles/app.css?url";
import { seo } from "~/utils/seo";
import { cn } from "~/lib/utils";
import { siteConfig } from "~/config/site";
import { FadeOnView } from "~/components/custom/fade-on-view";
import PublicFooter from "~/components/fragments/sections/components/public-footer";
import { PublicMobileHeader } from "~/components/fragments/sections/public-mobile-header";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        name: "theme-color",
        content: "#ffffff",
      },
      ...seo({
        title: siteConfig.name,
        description: siteConfig.description,
      }),
    ],
    links: [
      { rel: "stylesheet", href: appCss },

      {
        rel: "icon",
        href: "/favicon.png",
      },
      {
        rel: "shortcut icon",
        href: "/favicon-16x16.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },

      {
        rel: "manifest",
        href: "/site.webmanifest",
      },
    ],
  }),

  errorComponent: (props) => <DefaultCatchBoundary {...props} />,

  notFoundComponent: () => <NotFound />,

  component: RootComponent,
});

function RootComponent() {
  const isLoggedIn = false;

  return (
    <RootDocument>
      <div className="flex flex-col min-h-screen font-rubik antialiased">
        <Header isLoggedIn={isLoggedIn} />
        <PublicMobileHeader />

        <main className="m-auto md:mx-14 flex flex-1 flex-col px-4 md:px-14 align-middle">
          <FadeOnView>
            {" "}
            <Outlet />
          </FadeOnView>
        </main>

        <PublicFooter />
      </div>
    </RootDocument>
  );
}

function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header className="sticky top-8 z-50 mb-20 mt-8 hidden justify-center rounded-lg px-2 md:flex md:px-4 font-bold">
      <nav className="z-20 flex h-[50px] items-center rounded-full border border-border bg-opacity-70 px-4 backdrop-blur-xl text-primary">
        <Link to="/">
          <img src="/white-icon.svg" alt="Logo" width={80} height={56} />
        </Link>

        <ul className="mx-3 space-x-2 text-sm md:flex font-bold">
          <Link
            to="/posts"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Installation
          </Link>

          <Link
            to="/posts"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            FAQ
          </Link>

          <Link
            to="/posts"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Plugins
          </Link>

          <Link
            to="/posts"
            className="inline-flex h-8 items-center px-3 py-2 hover:opacity-70"
          >
            Leaderboard
          </Link>
        </ul>

        <div className="hidden border-l border-border pl-4 pr-2 text-sm font-medium md:flex md:items-center md:gap-2">
          {isLoggedIn ? (
            <Link
              to="/posts"
              className="inline-flex h-8 items-center px-3 py-2 bg-primary rounded-md"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/posts"
              className="inline-flex h-8 items-center px-3 py-2 bg-primary text-secondary font-bold rounded-md"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body className={cn("min-h-screen bg-background font-rubik antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster />

          {import.meta.env.DEV && (
            <>
              <ReactQueryDevtools buttonPosition="bottom-left" />
              <TanStackRouterDevtools position="bottom-right" />
            </>
          )}
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  );
}
