/**
 * Server-side error reporting.
 *
 * Vercel captures console output per request; this makes the failure visible
 * with a stable shape (route, method, digest) instead of an anonymous stack.
 * Swap the `console.error` for Sentry/Axiom here when an account is available.
 */
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string },
) {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    error && typeof error === "object" && "digest" in error
      ? String((error as { digest?: unknown }).digest ?? "")
      : "";
  console.error(
    JSON.stringify({
      level: "error",
      source: "next.request",
      path: request.path,
      method: request.method,
      route: context.routePath,
      routeType: context.routeType,
      digest,
      message,
    }),
  );
}
