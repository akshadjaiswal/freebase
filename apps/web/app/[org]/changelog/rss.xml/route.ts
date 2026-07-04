import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org: orgSlug } = await params;

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true },
  });
  if (!org) return new Response("Not found", { status: 404 });

  const posts = await prisma.changelogPost.findMany({
    where: { orgId: org.id, status: "published" },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://freebase.app";
  const baseUrl = `${appUrl}/${orgSlug}`;

  const items = posts.map((post: (typeof posts)[0]) => {
    const html = generateHTML(post.body as Parameters<typeof generateHTML>[0], [
      StarterKit.configure({ codeBlock: false, heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      CodeBlock,
    ]);

    const pubDate = (post.publishedAt ?? post.createdAt).toUTCString();

    return `
  <item>
    <title><![CDATA[${post.title}]]></title>
    <link>${baseUrl}/changelog/${post.slug}</link>
    <guid isPermaLink="true">${baseUrl}/changelog/${post.slug}</guid>
    <pubDate>${pubDate}</pubDate>
    <category>${post.label}</category>
    <description><![CDATA[${html}]]></description>
  </item>`;
  }).join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${org.name} Changelog</title>
    <link>${baseUrl}/changelog</link>
    <description>Latest updates from ${org.name}</description>
    <language>en</language>
    <atom:link href="${baseUrl}/changelog/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
