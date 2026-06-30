import type { Metadata } from "next";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Hero } from "@/components/marketing/hero";
import { FeatureSection } from "@/components/marketing/feature-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { WidgetSnippet } from "@/components/marketing/widget-snippet";
import { ComparisonTable } from "@/components/marketing/comparison-table";
import { FinalCta } from "@/components/marketing/final-cta";
import {
  FeedbackBoardMockup,
  ChangelogMockup,
  RoadmapMockup,
  WidgetMockup,
} from "@/components/marketing/mockups";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Freebase — The Free Product Feedback Platform",
  description:
    "Collect feedback, publish changelogs, and showcase your roadmap — all in one place. Free forever. Open source, MIT licensed.",
  openGraph: {
    type: "website",
    title: "Freebase — The Free Product Feedback Platform",
    description: "Collect feedback, publish changelogs, and showcase your roadmap. Free forever.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freebase — The Free Product Feedback Platform",
    description: "Collect feedback, publish changelogs, and showcase your roadmap. Free forever.",
  },
};

const features = [
  {
    label: "Feedback Board",
    headline: "Turn user noise into product signal",
    bullets: [
      "Public board where users submit ideas, vote, and comment",
      "Admin manages statuses, pins top requests, and organizes by category",
      "Embed directly in your app. Users never need to leave.",
    ],
    mockup: <FeedbackBoardMockup />,
    reverse: false,
  },
  {
    label: "Public Changelog",
    headline: "Keep users in the loop",
    bullets: [
      "Rich text editor with draft/publish workflow",
      "RSS feed built in",
      "Users who requested a feature get notified when it ships",
    ],
    mockup: <ChangelogMockup />,
    reverse: true,
  },
  {
    label: "Roadmap",
    headline: "Show users what's coming",
    bullets: [
      "Public three-column kanban: Planned → In Progress → Done",
      "Promote feedback posts directly to roadmap items",
      "Users track progress without emailing you for updates",
    ],
    mockup: <RoadmapMockup />,
    reverse: false,
  },
  {
    label: "Embeddable Widget",
    headline: "Meet users where they are",
    bullets: [
      "Single script tag. Works with React, Vue, or plain HTML.",
      "Feedback form, changelog popup, and roadmap panel in one bundle",
      "Under 20KB gzip. JWT-based user identification.",
    ],
    mockup: <WidgetMockup />,
    reverse: true,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MarketingNav />
      <Hero />

      {/* Features */}
      <section className="border-t border-[var(--border)] px-8 py-20">
        <div className="mx-auto max-w-5xl space-y-24">
          {features.map((f) => (
            <FeatureSection
              key={f.label}
              label={f.label}
              headline={f.headline}
              bullets={f.bullets}
              mockup={f.mockup}
              reverse={f.reverse}
            />
          ))}
        </div>
      </section>

      <HowItWorks />
      <WidgetSnippet />
      <ComparisonTable />
      <FinalCta />

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-8 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo size={18} />
            <span
              className="text-sm font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: "var(--font-cal)" }}
            >
              Freebase
            </span>
            <span className="text-xs text-[var(--text-muted)]">· The free feedback platform</span>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://github.com/akshadjaiswal/freebase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              GitHub
            </a>
            <Link
              href="/docs"
              className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              Docs
            </Link>
            <Link
              href="/new"
              className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              Get started
            </Link>
          </div>
          <span className="text-xs text-[var(--text-muted)]">© {new Date().getFullYear()} Freebase · MIT License</span>
        </div>
      </footer>
    </div>
  );
}
