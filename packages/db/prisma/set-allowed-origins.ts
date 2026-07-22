// Standalone, non-destructive: only sets allowedOrigins on the demo org.
// Unlike seed.ts, this touches no other data — safe to run repeatedly
// against any environment, including production.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_ORG_SLUG = "freebase";
const DEMO_ORIGINS = ["http://localhost:3000", "https://freebase.vercel.app"];

async function main() {
  const org = await prisma.organization.update({
    where: { slug: DEMO_ORG_SLUG },
    data: { allowedOrigins: { set: DEMO_ORIGINS } },
  });
  console.log(`allowedOrigins set for "${org.slug}":`, org.allowedOrigins);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
