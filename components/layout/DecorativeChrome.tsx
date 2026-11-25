"use client";

import dynamic from "next/dynamic";
import { useMediaQuery } from "@/lib/hooks";

/**
 * Decorative chrome, split out of the first paint.
 *
 * These layers are pure atmosphere — none of them carries content or an
 * interaction the page needs immediately. Loading them with `ssr: false`
 * keeps their code out of the hydration path, so the hero and the text are
 * interactive before the particles and the scroll rail even exist.
 *
 * ThreadCursor and ReadingPause stay in the layout: the cursor defines the
 * feel of the site and the reading pause is a 30-line scroll listener.
 */
const AmbientParticles = dynamic(
  () => import("@/components/ui/AmbientParticles").then((m) => m.AmbientParticles),
  { ssr: false },
);
const SignalFlash = dynamic(
  () => import("@/components/ui/SignalFlash").then((m) => m.SignalFlash),
  { ssr: false },
);
const TerrainScrollIndicator = dynamic(
  () => import("@/components/layout/TerrainScrollIndicator").then((m) => m.TerrainScrollIndicator),
  { ssr: false },
);

export function DecorativeChrome() {
  // Keep the particle canvas (and its chunk) off phones entirely. The hook
  // starts false so SSR and the first client render agree.
  const desktop = useMediaQuery("(min-width: 768px)");
  return (
    <>
      {desktop && <AmbientParticles />}
      <TerrainScrollIndicator />
      <SignalFlash />
    </>
  );
}
