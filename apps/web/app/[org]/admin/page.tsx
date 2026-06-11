import { redirect } from "next/navigation";

interface AdminPageProps {
  params: Promise<{ org: string }>;
}

// Admin root redirects to feedback
export default async function AdminPage({ params }: AdminPageProps) {
  const { org } = await params;
  redirect(`/${org}/admin/feedback`);
}
