/**
 * Chapter 01 content migration.
 *
 * Adds the new `home.brief.*` copy keys and seeds the interactive scenario so
 * the admin editor opens with the shipped Apex engagement instead of blanks.
 * Also restores the Chapter 06 testimonial heading to the shipped two-river
 * layout, but only when the row still holds the previous redesign value.
 *
 * Run once per database:  npx tsx scripts/migrate-home-v8.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

async function main() {
  const { HOME_FALLBACK } = await import("../lib/home-copy");
  const { BRIEF_DEFAULT } = await import("../lib/engagement");
  const { prisma } = await import("../lib/prisma");

  let present = 0;
  for (const [key, value] of Object.entries(HOME_FALLBACK)) {
    if (!key.startsWith("home.brief.")) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
    present += 1;
  }

  await prisma.siteSetting.upsert({
    where: { key: "home.brief.scenario" },
    update: {},
    create: { key: "home.brief.scenario", value: JSON.stringify(BRIEF_DEFAULT) },
  });

  const voicesTitle = await prisma.siteSetting.findUnique({ where: { key: "home.voices.title" } });
  if (!voicesTitle || voicesTitle.value === "Words that came with |numbers.") {
    await prisma.siteSetting.upsert({
      where: { key: "home.voices.title" },
      update: { value: "In their |words." },
      create: { key: "home.voices.title", value: "In their |words." },
    });
  } else {
    console.log("kept editorial override: home.voices.title");
  }

  console.log(`chapter 01 ready — ${present} brief keys, scenario seeded, testimonial heading restored`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
