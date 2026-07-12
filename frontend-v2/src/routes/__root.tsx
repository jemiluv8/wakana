// src/routes/__root.tsx
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";

import { DefaultCatchBoundary } from "~/components/DefaultCatchBoundary";
import { NotFound } from "~/components/NotFound";
import { Toaster } from "~/components/ui/sonner";
import { siteConfig } from "~/config/site";
import { cn } from "~/lib/utils";
import { ThemeProvider } from "~/providers/theme-provider";
import appCss from "~/styles/app.css?url";
import { AuthContext } from "~/types";
import { seo } from "~/utils/seo";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  auth: AuthContext;
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
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@300;400;500;600;700&display=swap",
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

      <body
        className={cn(
          "min-h-screen bg-background font-google-sans-flex antialiased text-foreground"
        )}
        style={{ fontFamily: "'Google Sans Flex', system-ui, sans-serif" }}
      >
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
