import { prisma } from "@/lib/prisma";
import { LeadRowButtons } from "../ui";

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  const unread = leads.filter((l) => !l.read).length;
  return (
    <div>
      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">Studio</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ivory">
        Leads inbox{unread > 0 ? ` (${unread} unread)` : ""}<span className="text-sienna">.</span>
      </h1>
      <div className="mt-8 space-y-3">
        {leads.length === 0 && (
          <p className="font-body text-sm text-ivory/45">No submissions yet - contact, careers, newsletter, and resource forms land here.</p>
        )}
        {leads.map((l) => (
          <div key={l.id} className={`card-surface p-5 ${l.read ? "opacity-70" : "border-sienna/40"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display text-base font-semibold text-ivory">
                  {l.name ?? l.email}
                  <span className="ml-2 rounded-full border border-olive/35 px-2 py-0.5 align-middle font-body text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/50">
                    {l.kind}
                  </span>
                </p>
                <p className="mt-1 font-body text-xs text-ivory/45">
                  {l.email} · {new Date(l.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <LeadRowButtons id={l.id} read={l.read} />
            </div>
            {l.payload && typeof l.payload === "object" && (
              <details className="mt-3">
                <summary className="cursor-pointer font-body text-xs text-sienna-bright">Details</summary>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-espresso p-3 font-mono text-xs leading-relaxed text-ivory/70">
                  {JSON.stringify(l.payload, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}