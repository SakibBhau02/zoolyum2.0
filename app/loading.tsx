import { ZigzagLoader } from "@/components/layout/ZigzagLoader";

/**
 * Route loading state - the signal zigzag draws while the next
 * route streams in. A branded micro-moment, never a blocker.
 */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-espresso">
      <ZigzagLoader />
    </div>
  );
}