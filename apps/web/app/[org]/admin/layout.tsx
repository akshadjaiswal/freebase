import { redirect } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/sidebar";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { org: orgSlug } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?org=${orgSlug}`);
  }

  // Verify user belongs to this org
  const dbUser = await prisma.user.findFirst({
    where: { id: user.id },
    include: { org: { select: { slug: true, name: true } } },
  });

  if (!dbUser || dbUser.org.slug !== orgSlug) {
    redirect("/login");
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
          orgName={dbUser.org.name}
          userEmail={dbUser.email}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
