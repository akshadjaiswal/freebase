import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { WidgetDemo } from "@/components/widget-demo";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const DEMO_ORG = process.env.NEXT_PUBLIC_WIDGET_DEMO_ORG ?? "";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Cal Sans — SIL Open Font License (free for all use)
// Source: https://github.com/calcom/font
const calSans = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  display: "swap",
  weight: "600",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://freebase.app"),
  title: {
    default: "Freebase — The Free Product Feedback Platform",
    template: "%s | Freebase",
  },
  description:
    "Collect feedback, publish changelogs, and showcase your roadmap — all in one place. Free forever. Open source, MIT licensed.",
  openGraph: {
    type: "website",
    siteName: "Freebase",
    title: "Freebase — The Free Product Feedback Platform",
    description: "Collect feedback, publish changelogs, and showcase your roadmap. Free forever.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Freebase" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Freebase — The Free Product Feedback Platform",
    description: "Collect feedback, publish changelogs, and showcase your roadmap. Free forever.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${calSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="#10b981"
            height={2}
            shadow={false}
            showSpinner={false}
          />
          <TooltipProvider delayDuration={300}>
            {children}
          </TooltipProvider>
          {DEMO_ORG && <WidgetDemo orgSlug={DEMO_ORG} />}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--surface-overlay)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
