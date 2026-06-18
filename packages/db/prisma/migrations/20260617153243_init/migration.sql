-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#10b981',
    "secretKey" TEXT NOT NULL,
    "customDomain" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_posts" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "categoryId" TEXT,
    "authorEmail" TEXT NOT NULL,
    "authorName" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "mergedInto" TEXT,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feedback_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_votes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "voterEmail" TEXT,
    "voterFingerprint" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "authorName" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feedback_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6366f1',

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelog_posts" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" JSONB NOT NULL,
    "label" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "changelog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelog_reads" (
    "id" TEXT NOT NULL,
    "changelogPostId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelog_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "changelog_subscribers" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "changelog_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmap_items" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "feedbackPostId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "position" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roadmap_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "events" TEXT[],
    "secret" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "organizations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_secretKey_key" ON "organizations"("secretKey");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_customDomain_key" ON "organizations"("customDomain");

-- CreateIndex
CREATE INDEX "feedback_posts_orgId_status_idx" ON "feedback_posts"("orgId", "status");

-- CreateIndex
CREATE INDEX "feedback_posts_orgId_voteCount_idx" ON "feedback_posts"("orgId", "voteCount");

-- CreateIndex
CREATE INDEX "feedback_posts_orgId_createdAt_idx" ON "feedback_posts"("orgId", "createdAt");

-- CreateIndex
CREATE INDEX "feedback_votes_postId_idx" ON "feedback_votes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_votes_postId_userId_key" ON "feedback_votes"("postId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_votes_postId_voterEmail_key" ON "feedback_votes"("postId", "voterEmail");

-- CreateIndex
CREATE UNIQUE INDEX "feedback_votes_postId_voterFingerprint_key" ON "feedback_votes"("postId", "voterFingerprint");

-- CreateIndex
CREATE INDEX "feedback_comments_postId_idx" ON "feedback_comments"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_orgId_name_key" ON "categories"("orgId", "name");

-- CreateIndex
CREATE INDEX "changelog_posts_orgId_status_idx" ON "changelog_posts"("orgId", "status");

-- CreateIndex
CREATE INDEX "changelog_posts_orgId_publishedAt_idx" ON "changelog_posts"("orgId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "changelog_posts_orgId_slug_key" ON "changelog_posts"("orgId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "changelog_reads_changelogPostId_userEmail_key" ON "changelog_reads"("changelogPostId", "userEmail");

-- CreateIndex
CREATE INDEX "changelog_subscribers_orgId_confirmed_idx" ON "changelog_subscribers"("orgId", "confirmed");

-- CreateIndex
CREATE UNIQUE INDEX "changelog_subscribers_orgId_email_key" ON "changelog_subscribers"("orgId", "email");

-- CreateIndex
CREATE INDEX "roadmap_items_orgId_status_position_idx" ON "roadmap_items"("orgId", "status", "position");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_orgId_idx" ON "api_keys"("orgId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_posts" ADD CONSTRAINT "feedback_posts_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_posts" ADD CONSTRAINT "feedback_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_votes" ADD CONSTRAINT "feedback_votes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "feedback_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback_comments" ADD CONSTRAINT "feedback_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "feedback_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelog_posts" ADD CONSTRAINT "changelog_posts_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelog_reads" ADD CONSTRAINT "changelog_reads_changelogPostId_fkey" FOREIGN KEY ("changelogPostId") REFERENCES "changelog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "changelog_subscribers" ADD CONSTRAINT "changelog_subscribers_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmap_items" ADD CONSTRAINT "roadmap_items_feedbackPostId_fkey" FOREIGN KEY ("feedbackPostId") REFERENCES "feedback_posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
