"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { headers } from "next/headers";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateBriefScenario } from "@/lib/engagement";
import {
  actionUser,
  audit,
  can,
  destroySession,
  getSessionUser,
  hashPassword,
  login,
  revokeAllSessions,
  verifyPassword,
  type Role,
} from "@/lib/auth";
import { saveFile, removeFile, validateUpload, sniffMime } from "@/lib/storage";
import { deletePrivateFile, savePrivateFile } from "@/lib/storage-private";
import { sendLeadConfirmation, sendLeadNotification } from "@/lib/email";
import { rateLimitShared, clientKey } from "@/lib/rate-limit";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "./config";

/* eslint-disable @typescript-eslint/no-explicit-any */

type ActionResult = { ok: boolean; error?: string };

function delegates(): Record<CollectionKey, any> {
  return {
    posts: prisma.post,
    projects: prisma.project,
    services: prisma.service,
    team: prisma.teamMember,
    jobs: prisma.job,
    testimonials: prisma.testimonial,
    menulinks: prisma.menuLink,
  };
}

function sepOf(f: FieldDef) {
  return f.sep === "DOUBLE_NEWLINE" ? "\n\n" : (f.sep ?? "\n");
}

function parseFields(fields: FieldDef[], form: FormData): Record<string, any> {
  const out: Record<string, any> = {};
  for (const f of fields) {
    const raw = form.get(f.name);
    if (f.kind === "checkbox") {
      out[f.name] = raw === "on";
      continue;
    }
    if (f.kind === "number") {
      out[f.name] = raw === null || String(raw).trim() === "" ? 0 : Number(raw);
      if (Number.isNaN(out[f.name])) throw new Error(`${f.label} must be a number`);
      continue;
    }
    if (f.kind === "list") {
      out[f.name] = String(raw ?? "")
        .replace(/\r\n/g, "\n")
        .split(sepOf(f))
        .map((s) => s.trim())
        .filter(Boolean);
      continue;
    }
    if (f.kind === "json") {
      const s = String(raw ?? "").replace(/\r\n/g, "\n").trim();
      if (!s) {
        out[f.name] = f.name === "images" || f.name === "faqs" ? [] : {};
        continue;
      }
      try {
        out[f.name] = JSON.parse(s);
      } catch {
        throw new Error(`${f.label} is not valid JSON`);
      }
      continue;
    }
    const s = String(raw ?? "").replace(/\r\n/g, "\n").trim();
    if (f.required && !s) throw new Error(`${f.label} is required`);
    out[f.name] = s;
  }
  return out;
}

function friendly(e: unknown) {
  const msg = e instanceof Error ? e.message : "Something went wrong";
  if (msg.includes("Unique constraint")) return "That slug/title already exists - pick another.";
  return msg;
}

/* ------------------------------- auth ---------------------------------- */

export async function loginAction(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");

  const h = await headers();
  const limit = await rateLimitShared(clientKey(h, "admin-login"), 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfter}s.` };
  }

  const result = await login(email, password);
  if (!result.ok) return { ok: false, error: result.error };
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ------------------------------ content -------------------------------- */

async function writeRevision(
  collection: string,
  recordId: number,
  snapshot: unknown,
  userId: string | null,
  label?: string,
) {
  await prisma.revision
    .create({
      data: {
        collection,
        recordId,
        snapshot: snapshot as object,
        userId,
        label: label ?? null,
      },
    })
    .catch(() => {});
}

export async function saveItem(
  collection: CollectionKey,
  id: string,
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult & { id?: number }> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  const def = COLLECTIONS[collection];
  try {
    const data = parseFields(def.fields, form);

    // Workflow status. When the editor sends a status, it wins; otherwise a
    // published checkbox keeps the old behaviour.
    const statusRaw = form.get("status");
    if (typeof statusRaw === "string" && ["draft", "review", "published"].includes(statusRaw)) {
      data.status = statusRaw;
      if ("published" in data) data.published = statusRaw === "published";
    } else if ("published" in data) {
      data.status = data.published ? "published" : "draft";
    }

    const db = delegates()[collection];
    if (id === "new") {
      const row = await db.create({ data });
      for (const p of def.revalidate(String(data[def.slugField] ?? ""))) revalidatePath(p);
      if (collection === "menulinks") revalidatePath("/", "layout");
      await writeRevision(collection, row.id, row, gate.user.id, "Created");
      await audit(`${collection}.create`, {
        userId: gate.user.id,
        entity: collection,
        entityId: row.id,
        summary: `Created ${def.singular.toLowerCase()} “${String(data[def.slugField] ?? row.id)}”`,
      });
      return { ok: true, id: row.id };
    }

    const before = await db.findUnique({ where: { id: Number(id) } });
    const row = await db.update({ where: { id: Number(id) }, data });
    const slugVal = (row as Record<string, unknown>)[def.slugField];
    for (const p of def.revalidate(String(slugVal ?? ""))) revalidatePath(p);
    if (collection === "menulinks") revalidatePath("/", "layout");
    await writeRevision(collection, row.id, row, gate.user.id);
    await audit(`${collection}.update`, {
      userId: gate.user.id,
      entity: collection,
      entityId: row.id,
      summary: `Updated ${def.singular.toLowerCase()} “${String(slugVal ?? row.id)}”`,
      diff: before ? { before: stripMeta(before), after: stripMeta(row) } : undefined,
    });
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

function stripMeta(row: Record<string, any>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    if (k === "createdAt" || k === "updatedAt") continue;
    out[k] = v;
  }
  return out;
}

/** Used by the draft → review → live control in the editor header. */
export async function setWorkflowStatus(
  collection: "posts" | "projects",
  id: number,
  status: "draft" | "review" | "published",
): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const db = (collection === "posts" ? prisma.post : prisma.project) as any;
    const row = await db.update({
      where: { id },
      data: { status, published: status === "published" },
      select: { slug: true },
    });
    revalidatePath(collection === "posts" ? "/blog" : "/work");
    revalidatePath(`${collection === "posts" ? "/blog" : "/work"}/${row.slug}`);
    revalidatePath(`/admin/${collection}`);
    if (status === "published") {
      const { pingIndexNow } = await import("@/lib/seo");
      void pingIndexNow([`${collection === "posts" ? "/blog" : "/work"}/${row.slug}`]);
    }
    await audit(`${collection}.status`, {
      userId: gate.user.id,
      entity: collection,
      entityId: id,
      summary: `Set ${collection === "posts" ? "post" : "case study"} “${row.slug}” to ${status}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function duplicateItem(collection: CollectionKey, id: number): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const db = delegates()[collection];
    const row = (await db.findUnique({ where: { id } })) as Record<string, unknown> | null;
    if (!row) return { ok: false, error: "Not found." };
    const slugField = COLLECTIONS[collection].slugField;
    const tag = Date.now().toString(36);
    const copy: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(row)) {
      if (k === "id" || k === "createdAt" || k === "updatedAt") continue;
      copy[k] = v;
    }
    if (typeof copy[slugField] === "string") copy[slugField] = `${copy[slugField]}-copy-${tag}`;
    if (collection === "posts" || collection === "projects") {
      copy.published = false;
      copy.status = "draft";
    }
    if (collection === "menulinks") {
      copy.visible = false;
      revalidatePath("/", "layout");
    }
    const created = await db.create({ data: copy });
    revalidatePath(`/admin/${collection}`);
    await audit(`${collection}.duplicate`, {
      userId: gate.user.id,
      entity: collection,
      entityId: created.id,
      summary: `Duplicated #${id}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function deleteItem(collection: CollectionKey, id: number): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const db = delegates()[collection];
    const row = (await db.findUnique({ where: { id } })) as Record<string, unknown> | null;
    const slugVal = row ? String(row[COLLECTIONS[collection].slugField] ?? "") : "";
    await db.delete({ where: { id } });
    await prisma.revision.deleteMany({ where: { collection, recordId: id } }).catch(() => {});
    if (collection === "menulinks") revalidatePath("/", "layout");
    for (const rpath of COLLECTIONS[collection].revalidate(slugVal)) revalidatePath(rpath);
    await audit(`${collection}.delete`, {
      userId: gate.user.id,
      entity: collection,
      entityId: id,
      summary: `Deleted ${COLLECTIONS[collection].singular.toLowerCase()} “${slugVal || id}”`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function bulkAction(
  collection: CollectionKey,
  ids: number[],
  action: "publish" | "draft" | "delete",
): Promise<ActionResult> {
  const min: Role = action === "delete" ? "admin" : "editor";
  const gate = await actionUser(min);
  if (!gate.ok) return { ok: false, error: gate.error };
  if (ids.length === 0) return { ok: false, error: "Select at least one row." };
  try {
    const db = delegates()[collection];
    if (action === "delete") {
      await db.deleteMany({ where: { id: { in: ids } } });
    } else if (collection === "posts" || collection === "projects") {
      await db.updateMany({
        where: { id: { in: ids } },
        data: { status: action === "publish" ? "published" : "draft", published: action === "publish" },
      });
    } else if (collection === "jobs") {
      await db.updateMany({ where: { id: { in: ids } }, data: { active: action === "publish" } });
    } else if (collection === "menulinks") {
      await db.updateMany({ where: { id: { in: ids } }, data: { visible: action === "publish" } });
    } else {
      return { ok: false, error: "This collection has no publish state." };
    }
    revalidatePath(`/admin/${collection}`);
    await audit(`${collection}.bulk.${action}`, {
      userId: gate.user.id,
      entity: collection,
      summary: `${action} on ${ids.length} item(s)`,
      diff: { ids },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function restoreRevision(revisionId: number): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const revision = await prisma.revision.findUnique({ where: { id: revisionId } });
    if (!revision) return { ok: false, error: "Revision not found." };
    const collection = revision.collection as CollectionKey;
    if (!(collection in COLLECTIONS)) return { ok: false, error: "Unknown collection." };
    const snapshot = revision.snapshot as Record<string, unknown>;
    // Never restore identity/timestamp fields.
    for (const key of ["id", "createdAt", "updatedAt"]) delete snapshot[key];
    await delegates()[collection].update({ where: { id: revision.recordId }, data: snapshot });
    await audit(`${collection}.restore`, {
      userId: gate.user.id,
      entity: collection,
      entityId: revision.recordId,
      summary: `Restored revision #${revision.id}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/* ------------------------------ settings -------------------------------- */

export async function saveSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const entries = [...form.entries()].filter(([k]) => k.startsWith("s:"));
    let changed = 0;
    for (const [k, v] of entries) {
      const key = k.slice(2);
      const value = String(v);
      if (key === "home.brief.scenario") {
        let parsed: unknown;
        try {
          parsed = JSON.parse(value);
        } catch {
          return { ok: false, error: "The brief scenario is not valid JSON." };
        }
        const problem = validateBriefScenario(parsed);
        if (problem) return { ok: false, error: problem };
      }
      const existing = await prisma.siteSetting.findUnique({ where: { key } });
      if (existing && existing.value === value) continue;
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
      changed += 1;
    }
    revalidatePath("/", "layout");
    await audit("settings.update", {
      userId: gate.user.id,
      entity: "settings",
      summary: `${changed} setting${changed === 1 ? "" : "s"} changed`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/* -------------------------------- leads --------------------------------- */

export async function setLeadRead(id: number, read: boolean): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.lead.update({ where: { id }, data: { read } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteLead(id: number): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  await audit("lead.delete", { userId: gate.user.id, entity: "lead", entityId: id });
  return { ok: true };
}

/* -------------------------------- media --------------------------------- */

export async function uploadMedia(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file first." };
    const buf = Buffer.from(await file.arrayBuffer());
    const sniffed = sniffMime(buf);
    validateUpload(sniffed || file.type, file.size);
    if (!sniffed) return { ok: false, error: "That file is not a valid image or document." };
    const saved = await saveFile(buf, file.name, sniffed);
    const alt = String(form.get("alt") ?? "").trim();
    const row = await prisma.media.create({
      data: {
        key: saved.key,
        url: saved.url,
        mime: saved.mime,
        size: saved.size,
        width: saved.width ?? null,
        height: saved.height ?? null,
        alt: alt || null,
      },
    });
    revalidatePath("/admin/media");
    await audit("media.upload", {
      userId: gate.user.id,
      entity: "media",
      entityId: row.id,
      summary: `Uploaded ${file.name}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function updateMediaAlt(id: number, alt: string): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.media.update({ where: { id }, data: { alt: alt.trim() || null } });
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function deleteMedia(id: number): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  const row = await prisma.media.findUnique({ where: { id } });
  if (row) await removeFile(row.key);
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  await audit("media.delete", { userId: gate.user.id, entity: "media", entityId: id, summary: row?.url });
  return { ok: true };
}

export async function listMedia(): Promise<{ id: number; url: string; alt: string | null; mime: string | null }[]> {
  if (!(await getSessionUser())) return [];
  try {
    return await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, url: true, alt: true, mime: true },
    });
  } catch {
    return [];
  }
}

/* --------------------------- users & access ----------------------------- */

export async function createUser(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const name = String(form.get("name") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const role = String(form.get("role") ?? "editor");
    if (!email || !name) return { ok: false, error: "Name and email are required." };
    if (password.length < 10) return { ok: false, error: "Password must be at least 10 characters." };
    if (!["owner", "admin", "editor", "viewer"].includes(role)) return { ok: false, error: "Unknown role." };
    if (role === "owner" && !can(gate.user.role, "owner")) return { ok: false, error: "Only an owner can create another owner." };
    const user = await prisma.adminUser.create({
      data: { email, name, passwordHash: await hashPassword(password), role },
    });
    revalidatePath("/admin/users");
    await audit("user.create", {
      userId: gate.user.id,
      entity: "user",
      entityId: user.id,
      summary: `Created ${email} as ${role}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function updateUser(
  id: string,
  patch: { role?: string; active?: boolean; password?: string; name?: string },
): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const target = await prisma.adminUser.findUnique({ where: { id } });
    if (!target) return { ok: false, error: "User not found." };
    if (target.role === "owner" && gate.user.id !== target.id) {
      return { ok: false, error: "Only the owner can change their own account." };
    }
    const data: Record<string, unknown> = {};
    if (patch.name !== undefined) data.name = patch.name.trim();
    if (patch.role !== undefined) {
      if (!["owner", "admin", "editor", "viewer"].includes(patch.role)) return { ok: false, error: "Unknown role." };
      if (patch.role === "owner" && gate.user.role !== "owner") return { ok: false, error: "Only an owner can promote to owner." };
      data.role = patch.role;
    }
    if (patch.active !== undefined) {
      if (target.id === gate.user.id) return { ok: false, error: "You cannot disable your own account." };
      data.active = patch.active;
    }
    if (patch.password !== undefined && patch.password !== "") {
      if (patch.password.length < 10) return { ok: false, error: "Password must be at least 10 characters." };
      data.passwordHash = await hashPassword(patch.password);
      data.failedLogins = 0;
      data.lockedUntil = null;
      await revokeAllSessions(id);
    }
    await prisma.adminUser.update({ where: { id }, data });
    revalidatePath("/admin/users");
    await audit("user.update", {
      userId: gate.user.id,
      entity: "user",
      entityId: id,
      summary: `Updated ${target.email}`,
      diff: { role: data.role, active: data.active, passwordChanged: Boolean(data.passwordHash) },
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function changeOwnPassword(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Signed out." };
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 10) return { ok: false, error: "New password must be at least 10 characters." };
  const row = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!row || !(await verifyPassword(current, row.passwordHash))) {
    return { ok: false, error: "Current password is incorrect." };
  }
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(next) } });
  await revokeAllSessions(user.id);
  await audit("user.password", { userId: user.id, entity: "user", entityId: user.id, summary: "Changed own password" });
  return { ok: true };
}

/* ------------------------------ autosave -------------------------------- */

/**
 * Background save used by the editor. It never redirects, never changes the
 * published flag on its own, and only writes a revision when the content
 * actually changed (and at most once every five minutes) so the history does
 * not fill with identical snapshots.
 */
export async function autosaveItem(
  collection: CollectionKey,
  id: number,
  form: FormData,
): Promise<ActionResult & { savedAt?: string }> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const def = COLLECTIONS[collection];
    const data = parseFields(def.fields, form);
    const statusRaw = form.get("status");
    if (typeof statusRaw === "string" && ["draft", "review", "published"].includes(statusRaw)) {
      data.status = statusRaw;
      if ("published" in data) data.published = statusRaw === "published";
    } else if ("published" in data) {
      data.status = data.published ? "published" : "draft";
    }

    const db = delegates()[collection];
    const before = (await db.findUnique({ where: { id } })) as Record<string, any> | null;
    if (!before) return { ok: false, error: "Not found." };

    const changed = def.fields.some(
      (field) => JSON.stringify(before[field.name] ?? null) !== JSON.stringify(data[field.name] ?? null),
    );
    if (!changed) return { ok: true, savedAt: new Date().toISOString() };

    const row = await db.update({ where: { id }, data });

    const latest = await prisma.revision
      .findFirst({
        where: { collection, recordId: id },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      })
      .catch(() => null);
    const due = !latest || Date.now() - latest.createdAt.getTime() > 5 * 60 * 1000;
    if (due) await writeRevision(collection, id, row, gate.user.id, "Autosave");

    if (collection === "menulinks") revalidatePath("/", "layout");
    if (row.published !== false) {
      for (const p of def.revalidate(String(row[def.slugField] ?? ""))) revalidatePath(p);
    }
    return { ok: true, savedAt: new Date().toISOString() };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/* ------------------------------ tracking -------------------------------- */

/** Admin-initiated test event so an owner can verify CAPI/MP wiring. */
export async function sendTestTrackingEvent(provider: "meta" | "ga4"): Promise<ActionResult & { detail?: string }> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const { sendTestEvent } = await import("@/lib/tracking");
    const result = await sendTestEvent(provider);
    await audit("tracking.test", {
      userId: gate.user.id,
      entity: "tracking",
      entityId: provider,
      summary: `Test ${provider} event: ${result.ok ? "ok" : "failed"}`,
    });
    revalidatePath("/admin/tracking");
    return result.ok
      ? { ok: true, detail: result.detail }
      : { ok: false, error: result.detail || `${provider} send failed.` };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

/* ------------------------------- SEO ------------------------------------ */

/**
 * Bulk snippet editor: writes title/description for many routes in one pass.
 * Only the paths submitted are touched; emptying both fields removes the
 * override so the route falls back to its generated metadata again.
 */
export async function saveSeoBulk(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };

  const paths = String(form.get("paths") ?? "")
    .split("\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 200);
  if (paths.length === 0) return { ok: false, error: "Nothing to save." };

  let saved = 0;
  try {
    for (const raw of paths) {
      const path = normalizePathForAdmin(raw);
      if (!path || path.startsWith("/admin")) continue;
      const title = String(form.get(`t:${raw}`) ?? "").trim().slice(0, 200);
      const description = String(form.get(`d:${raw}`) ?? "").trim().slice(0, 400);
      if (!title && !description) {
        await prisma.seoMeta.deleteMany({ where: { path } });
      } else {
        await prisma.seoMeta.upsert({
          where: { path },
          update: { title: title || null, description: description || null },
          create: { path, title: title || null, description: description || null, keywords: [] },
        });
      }
      revalidatePath(path);
      saved++;
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not save." };
  }

  revalidatePath("/admin/seo");
  revalidatePath("/admin/seo/health");
  await audit("seo.bulk_update", {
    userId: gate.user.id,
    summary: `Updated ${saved} route snippet${saved === 1 ? "" : "s"}`,
    diff: { paths },
  });
  return { ok: true };
}

export async function saveSeoMeta(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const path = normalizePathForAdmin(String(form.get("path") ?? ""));
    if (!path) return { ok: false, error: "A page path is required." };
    const keywords = String(form.get("keywords") ?? "")
      .split(/\n|,/)
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 20);
    const schemaRaw = String(form.get("schemaJson") ?? "").trim();
    let schemaJson: unknown = undefined;
    if (schemaRaw) {
      try {
        schemaJson = JSON.parse(schemaRaw);
      } catch {
        return { ok: false, error: "Schema JSON is not valid JSON." };
      }
    }
    const data = {
      title: String(form.get("title") ?? "").trim() || null,
      description: String(form.get("description") ?? "").trim() || null,
      ogImage: String(form.get("ogImage") ?? "").trim() || null,
      canonical: String(form.get("canonical") ?? "").trim() || null,
      noindex: form.get("noindex") === "on",
      keywords,
      schemaType: String(form.get("schemaType") ?? "").trim() || null,
      schemaJson: schemaJson === undefined ? undefined : (schemaJson as object),
    };
    await prisma.seoMeta.upsert({
      where: { path },
      update: data,
      create: { path, ...data },
    });
    revalidatePath(path);
    await audit("seo.update", {
      userId: gate.user.id,
      entity: "seo",
      entityId: path,
      summary: `Updated metadata for ${path}`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

function normalizePathForAdmin(input: string): string {
  let p = input.trim();
  if (!p) return "";
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p;
}

export async function deleteSeoMeta(path: string): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.seoMeta.deleteMany({ where: { path } });
  revalidatePath(path);
  await audit("seo.reset", { userId: gate.user.id, entity: "seo", entityId: path, summary: `Reset metadata for ${path}` });
  return { ok: true };
}

export async function createRedirect(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  try {
    const source = normalizePathForAdmin(String(form.get("source") ?? ""));
    const destination = String(form.get("destination") ?? "").trim();
    const code = Number(form.get("statusCode") ?? 301);
    if (!source) return { ok: false, error: "Source path is required." };
    if (!destination) return { ok: false, error: "Destination is required." };
    if (![301, 302, 307, 308].includes(code)) return { ok: false, error: "Status must be 301, 302, 307 or 308." };
    await prisma.redirect.create({
      data: { source, destination, statusCode: code, note: String(form.get("note") ?? "").trim() || null },
    });
    revalidatePath("/admin/seo/redirects");
    await audit("redirect.create", {
      userId: gate.user.id,
      entity: "redirect",
      entityId: source,
      summary: `${source} → ${destination} (${code})`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function toggleRedirect(id: number, active: boolean): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.redirect.update({ where: { id }, data: { active } });
  revalidatePath("/admin/seo/redirects");
  return { ok: true };
}

export async function deleteRedirect(id: number): Promise<ActionResult> {
  const gate = await actionUser("admin");
  if (!gate.ok) return { ok: false, error: gate.error };
  await prisma.redirect.delete({ where: { id } });
  revalidatePath("/admin/seo/redirects");
  await audit("redirect.delete", { userId: gate.user.id, entity: "redirect", entityId: id });
  return { ok: true };
}

export async function clearNotFound(id?: number): Promise<ActionResult> {
  const gate = await actionUser("editor");
  if (!gate.ok) return { ok: false, error: gate.error };
  if (id === undefined) await prisma.notFoundLog.deleteMany({});
  else await prisma.notFoundLog.delete({ where: { id } });
  revalidatePath("/admin/seo/not-found");
  return { ok: true };
}

/* ---------------------------- public leads ------------------------------ */

const LEAD_KINDS = new Set(["contact", "careers", "newsletter", "resource", "audit", "exit-intent"]);
const MAX_FIELDS = 30;
const MAX_FIELD_CHARS = 5000;
const MAX_TOTAL_CHARS = 20000;
const MAX_ATTACHMENTS = 1;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type SavedAttachment = { field: string; key: string; name: string; mime: string; size: number };

export async function createLead(
  kind: string,
  fields: Record<string, string | File>,
  tracking?: {
    event_id?: string;
    event_source_url?: string;
    fbp?: string;
    fbc?: string;
    client_id?: string;
    gclid?: string;
    fbclid?: string;
    msclkid?: string;
    landing_page?: string;
    referrer?: string;
    utm?: Record<string, string>;
  },
): Promise<ActionResult> {
  const savedAttachments: SavedAttachment[] = [];
  try {
    const h = await headers();
    // Shared (DB-backed) budget: 8 submissions per IP per 10 minutes. The
    // in-memory fallback still protects a single instance if the table is
    // unavailable. Newsletter signups on shared office IPs can burst, so the
    // window is deliberately generous.
    const limit = await rateLimitShared(clientKey(h, "lead"), 8, 10 * 60 * 1000);
    if (!limit.ok) {
      return { ok: false, error: "Too many submissions. Please try again shortly." };
    }

    // Honeypot. Real users never see this field; bots fill every input they
    // find. Answer "ok" so the bot does not retry, but store nothing.
    const trap = fields["_hp"];
    if (typeof trap === "string" && trap.trim() !== "") return { ok: true };

    const entries = Object.entries(fields);
    if (entries.length > MAX_FIELDS) return { ok: false, error: "Too many fields." };

    // Validate identity before touching storage: an invalid submission must
    // never be able to fill a bucket.
    const emailEntry = entries.find(
      ([key, value]) => typeof value === "string" && key.toLowerCase().includes("email"),
    );
    const email = typeof emailEntry?.[1] === "string" ? emailEntry[1].trim() : "";
    if (!email || !EMAIL_RE.test(email)) return { ok: false, error: "A valid email is required." };

    const safeKind = LEAD_KINDS.has(kind) ? kind : "other";
    const payload: Record<string, unknown> = {};
    let totalChars = 0;
    let attachmentCount = 0;

    for (const [k, v] of entries) {
      if (k.startsWith("_")) continue;
      if (typeof v !== "string" && v instanceof File) {
        if (v.size === 0) continue;
        if (safeKind !== "careers") {
          return { ok: false, error: "Attachments are only accepted with a job application." };
        }
        attachmentCount += 1;
        if (attachmentCount > MAX_ATTACHMENTS) {
          return { ok: false, error: `Attach at most ${MAX_ATTACHMENTS} file.` };
        }
        if (v.size > MAX_ATTACHMENT_BYTES) {
          return { ok: false, error: "The attachment is larger than 10 MB." };
        }
        const buf = Buffer.from(await v.arrayBuffer());
        const sniffed = sniffMime(buf);
        if (!sniffed) return { ok: false, error: "That attachment is not a supported file type." };
        validateUpload(sniffed, v.size, true);
        let saved: SavedAttachment;
        try {
          const file = await savePrivateFile(buf, v.name, sniffed);
          saved = { field: k, ...file };
        } catch (error) {
          console.error("[lead] private attachment storage failed", error);
          return {
            ok: false,
            error: "Attachments are temporarily unavailable. Please email hello@zoolyum.com.",
          };
        }
        savedAttachments.push(saved);
        // Only the display name is stored in the lead payload; the key is
        // listed separately and is only readable through the admin route.
        payload[k] = saved.name;
        continue;
      }
      const value = String(v ?? "");
      if (value.length > MAX_FIELD_CHARS) return { ok: false, error: "One of the fields is too long." };
      totalChars += value.length;
      payload[k] = value;
    }
    if (totalChars > MAX_TOTAL_CHARS) return { ok: false, error: "Message is too long." };
    if (savedAttachments.length > 0) payload.__attachments = savedAttachments;

    const name =
      (typeof payload.name === "string" && payload.name) ||
      (typeof payload.firstname === "string" && payload.firstname) ||
      (typeof payload["full name"] === "string" && payload["full name"]) ||
      (typeof payload.fullname === "string" && payload.fullname) ||
      null;

    // Keep the first-touch attribution with the lead so the admin can see
    // which campaign actually produced it.
    const attribution: Record<string, string | Record<string, string>> = {};
    if (tracking?.landing_page) attribution.landing_page = tracking.landing_page;
    if (tracking?.referrer) attribution.referrer = tracking.referrer;
    if (tracking?.gclid) attribution.gclid = tracking.gclid;
    if (tracking?.fbclid) attribution.fbclid = tracking.fbclid;
    if (tracking?.msclkid) attribution.msclkid = tracking.msclkid;
    if (tracking?.utm && Object.keys(tracking.utm).length > 0) attribution.utm = tracking.utm;

    const hasAttribution = Object.keys(attribution).length > 0;
    const leadPayload = (hasAttribution ? { ...payload, __attribution: attribution } : payload) as Prisma.InputJsonValue;

    const lead = await prisma.lead.create({
      data: {
        kind: safeKind,
        name,
        email,
        payload: leadPayload,
      },
    });

    // Confirmation + notification run after the response. Neither can break
    // the submission, and a missing email provider is a no-op.
    after(async () => {
      const stringPayload = Object.fromEntries(
        Object.entries(payload).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
      );
      await Promise.allSettled([
        sendLeadConfirmation(safeKind, email, name),
        sendLeadNotification({ kind: safeKind, email, name, payload: stringPayload }),
      ]);
    });

    // Server-side Lead (Meta CAPI + GA4 MP) with shared event_id for dedupe.
    try {
      const { cookies } = await import("next/headers");
      const { trackServerLead, newServerEventId, gaClientIdFromCookie } = await import("@/lib/tracking");
      const c = await cookies();
      const cookieHeader = c.toString();
      const forwarded = h.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
      await trackServerLead({
        kind: safeKind,
        email,
        eventId: tracking?.event_id?.trim() || newServerEventId(),
        eventSourceUrl: tracking?.event_source_url || undefined,
        fbp: tracking?.fbp || c.get("_fbp")?.value || undefined,
        fbc: tracking?.fbc || c.get("_fbc")?.value || undefined,
        clientId: tracking?.client_id || gaClientIdFromCookie(cookieHeader || null),
        ip,
        userAgent: h.get("user-agent") || undefined,
        leadId: lead.id,
        attribution: {
          landingPage: tracking?.landing_page,
          referrer: tracking?.referrer,
          gclid: tracking?.gclid,
          fbclid: tracking?.fbclid,
          msclkid: tracking?.msclkid,
          utm: tracking?.utm,
        },
      });
    } catch {
      /* server tracking must never break lead capture */
    }
    revalidatePath("/admin/leads");
    revalidatePath("/admin");
    void lead;
    return { ok: true };
  } catch (e) {
    // A failed lead must not leave orphaned private files behind.
    if (savedAttachments.length > 0) {
      await Promise.allSettled(savedAttachments.map((file) => deletePrivateFile(file.key)));
    }
    return { ok: false, error: friendly(e) };
  }
}
