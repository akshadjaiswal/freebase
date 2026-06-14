import Link from "next/link";
import { ArrowRight, MessageSquare, BookOpen, Map, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetDemo } from "@/components/widget-demo";

const DEMO_ORG = process.env.NEXT_PUBLIC_WIDGET_DEMO_ORG ?? "";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b border-[var(--border)] px-8 py-4">
        <span
          className="text-base font-semibold text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-cal)" }}
        >
          Freebase
        </span>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/new">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-8 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-subtle)] px-3 py-1">
            <span className="text-xs text-[var(--accent)]">Open source · MIT License · Free forever</span>
          </div>

          <h1
            className="mb-6 text-5xl font-semibold tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-cal)" }}
          >
            The open source{" "}
            <span className="text-[var(--accent)]">Featurebase</span>{" "}
            alternative
          </h1>

          <p className="mb-8 text-lg text-[var(--text-secondary)]">
            Collect feedback, publish changelogs, and showcase your roadmap.
            Deploy to Vercel in minutes. Self-host with Docker.
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link href="/new">
              <Button size="lg" className="gap-2">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://github.com/akshadjaiswal/freebase"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 pb-24">
        <div className="mx-auto max-w-3xl grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              icon: MessageSquare,
              title: "Feedback Board",
              description: "Public board where users submit ideas, vote, and comment. Admin manages statuses and categories.",
            },
            {
              icon: BookOpen,
              title: "Public Changelog",
              description: "Rich text changelog with draft/publish workflow, RSS feed, and email subscriptions.",
            },
            {
              icon: Map,
              title: "Roadmap",
              description: "Three-column kanban: Planned → In Progress → Done. Public read-only, admin drag-reorders.",
            },
            {
              icon: Code2,
              title: "Embeddable Widget",
              description: "Single script tag. Feedback form, changelog popup with unread badge, roadmap panel. <20KB gzip.",
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-5"
            >
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[var(--radius)] bg-[var(--accent-subtle)]">
                <Icon className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <h3 className="mb-1.5 text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Widget install snippet */}
      <section className="border-t border-[var(--border)] px-8 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="mb-3 text-2xl font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-cal)" }}
          >
            Embed in 2 lines
          </h2>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">
            Drop a script tag, call init. Works with any framework.
          </p>
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
            <pre className="overflow-x-auto font-mono text-xs text-[var(--text-secondary)]">
              <code>{`<script src="https://freebase.app/cdn/v1/sdk.js" async></script>
<script>
  window.Freebase?.('init', { org: 'your-org' })
</script>`}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-8 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Freebase — MIT License
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/akshadjaiswal/freebase"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              GitHub
            </a>
            <Link
              href="/new"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </footer>

      {/* Live widget demo — only mounts when NEXT_PUBLIC_WIDGET_DEMO_ORG is set */}
      {DEMO_ORG && <WidgetDemo orgSlug={DEMO_ORG} />}
    </div>
  );
}
