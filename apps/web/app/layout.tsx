import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const calSans = localFont({
  src: "../fonts/CalSans-SemiBold.woff2",
  variable: "--font-cal",
  display: "swap",
  weight: "600",
});

export const metadata: Metadata = {
  title: {
    default: "Freebase — Open Source Featurebase Alternative",
    template: "%s | Freebase",
  },
  description:
    "Open source customer feedback, changelog, and roadmap platform. Self-host or deploy to Vercel free tier.",
  keywords: ["feedback", "changelog", "roadmap", "open source", "featurebase alternative"],
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
          {children}
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
