"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { darkenHex } from "@/lib/color";
import { cn } from "@/lib/cn";

interface TopbarProps {
  orgSlug: string;
  orgName: string;
  logoUrl?: string | null;
  accentColor?: string;
  wide?: boolean;
}

const tabs = [
  { label: "Feedback", href: (org: string) => `/${org}/feedback` },
  { label: "Changelog", href: (org: string) => `/${org}/changelog` },
  { label: "Roadmap", href: (org: string) => `/${org}/roadmap` },
];

export function Topbar({ orgSlug, orgName, logoUrl, accentColor, wide }: TopbarProps) {
  const pathname = usePathname();

  const accentVars = accentColor
    ? ({
        "--accent": accentColor,
        "--accent-hover": darkenHex(accentColor),
        "--accent-subtle": `${accentColor}1f`,
      } as React.CSSProperties)
    : undefined;

  return (
    <header
      className="sticky top-0 z-40 h-14 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm"
      style={accentVars}
    >
      <div className={cn("mx-auto flex h-full items-center justify-between px-4", wide ? "max-w-5xl" : "max-w-3xl")}>
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            <img src={logoUrl} alt={orgName} className="h-6 w-6 rounded-[var(--radius-sm)] object-cover" />
          ) : (
            <Logo size={20} />
          )}
          <span className="text-sm font-semibold text-[var(--text-primary)]">{orgName}</span>
        </div>

        <nav className="flex items-center gap-1">
          {tabs.map((tab) => {
            const href = tab.href(orgSlug);
            const active = pathname.startsWith(href);
            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
