import { ZigzagLoader } from "@/components/layout/ZigzagLoader";

/**
 * Route loading state.
 *
 * This used to be an opaque, full-viewport takeover that appeared on
 * every navigation — so every menu click blanked the screen for the
 * length of a server round-trip (250-1100ms in dev). That reads as a
 * broken transition, not a brand moment.
 *
 * It now fades in only if the navigation is genuinely slow (>180ms),
 * and even then the previous page stays visible behind a scrim rather
 * than being replaced. Fast navigations show nothing at all.
 */
export default function Loading() {
  return (
    <div className="route-loading pointer-events-none fixed inset-0 z-[90] flex items-center justify-center">
      <div className="route-loading__scrim absolute inset-0 bg-espresso/80" />
      <div className="route-loading__mark relative">
        <ZigzagLoader />
      </div>
    </div>
  );
}
