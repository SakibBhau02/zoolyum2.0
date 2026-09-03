"use client";

import { useState } from "react";
import { Field, FormShell, SubmitButton } from "./Forms";

/**
 * ResourceGate — email-gated download (primary lead magnet
 * inventory per spec 14.1).
 */
export function ResourceGate({
  title,
  description,
  format,
  slug,
}: {
  title: string;
  description: string;
  format: string;
  slug: string;
}) {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="card-surface group relative flex h-full flex-col p-8">
      <div className="flex items-start justify-between gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-espresso font-display text-lg font-semibold text-sienna-bright ring-1 ring-sienna/30">
          {title.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </span>
        <span className="rounded-full border border-olive/30 px-3 py-1 font-body text-[11px] font-semibold tracking-wide text-ivory/50">
          {format}
        </span>
      </div>
      <h2 className="mt-6 font-display text-xl font-semibold text-ivory transition-colors duration-300 group-hover:text-sienna-bright">
        {title}
      </h2>
      <p className="body-copy mt-3 flex-1 font-body text-sm leading-relaxed text-ivory/55">
        {description}
      </p>

      {unlocked ? (
        <p className="mt-7 rounded-lg border border-sienna/40 bg-sienna/10 px-5 py-4 font-body text-sm font-medium text-sienna-bright">
          Unlocked. The file is on its way to your inbox — check spam if it
          went astray.
        </p>
      ) : (
        <div data-lead-inline className="mt-7">
          <FormShell className="space-y-4" leadKind="resource" onSubmitted={() => setUnlocked(true)}>
            <Field label="Work email" name={`email-${slug}`} type="email" required />
            <SubmitButton label="Unlock" />
          </FormShell>
        </div>
      )}
    </div>
  );
}
