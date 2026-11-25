/**
 * Transactional email.
 *
 * Resend is used over plain HTTPS so the app does not need another runtime
 * dependency. When no key is configured every helper is a safe no-op — leads
 * are still stored, and the UI copy only promises what actually happens.
 *
 * Env:
 *   RESEND_API_KEY      re_…
 *   EMAIL_FROM          "Zoolyum <hello@zoolyum.com>" (must be a verified domain)
 *   LEAD_NOTIFY_EMAIL   inbox that receives new-lead notifications
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export type EmailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail(message: EmailMessage): Promise<{ ok: boolean; detail: string }> {
  if (!emailConfigured()) return { ok: false, detail: "email not configured" };
  const to = message.to.trim();
  if (!to) return { ok: false, detail: "missing recipient" };
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [to],
        subject: message.subject,
        html: message.html,
        text: message.text,
        ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, detail: `resend ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true, detail: "sent" };
  } catch (error) {
    return { ok: false, detail: error instanceof Error ? error.message : "send failed" };
  }
}

const SHELL = (title: string, body: string) => `<!doctype html>
<html><body style="margin:0;background:#241f1b;color:#f6f1e8;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px">
    <p style="margin:0 0 10px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ff7a3d">Zoolyum</p>
    <h1 style="margin:0 0 18px;font-size:24px;line-height:1.25;color:#f6f1e8">${title}</h1>
    <div style="font-size:15px;line-height:1.65;color:#d8d0c6">${body}</div>
    <p style="margin:32px 0 0;border-top:1px solid #4a3b31;padding-top:16px;font-size:12px;color:#a99f94">
      Consultancy. Strategy. Solution. · Dhaka, Bangladesh
    </p>
  </div>
</body></html>`;

const PLAIN_SHELL = (title: string, body: string) =>
  `${title}\n\n${body}\n\n— Zoolyum · Consultancy. Strategy. Solution. · Dhaka, Bangladesh`;

const KIND_COPY: Record<string, { subject: string; title: string; body: string }> = {
  newsletter: {
    subject: "You're on the Zoolyum Letter",
    title: "You're on the list.",
    body: "One strategic insight a month. No noise, no list-sharing, and one click to leave at any time.",
  },
  resource: {
    subject: "Your Zoolyum resource is being prepared",
    title: "The toolkit is on its way.",
    body: "A strategist will send the file to this address within one working day. If you need it sooner, reply to this email.",
  },
  "exit-intent": {
    subject: "Your Brand Audit Checklist",
    title: "The checklist is on its way.",
    body: "A strategist will send the 27-question audit to this address within one working day. Reply if you want it sooner.",
  },
  contact: {
    subject: "We received your message",
    title: "Message received.",
    body: "A strategist reads every note personally and replies within one working day (Dhaka time).",
  },
  careers: {
    subject: "We received your application",
    title: "Application received.",
    body: "We read every application ourselves. If your work matches what we need, we will reply within one working week.",
  },
  audit: {
    subject: "Your Zoolyum audit request",
    title: "Request received.",
    body: "A strategist will follow up within one working day with the next step.",
  },
};

export async function sendLeadConfirmation(kind: string, to: string, name?: string | null): Promise<void> {
  if (!emailConfigured()) return;
  const copy = KIND_COPY[kind] ?? KIND_COPY.contact;
  const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim().split(/\s+/)[0])},<br><br>` : "";
  await sendEmail({
    to,
    subject: copy.subject,
    html: SHELL(copy.title, `${greeting}${escapeHtml(copy.body)}`),
    text: PLAIN_SHELL(copy.title, `${name?.trim() ? `Hi ${name.trim().split(/\s+/)[0]}, ` : ""}${copy.body}`),
    replyTo: process.env.LEAD_NOTIFY_EMAIL || undefined,
  });
}

export async function sendLeadNotification(opts: {
  kind: string;
  email: string;
  name?: string | null;
  payload?: Record<string, string>;
}): Promise<void> {
  if (!emailConfigured()) return;
  const inbox = process.env.LEAD_NOTIFY_EMAIL?.trim();
  if (!inbox) return;
  const rows = Object.entries(opts.payload ?? {})
    .filter(([key]) => !key.startsWith("__"))
    .map(
      ([key, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#a99f94;vertical-align:top">${escapeHtml(key)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  await sendEmail({
    to: inbox,
    subject: `New ${opts.kind} lead — ${opts.name || opts.email}`,
    html: SHELL(
      `New ${escapeHtml(opts.kind)} lead`,
      `<table style="border-collapse:collapse;font-size:14px">${rows}<tr><td style="padding:4px 12px 4px 0;color:#a99f94">email</td><td>${escapeHtml(opts.email)}</td></tr></table>`,
    ),
    text: PLAIN_SHELL(`New ${opts.kind} lead`, JSON.stringify(opts.payload ?? {}, null, 2)),
    replyTo: opts.email,
  });
}
