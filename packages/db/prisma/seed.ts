import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({ where: { slug: "freebase" } });
  if (!org) {
    console.error("Org 'freebase' not found. Aborting.");
    process.exit(1);
  }
  const orgId = org.id;
  console.log(`Seeding org: ${org.name} (${orgId})`);

  // Wipe existing seed data (reverse FK order)
  await prisma.roadmapItem.deleteMany({ where: { orgId } });
  await prisma.feedbackComment.deleteMany({ where: { post: { orgId } } });
  await prisma.feedbackVote.deleteMany({ where: { post: { orgId } } });
  await prisma.feedbackPost.deleteMany({ where: { orgId } });
  await prisma.changelogPost.deleteMany({ where: { orgId } });
  await prisma.category.deleteMany({ where: { orgId } });
  console.log("Cleared existing data.");

  // Categories
  const [catUI, catPerf, catInteg, catBug] = await Promise.all([
    prisma.category.create({ data: { orgId, name: "UI / Design", color: "#8b5cf6" } }),
    prisma.category.create({ data: { orgId, name: "Performance", color: "#f59e0b" } }),
    prisma.category.create({ data: { orgId, name: "Integrations", color: "#3b82f6" } }),
    prisma.category.create({ data: { orgId, name: "Bug Report", color: "#ef4444" } }),
  ]);
  console.log("Created 4 categories.");

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  // Feedback posts — only real, plausible requests for a feedback tool
  const darkMode = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Dark mode for the widget",
      description:
        "The admin panel already has dark mode which is great. Would love the embedded widget to also respect the user's system preference or the host app's theme.",
      status: "in-progress",
      categoryId: catUI.id,
      authorEmail: "alex@example.com",
      authorName: "Alex Chen",
      pinned: true,
      voteCount: 47,
      createdAt: daysAgo(21),
    },
  });

  const slowLoad = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Faster initial load on large feedback boards",
      description:
        "When a board has 200+ posts the initial page load takes 4-5 seconds. Maybe load the first page and lazy-load the rest?",
      status: "done",
      categoryId: catPerf.id,
      authorEmail: "sam@example.com",
      authorName: "Sam Rivera",
      pinned: false,
      voteCount: 31,
      createdAt: daysAgo(18),
    },
  });

  const slackInteg = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Slack notifications for new feedback",
      description:
        "Would love a Slack message whenever someone submits feedback or a post gets a spike in votes. Currently have to check the dashboard manually.",
      status: "planned",
      categoryId: catInteg.id,
      authorEmail: "maya@example.com",
      authorName: "Maya Patel",
      pinned: false,
      voteCount: 28,
      createdAt: daysAgo(15),
    },
  });

  const csvExport = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Export feedback to CSV",
      description:
        "Need to share a summary of open feedback with stakeholders who don't have admin access. A simple CSV export would be perfect.",
      status: "open",
      categoryId: catInteg.id,
      authorEmail: "jordan@example.com",
      authorName: "Jordan Kim",
      pinned: false,
      voteCount: 19,
      createdAt: daysAgo(12),
    },
  });

  const kbShortcuts = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Keyboard shortcuts for admin triage",
      description:
        "Power users want to triage feedback faster with keyboard shortcuts. E.g. press P to mark planned, D for done, S to open status picker.",
      status: "open",
      categoryId: catUI.id,
      authorEmail: "morgan@example.com",
      authorName: "Morgan Lee",
      pinned: false,
      voteCount: 12,
      createdAt: daysAgo(9),
    },
  });

  await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "GitHub Issues sync",
      description:
        "Auto-create a GitHub issue when a post is marked planned, and sync status back when the issue closes.",
      status: "open",
      categoryId: catInteg.id,
      authorEmail: "riley@example.com",
      authorName: "Riley Nguyen",
      pinned: false,
      voteCount: 9,
      createdAt: daysAgo(6),
    },
  });

  const voteBug = await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Vote count wrong after merging posts",
      description:
        "After merging two posts, the vote count on the target post doesn't include votes from the merged post.",
      status: "done",
      categoryId: catBug.id,
      authorEmail: "drew@example.com",
      authorName: "Drew Walsh",
      pinned: false,
      voteCount: 6,
      createdAt: daysAgo(25),
    },
  });

  await prisma.feedbackPost.create({
    data: {
      orgId,
      title: "Show commenter name publicly on posts",
      description:
        "Right now comments only show the name if the user typed it. Would be nice if identified widget users always show their name.",
      status: "open",
      categoryId: catUI.id,
      authorEmail: "pat@example.com",
      authorName: "Pat Quinn",
      pinned: false,
      voteCount: 4,
      createdAt: daysAgo(3),
    },
  });

  console.log("Created 8 feedback posts.");

  // Comments
  await prisma.feedbackComment.createMany({
    data: [
      {
        postId: darkMode.id,
        authorEmail: "nina@example.com",
        authorName: "Nina Torres",
        body: "Yes please! Our users embed the widget in a dark-themed app and the white popup looks completely out of place.",
        createdAt: daysAgo(19),
      },
      {
        postId: darkMode.id,
        authorEmail: "sam@example.com",
        authorName: "Sam Rivera",
        body: "The admin panel dark mode is perfect — just need the widget to match.",
        createdAt: daysAgo(17),
      },
      {
        postId: slowLoad.id,
        authorEmail: "alex@example.com",
        authorName: "Alex Chen",
        body: "We have 340 posts and the board takes about 6 seconds. Cursor pagination would help a lot.",
        createdAt: daysAgo(16),
      },
    ],
  });
  console.log("Created 3 comments.");

  // Changelog — things Freebase actually shipped
  await prisma.changelogPost.create({
    data: {
      orgId,
      title: "Embeddable widget — feedback, changelog & roadmap",
      slug: "embeddable-widget-launch",
      label: "feature",
      status: "published",
      publishedAt: daysAgo(14),
      createdAt: daysAgo(14),
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "The Freebase widget is now live. Add a single script tag to your app and your users get a floating feedback button, a What's New changelog popup, and a read-only roadmap panel — all under 20KB gzip.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Three surfaces in one bundle" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Feedback button — collects ideas and bug reports without leaving your app." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "What's New — shows your latest changelog entries with an unread badge." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Roadmap panel — lets users see what's planned, in progress, and shipped." }] }],
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Set your accent color in Settings and the widget automatically matches your brand." }],
          },
        ],
      },
    },
  });

  await prisma.changelogPost.create({
    data: {
      orgId,
      title: "API keys & webhooks",
      slug: "api-keys-webhooks",
      label: "feature",
      status: "published",
      publishedAt: daysAgo(7),
      createdAt: daysAgo(7),
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "You can now integrate Freebase with your own backend using API keys and webhooks.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "API keys" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Create server-side API keys (prefixed fb_live_) to manage feedback posts, categories, changelog, and roadmap items programmatically. Full REST API docs at /docs.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Webhooks" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Subscribe to post.created, post.status_changed, comment.created, and changelog.published events. Each delivery is HMAC-SHA256 signed so you can verify it came from Freebase.",
              },
            ],
          },
        ],
      },
    },
  });

  await prisma.changelogPost.create({
    data: {
      orgId,
      title: "Performance — 2x faster board loads",
      slug: "performance-2x-faster-board-loads",
      label: "improvement",
      status: "published",
      publishedAt: daysAgo(2),
      createdAt: daysAgo(2),
      body: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Feedback boards with hundreds of posts now load significantly faster. We optimised the database queries and added cursor-based pagination so only the first page loads on initial render.",
              },
            ],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Cursor pagination replaces offset — no full table scans." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Vote counts are denormalised — no COUNT(*) on every page load." }] }],
              },
              {
                type: "listItem",
                content: [{ type: "paragraph", content: [{ type: "text", text: "Database indexes on orgId + status and orgId + voteCount." }] }],
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "Median board load time dropped from ~1.8s to under 400ms on our test dataset." }],
          },
        ],
      },
    },
  });

  console.log("Created 3 changelog posts.");

  // Roadmap — only real things
  await prisma.roadmapItem.createMany({
    data: [
      // Planned
      { orgId, title: "Slack notifications", status: "planned", position: 0, visible: true, feedbackPostId: slackInteg.id },
      { orgId, title: "CSV export", status: "planned", position: 1, visible: true, feedbackPostId: csvExport.id },
      // In progress
      { orgId, title: "Widget dark mode", status: "in-progress", position: 0, visible: true, feedbackPostId: darkMode.id },
      { orgId, title: "Admin keyboard shortcuts", status: "in-progress", position: 1, visible: true, feedbackPostId: kbShortcuts.id },
      // Done
      { orgId, title: "Board performance", status: "done", position: 0, visible: true, feedbackPostId: slowLoad.id },
      { orgId, title: "Vote dedup fix", status: "done", position: 1, visible: true, feedbackPostId: voteBug.id },
    ],
  });
  console.log("Created 6 roadmap items.");

  console.log("\nDone! Seed complete for org 'freebase'.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
