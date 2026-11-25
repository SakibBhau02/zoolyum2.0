"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * useMediaQuery — SSR-safe media query subscription.
 *
 * Important: the value is deliberately `false` until the component has
 * mounted. Components branch on this hook to render structurally
 * different trees (Chapter 1 swaps its pinned sequence for a static
 * stack under reduced-motion, ThreadCursor renders nothing on touch,
 * AmbientParticles omits its canvas). Returning the real client value
 * on the very first render would make that first render disagree with
 * the server HTML — a hydration mismatch that React resolves by
 * deleting and rebuilding subtrees, which surfaces as
 * "Failed to execute 'removeChild' on 'Node'" and a blank page.
 *
 * With the mount gate, hydration always matches the server, and the
 * media-query value settles in a normal re-render immediately after.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query]
  );

  const matches = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Defer to the next frame: the first render must match the server, and a
    // synchronous setState inside an effect triggers a cascading render.
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return mounted ? matches : false;
}
