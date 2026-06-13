import { redirect } from "next/navigation";
import { verifyAdminAccess } from "@/lib/auth";
import { ChangelogEditor } from "@/components/changelog/changelog-editor";

interface Props {
  params: Promise<{ org: string }>;
}

export default async function NewChangelogPage({ params }: Props) {
  const { org: orgSlug } = await params;

  const admin = await verifyAdminAccess(orgSlug);
  if (!admin) redirect("/login");

  return <ChangelogEditor orgSlug={orgSlug} />;
}
