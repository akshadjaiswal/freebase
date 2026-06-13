import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth";
import { ChangelogEditor } from "@/components/changelog/changelog-editor";

interface Props {
  params: Promise<{ org: string; id: string }>;
}

export default async function EditChangelogPage({ params }: Props) {
  const { org: orgSlug, id } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) redirect("/login");

  const post = await prisma.changelogPost.findFirst({
    where: { id, orgId: admin.org.id },
  });
  if (!post) notFound();

  return (
    <ChangelogEditor
      orgSlug={orgSlug}
      initialData={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        body: post.body as Record<string, unknown>,
        label: post.label as "feature" | "improvement" | "bug-fix" | "announcement",
        status: post.status as "draft" | "published",
      }}
    />
  );
}
