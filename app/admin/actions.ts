"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthed, passwordMatches, createSession, destroySession } from "@/lib/session";
import { saveFile, removeFile, validateUpload } from "@/lib/storage";
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
      out[f.name] = String(raw ?? "").replace(/\r\n/g, "\n")
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

export async function loginAction(
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult> {
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!passwordMatches(password)) return { ok: false, error: "Wrong password." };
  await createSession();
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function saveItem(
  collection: CollectionKey,
  id: string,
  _prev: ActionResult,
  form: FormData,
): Promise<ActionResult & { id?: number }> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  const def = COLLECTIONS[collection];
  try {
    const data = parseFields(def.fields, form);
    const db = delegates()[collection];
    if (id === "new") {
      const row = await db.create({ data });
      for (const p of def.revalidate(String(data[def.slugField] ?? ""))) revalidatePath(p);
      if (collection === "menulinks") revalidatePath("/", "layout");
      return { ok: true, id: row.id };
    }
    const row = await db.update({ where: { id: Number(id) }, data });
    const slugVal = (row as Record<string, unknown>)[def.slugField];
    for (const p of def.revalidate(String(slugVal ?? ""))) revalidatePath(p);
    return { ok: true, id: row.id };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function duplicateItem(collection: CollectionKey, id: number): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
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
    if (collection === "posts" || collection === "projects") copy.published = false;
    if (collection === "menulinks") { copy.visible = false; revalidatePath("/", "layout"); }
    await db.create({ data: copy });
    revalidatePath(`/admin/${collection}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function deleteItem(collection: CollectionKey, id: number): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  try {
    const db = delegates()[collection];
    const row = (await db.findUnique({ where: { id } })) as Record<string, unknown> | null;
    const slugVal = row ? String(row[COLLECTIONS[collection].slugField] ?? "") : "";
    await db.delete({ where: { id } });
    if (collection === "menulinks") revalidatePath("/", "layout");
    for (const rpath of COLLECTIONS[collection].revalidate(slugVal)) revalidatePath(rpath);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}export async function saveSettings(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  try {
    const entries = [...form.entries()].filter(([k]) => k.startsWith("s:"));
    for (const [k, v] of entries) {
      const key = k.slice(2);
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(v) },
        create: { key, value: String(v) },
      });
    }
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function setLeadRead(id: number, read: boolean): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  await prisma.lead.update({ where: { id }, data: { read } });
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function deleteLead(id: number): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  return { ok: true };
}

export async function uploadMedia(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  try {
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a file first." };
    validateUpload(file.type, file.size);
    const buf = Buffer.from(await file.arrayBuffer());
    const saved = await saveFile(buf, file.name, file.type || "application/octet-stream");
    const alt = String(form.get("alt") ?? "").trim();
    await prisma.media.create({
      data: { key: saved.key, url: saved.url, mime: saved.mime, size: saved.size, alt: alt || null },
    });
    revalidatePath("/admin/media");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}

export async function deleteMedia(id: number): Promise<ActionResult> {
  if (!(await isAuthed())) return { ok: false, error: "Unauthorized." };
  const row = await prisma.media.findUnique({ where: { id } });
  if (row) await removeFile(row.key);
  await prisma.media.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { ok: true };
}

export async function listMedia(): Promise<{ id: number; url: string; alt: string | null; mime: string | null }[]> {
  if (!(await isAuthed())) return [];
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

export async function createLead(
  kind: string,
  fields: Record<string, string | File>,
  tracking?: {
    event_id?: string;
    event_source_url?: string;
    fbp?: string;
    fbc?: string;
    client_id?: string;
  },
): Promise<ActionResult> {
  try {
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(fields)) {
      if (k.startsWith("_")) continue;
      if (typeof v !== "string" && v instanceof File) {
        if (v.size === 0) continue;
        validateUpload(v.type, v.size, kind === "careers");
        const buf = Buffer.from(await v.arrayBuffer());
        const saved = await saveFile(buf, v.name, v.type || "application/octet-stream");
        await prisma.media.create({
          data: { key: saved.key, url: saved.url, mime: saved.mime, size: saved.size, alt: `Attachment from ${kind} lead` },
        });
        payload[k] = saved.url;
        continue;
      }
      payload[k] = String(v ?? "");
    }
    const email = Object.entries(payload).find(([k]) =>
      k.toLowerCase().includes("email"),
    )?.[1]?.trim();
    if (!email || !email.includes("@")) return { ok: false, error: "A valid email is required." };
    const name =
      payload.name ?? payload.firstname ?? payload["full name"] ?? payload.fullname ?? null;
    await prisma.lead.create({ data: { kind, name, email, payload } });
    // Server-side Lead (Meta CAPI + GA4 MP) with shared event_id for dedupe.
    // Fire-and-forget semantics: awaited but never fails the form.
    try {
      const { headers, cookies } = await import("next/headers");
      const { trackServerLead, newServerEventId, gaClientIdFromCookie } = await import(
        "@/lib/tracking"
      );
      const h = await headers();
      const c = await cookies();
      const cookieHeader = c.toString();
      const forwarded = h.get("x-forwarded-for");
      const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
      await trackServerLead({
        kind,
        email,
        eventId: tracking?.event_id?.trim() || newServerEventId(),
        eventSourceUrl: tracking?.event_source_url || undefined,
        fbp: tracking?.fbp || c.get("_fbp")?.value || undefined,
        fbc: tracking?.fbc || c.get("_fbc")?.value || undefined,
        clientId: tracking?.client_id || gaClientIdFromCookie(cookieHeader || null),
        ip,
        userAgent: h.get("user-agent") || undefined,
      });
    } catch {
      /* server tracking must never break lead capture */
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: friendly(e) };
  }
}