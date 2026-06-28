// src/routes/__root.tsx
import * as React from "react";
import {
  HeadContent,
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
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>

      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
