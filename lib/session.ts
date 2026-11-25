import { getSessionUser, destroySession } from "./auth";

/**
 * @deprecated use `lib/auth.ts` directly.
 *
 * Kept as a thin shim so older imports keep working. Real authorization lives
 * in the admin layout, pages and server actions — proxy.ts only performs an
 * optimistic cookie-presence check (see the Next 16 proxy docs).
 */
export { destroySession };

export async function isAuthed(): Promise<boolean> {
  return (await getSessionUser()) !== null;
}
