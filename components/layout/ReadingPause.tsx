"use client";

import { useEffect } from "react";

/**
 * ReadingPause — Legibility System rule 4.
 * When the user stops scrolling (active reading), ambient
 * background motion pauses via html[data-reading]; it resumes
 * the moment they scroll again.
 */
export function ReadingPause() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const pause = () => {
      document.documentElement.setAttribute("data-reading", "true");
    };

    const onScroll = () => {
      document.documentElement.removeAttribute("data-reading");
      if (timer) clearTimeout(timer);
      timer = setTimeout(pause, 900);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
      document.documentElement.removeAttribute("data-reading");
    };
  }, []);

  return null;
}
