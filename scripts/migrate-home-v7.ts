/**
 * One-off content migration for the v7 homepage (Field Notes + Screening Room).
 *
 * New CMS keys are inserted so the admin editor shows the shipped copy instead
 * of empty fields. The three keys whose meaning changed are updated only when
 * the database still holds the old shipped default — a real editorial edit is
 * never overwritten.
 *
 * Run once per database:  npx tsx scripts/migrate-home-v7.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });
config();

const NEW_KEYS = new Set([
  "home.work.reelEyebrow",
  "home.work.reelNote",
  "home.work.nowPlaying",
  "home.work.channelCta",
  "home.work.channelHref",
  "home.work.casesEyebrow",
  "home.work.casesNote",
  "home.work.casesCta",
  "home.voices.lead",
  "home.voices.featuredLabel",
  "home.voices.resultLabel",
  "home.voices.caseLabel",
  "home.voices.wallLabel",
]);

const REPLACED: Record<string, { from: string; to: string }> = {
  "home.work.title": { from: "Ground our clients |hold.", to: "The work, in |motion." },
  "home.work.lead": {
    from: "Every engagement is judged the same way: did the position strengthen - and can we prove it.",
    to: "Films, launches and case files from the last eight years. Watch the work, then read what it changed.",
  },
  "home.voices.title": { from: "In their |words.", to: "Words that came with |numbers." },
};

async function main() {
  const { HOME_FALLBACK } = await import("../lib/home-copy");
  const { prisma } = await import("../lib/prisma");
  const { FILMS } = await import("../lib/data");

  let present = 0;
  let replaced = 0;

  for (const [key, value] of Object.entries(HOME_FALLBACK)) {
    if (!key.startsWith("home.notes.") && !NEW_KEYS.has(key)) continue;
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
    present += 1;
  }

  for (const [key, { from, to }] of Object.entries(REPLACED)) {
    const row = await prisma.siteSetting.findUnique({ where: { key } });
    if (!row || row.value === from) {
      await prisma.siteSetting.upsert({ where: { key }, update: { value: to }, create: { key, value: to } });
      replaced += 1;
    } else {
      console.log(`kept editorial override: ${key}`);
    }
  }

  await prisma.siteSetting.upsert({
    where: { key: "home.work.films" },
    update: {},
    create: { key: "home.work.films", value: JSON.stringify(FILMS) },
  });

  console.log(`home v7 copy ready — ${present} keys present, ${replaced} defaults updated, ${FILMS.length} films seeded`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
