"use client";

import { useEffect, useState } from "react";
import { Field } from "@/components/pages/Forms";
import { JOBS, JOB_DETAILS } from "@/lib/data";
import { useSound } from "@/components/layout/SoundProvider";

export const APPLY_ROLE_EVENT = "zoolyum:apply-role";

/**
 * JobBoard - expandable role dossiers. Opening a role reveals the
 * full description; "Apply for this role" jumps to the form and
 * preselects the position via APPLY_ROLE_EVENT.
 */
export function JobBoard() {
  const [open, setOpen] = useState<string | null>(JOBS[0]?.title ?? null);
  const { click } = useSound();

  return (
    <div className="space-y-4">
      {JOBS.map((job, i) => {
        const detail = JOB_DETAILS[job.title];
        const isOpen = open === job.title;
        return (
          <div
            key={job.title}
            className={`card-surface overflow-hidden transition-colors duration-300 ${isOpen ? "border-sienna/40" : ""}`}
          >
            <button
              type="button"
              onClick={() => {
                click();
                setOpen(isOpen ? null : job.title);
              }}
              aria-expanded={isOpen}
              aria-controls={`job-panel-${i}`}
              className="flex w-full flex-wrap items-center justify-between gap-4 p-7 text-left"
            >
              <div>
                <h3 className={`font-display text-xl font-semibold transition-colors duration-300 ${isOpen ? "text-sienna-bright" : "text-ivory"}`}>
                  {job.title}
                </h3>
                <p className="mt-1.5 font-body text-sm text-ivory/50">
                  {job.dept} - {job.location}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full border border-olive/35 px-4 py-1.5 font-body text-xs font-semibold tracking-wide text-ivory/65">
                  {job.type}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-sienna-bright/60 text-sienna-bright" : "border-olive/35 text-ivory/60"}`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                  </svg>
                </span>
              </div>
            </button>

            <div
              id={`job-panel-${i}`}
              className={`grid transition-all duration-500 ease-read ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                {detail && (
                  <div className="space-y-7 border-t border-olive/20 p-7 pt-6">
                    <p className="body-copy font-body text-[15px] leading-relaxed text-ivory/70">
                      {detail.about}
                    </p>
                    <div className="grid gap-7 md:grid-cols-2">
                      <div>
                        <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                          You will
                        </h4>
                        <ul className="mt-3.5 space-y-2.5">
                          {detail.responsibilities.map((r) => (
                            <li key={r} className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-ivory/65">
                              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sienna" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-sienna-bright">
                          You bring
                        </h4>
                        <ul className="mt-3.5 space-y-2.5">
                          {detail.requirements.map((r) => (
                            <li key={r} className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-ivory/65">
                              <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-sienna" />
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="rounded-xl border border-olive/25 bg-espresso/60 p-5">
                      <p className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory/40">
                        Success in 90 days looks like
                      </p>
                      <p className="mt-2 font-body text-sm leading-relaxed text-ivory/75">
                        {detail.success90}
                      </p>
                      <p className="mt-3 font-body text-xs leading-relaxed text-ivory/40">
                        Nice to have: {detail.niceToHave.join(" · ")}
                      </p>
                    </div>
                    <div>
                      <a
                        href="#apply"
                        onClick={() => {
                          click();
                          window.dispatchEvent(new CustomEvent<string>(APPLY_ROLE_EVENT, { detail: job.title }));
                        }}
                        className="btn btn-primary inline-flex"
                      >
                        Apply for this role
                        <svg viewBox="0 0 20 20" className="ml-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                          <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * ApplyPositionField - the application form's role select. Listens for
 * APPLY_ROLE_EVENT from the board and preselects the chosen role.
 */
export function ApplyPositionField() {
  const [role, setRole] = useState("");

  useEffect(() => {
    const onRole = (e: Event) => setRole((e as CustomEvent<string>).detail ?? "");
    window.addEventListener(APPLY_ROLE_EVENT, onRole);
    return () => window.removeEventListener(APPLY_ROLE_EVENT, onRole);
  }, []);

  const options = [...JOBS.map((job) => job.title), "Speculative application"];

  return (
    <Field
      key={role || "all"}
      label="Position"
      name="position"
      required
      options={options}
      defaultValue={options.includes(role) ? role : ""}
    />
  );
}