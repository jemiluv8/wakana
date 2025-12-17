import "@/app/styles/globals.css";

import type { Viewport } from "next";
import { Metadata } from "next";
import { Inter as FontSans, Rubik } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";

import { TailwindIndicator } from "@/components/tailwind-indicator";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const rubik = Rubik({ subsets: ["latin"] });

// Google Sans Flex font using Google Fonts API since we don't have local files
const googleSansFlex = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2", // Temporary - we'll use CSS for Google Sans Flex
  variable: "--font-google-sans-flex",
  display: "swap",
});

export const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Wakatime",
    "Dashboard for developers",
    "Fitbit for developers",
    "Observe your work in real time",
    "View work",
  ],
  authors: [
    {
      name: "Jemilu Mohammed",
    },
  ],
  creator: "jemiluv8",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og.jpg`],
    creator: "jemiluv8",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  // manifest: `${siteConfig.url}/site.webmanifest`,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
          googleSansFlex.variable,
          rubik.className
        )}
        style={{ fontFamily: "'Google Sans Flex', system-ui, sans-serif" }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster />
          <TailwindIndicator />
        </ThemeProvider>
      </body>
      {isProduction && (
        <Script
          defer
          async
          src="https://analytics.umami.is/script.js"
          data-website-id="56f6cf38-cc98-4b20-bc0e-c8af17a90100"
        />
      )}
    </html>
  );
}
