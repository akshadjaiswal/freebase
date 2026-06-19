import { redirect } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { verifyAdminAccess } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/layout/command-palette";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { org: orgSlug } = await params;

  const session = await verifyAdminAccess(orgSlug);
  if (!session) {
    redirect(`/login?org=${orgSlug}`);
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <Sidebar
          orgSlug={orgSlug}
          orgName={session.org.name}
          userEmail={session.dbUser.email}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <CommandPalette orgSlug={orgSlug} />
    </ThemeProvider>
  );
}
