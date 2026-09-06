"use client";

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useSound } from "@/components/layout/SoundProvider";
import { createLead } from "@/app/admin/actions";
import { fireBrowserLead, newLeadContext } from "@/lib/tracking-client";
export type WizardService = { name: string; tagline: string; slug: string };

/**
 * ContactWizard - the guided conversation form (v5.6).
 * Four chapters on one Signal Thread: the work, the investment,
 * you, the picture. Micro-commits instead of a wall of fields.
 */

const FALLBACK_OPTION = { name: "Not sure - advise me", tagline: "We diagnose it on the call.", slug: "not-sure" };

const BUDGETS: { label: string; hint: string }[] = [
  { label: "Under BDT 1,00,000", hint: "Focused audits and short sprints" },
  { label: "BDT 1-3,00,000", hint: "Single-discipline engagements" },
  { label: "BDT 3-8,00,000", hint: "Where most full engagements begin" },
  { label: "BDT 8-15,00,000", hint: "Multi-discipline brand systems" },
  { label: "BDT 15,00,000+", hint: "Long-term partnership" },
  { label: "Not sure yet", hint: "We scope it together on the call" },
];

const STEPS = [
  { id: "service", chapter: "The work", question: "What work do you need?" },
  { id: "budget", chapter: "The investment", question: "What investment feels right?" },
  { id: "contact", chapter: "You", question: "Where do we send the reply?" },
  { id: "message", chapter: "The picture", question: "What are you trying to achieve?" },
];

const STEP_SUB = [
  "Pick a discipline - 'Not sure' is a perfectly good answer.",
  "A range is enough. It shapes what we can scope together.",
  "We reply within one working day - business hours, Dhaka time.",
  "Two lines work: your market, your competitors, the position you want to claim.",
];

const NEXT_STEPS = [
  { title: "We reply within one working day", body: "A strategist reads your note - not a bot, not a form letter." },
  { title: "A 30-minute discovery call", body: "We ask sharp questions and map where you stand. No pitch deck." },
  { title: "A tailored proposal", body: "Scope, timeline, and investment in plain language." },
];

type WizardData = {
  service: string;
  budget: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL: WizardData = {
  service: "",
  budget: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  message: "",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateStep(step: number, d: WizardData): Partial<Record<keyof WizardData, string>> {
  switch (step) {
    case 0:
      return d.service ? {} : { service: "Pick the work you need - 'Not sure' counts too." };
    case 1:
      return d.budget ? {} : { budget: "Choose a range - 'Not sure yet' is a fine answer." };
    case 2: {
      const e: Partial<Record<keyof WizardData, string>> = {};
      if (!d.name.trim()) e.name = "Tell us who we are talking to.";
      if (!d.company.trim()) e.company = "A brand or company name helps us prepare.";
      if (!EMAIL_RE.test(d.email.trim())) e.email = "Enter a valid email - this is where our reply goes.";
      return e;
    }
    default:
      return d.message.trim().length >= 2 ? {} : { message: "A line or two is enough - what does success look like?" };
  }
}

function OptionIcon({ slug }: { slug: string }) {
  switch (slug) {
    case "brand-strategy":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="10" cy="10" r="7.5" />
          <path d="m13.4 6.6-1.8 5-5 1.8 1.8-5z" strokeLinejoin="round" />
        </svg>
      );
    case "digital-design":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
          <path d="M2.5 7.5h15" />
          <path d="M5.5 5.5h.01M8 5.5h.01" strokeLinecap="round" strokeWidth="2.2" />
        </svg>
      );
    case "content-strategy":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M5.5 2.5h6.5l3 3v12h-9.5z" strokeLinejoin="round" />
          <path d="M12 2.5v3h3" strokeLinejoin="round" />
          <path d="M8 10.5h5M8 13.5h3.5" strokeLinecap="round" />
        </svg>
      );
    case "video-production":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <rect x="2.5" y="4" width="15" height="12" rx="2.5" />
          <path d="m8.5 7.5 4.5 2.5-4.5 2.5z" strokeLinejoin="round" />
        </svg>
      );
    case "growth-marketing":
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3.5 14.5 8.5 9.5l2.8 2.8 4.9-4.9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.8 7.4h3.4v3.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M7 7.2a3 3 0 1 1 4.2 2.8c-.8.4-1.2 1-1.2 1.8v.3" strokeLinecap="round" />
          <circle cx="10" cy="14.8" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

function WizField({
  label,
  id,
  type = "text",
  value,
  onChange,
  error,
  placeholder = " ",
  autoComplete,
  inputMode,
  textarea = false,
  className = "",
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  textarea?: boolean;
  className?: string;
}) {
  const fieldClasses = `peer w-full rounded-lg border ${
    error ? "border-sienna-bright/70" : "border-olive/35"
  } bg-espresso px-4 pt-6 pb-2.5 font-body text-[15px] text-ivory placeholder:text-transparent focus:placeholder:text-ivory/30 transition-colors duration-300 focus:border-sienna-bright/70 focus:outline-none`;
  const labelClasses =
    "pointer-events-none absolute left-4 top-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/45 transition-all duration-300 peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-ivory/50 peer-focus:top-2 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-sienna-bright";
  return (
    <div className={className}>
      <div className="relative">
        {textarea ? (
          <textarea
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            rows={5}
            placeholder={placeholder}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${fieldClasses} resize-y`}
          />
        ) : (
          <input
            id={id}
            name={id}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={fieldClasses}
          />
        )}
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 font-body text-xs text-sienna-bright">
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewChip({ label, onEdit }: { label: string; onEdit: () => void }) {
  return (
    <button
      type="button"
      onClick={onEdit}
      className="group inline-flex items-center gap-2 rounded-full border border-olive/35 bg-espresso/60 py-1.5 pl-4 pr-2.5 font-body text-xs text-ivory/70 transition-colors duration-300 hover:border-sienna/60 hover:text-ivory"
    >
      {label}
      <svg viewBox="0 0 16 16" className="h-3 w-3 text-ivory/40 transition-colors duration-300 group-hover:text-sienna-bright" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M10.5 3.5l2 2L6 12l-3 1 1-3 6.5-6.5z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function ProgressRail({ filled }: { filled: number }) {
  return (
    <div className="flex items-center" aria-hidden="true">
      {STEPS.map((s, i) => (
        <Fragment key={s.id}>
          {i > 0 && (
            <span
              className={`h-[2px] flex-1 rounded-full transition-colors duration-500 ${
                i <= filled ? "bg-sienna" : "bg-olive/25"
              }`}
            />
          )}
          <span
            className={`relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-500 ${
              i < filled
                ? "border-sienna-bright bg-sienna-bright text-espresso"
                : i === filled
                  ? "border-sienna-bright/80 bg-sienna/15"
                  : "border-olive/40"
            }`}
          >
            {i < filled ? (
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                <path d="m3 8.5 3.2 3.2L13 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : i === filled ? (
              <span className="h-2 w-2 rounded-full bg-sienna-bright shadow-[0_0_10px_rgba(255,80,1,0.9)] animate-pulse-soft" />
            ) : (
              <span className="h-1.5 w-1.5 rounded-full bg-olive/40" />
            )}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function StepError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-3 flex items-center gap-2 font-body text-xs text-sienna-bright">
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 5v4M8 11.2v.01" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  );
}

export function ContactWizard({ contactEmail, services }: { contactEmail: string; services: WizardService[] }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof WizardData, string>>>({});
  const [shakeKey, setShakeKey] = useState(0);
  const [done, setDone] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);
  const navigatedRef = useRef(false);
  const { click } = useSound();
  const serviceOptions = [
    ...services.map((s) => ({ name: s.name, tagline: s.tagline, slug: s.slug })),
    FALLBACK_OPTION,
  ];

  useEffect(() => {
    if (done) {
      successRef.current?.focus();
      return;
    }
    if (navigatedRef.current) headingRef.current?.focus({ preventScroll: true });
  }, [step, done]);

  const set = (key: keyof WizardData, value: string) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => {
      if (!e[key]) return e;
      const next = { ...e };
      delete next[key];
      return next;
    });
  };

  const advance = () => {
    const errs = validateStep(step, data);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setShakeKey((k) => k + 1);
      const first = Object.keys(errs)[0];
      document.getElementById(`wiz-${first}`)?.focus();
      return;
    }
    setErrors({});
    navigatedRef.current = true;
    if (step < 3) {
      click();
      setDir(1);
      setStep((s) => s + 1);
    } else {
      click();
      const ctx = newLeadContext();
      createLead("contact", {
        service: data.service,
        budget: data.budget,
        name: data.name,
        company: data.company,
        email: data.email,
        phone: data.phone,
        message: data.message,
      }, ctx)
        .then((r) => {
          if (r.ok) fireBrowserLead("contact", ctx);
        })
        .catch(() => {});
      setDone(true);
    }
  };

  const back = () => {
    setErrors({});
    navigatedRef.current = true;
    setDir(-1);
    setStep((s) => Math.max(0, s - 1));
  };

  const jump = (target: number) => {
    setErrors({});
    navigatedRef.current = true;
    setDir(target > step ? 1 : -1);
    setStep(target);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (done) return;
    advance();
  };

  if (done) {
    const firstName = data.name.trim().split(/\s+/)[0];
    return (
      <div className="wizard-card">
        <div className="signal-line" />
        <div className="p-6 md:p-10">
          <div className="flex flex-col items-center text-center">
            <svg viewBox="0 0 52 52" className="h-14 w-14 text-sienna-bright" fill="none" stroke="currentColor" aria-hidden="true">
              <circle className="check-ring" cx="26" cy="26" r="24" strokeWidth="2" />
              <path className="check-tick" d="m15.5 27 7.5 7.5L37 19" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 ref={successRef} tabIndex={-1} className="mt-6 font-display text-3xl font-semibold text-ivory">
              Message received.
            </h2>
            <p className="mt-3 max-w-md font-body text-[15px] leading-relaxed text-ivory/60">
              Thanks{firstName ? `, ${firstName}` : ""} - a strategist reads every note personally. Expect a reply at{" "}
              <span className="font-semibold text-sienna-bright">{data.email}</span> within one working day.
            </p>
          </div>
          <div className="mt-10 border-t border-olive/20 pt-8">
            <p className="eyebrow">While you wait</p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {NEXT_STEPS.map((s, i) => (
                <li key={s.title} className="rounded-xl border border-olive/25 bg-espresso/60 p-4 text-left">
                  <span className="font-display text-xs font-bold text-sienna-bright tabular-nums">0{i + 1}</span>
                  <p className="mt-2 font-display text-sm font-semibold text-ivory">{s.title}</p>
                  <p className="mt-1 font-body text-xs leading-relaxed text-ivory/45">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-8 text-center font-body text-sm text-ivory/45">
            Impatient? Write to us directly -{" "}
            <a href={`mailto:${contactEmail}`} className="font-semibold text-sienna-bright hover:underline">
              {contactEmail}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="wizard-card h-full">
      <div className="signal-line" />
      <div className="p-6 md:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="eyebrow">
              Chapter {String(step + 1).padStart(2, "0")} - {STEPS[step].chapter}
            </p>
            <h2 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-2xl font-semibold text-ivory">
              {STEPS[step].question}
            </h2>
          </div>
          <span
            aria-hidden="true"
            className="shrink-0 rounded-full border border-olive/30 px-3 py-1 font-display text-xs font-semibold tracking-[0.18em] text-ivory/45 tabular-nums"
          >
            {String(step + 1).padStart(2, "0")}/04
          </span>
        </div>
        <p className="mt-2 font-body text-sm text-ivory/50">{STEP_SUB[step]}</p>

        <div className="mt-7">
          <ProgressRail filled={step} />
        </div>

        <div className="sr-only" aria-live="polite">
          {Object.values(errors)[0]}
        </div>

        <div key={step} className={`mt-8 ${dir === 1 ? "step-in-r" : "step-in-l"}`}>
          <div key={shakeKey} className={shakeKey > 0 ? "shake-soft" : undefined}>
            {step === 0 && (
              <fieldset>
                <legend className="sr-only">Which service do you need?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceOptions.map((opt) => {
                    const selected = data.service === opt.name;
                    return (
                      <button
                        key={opt.slug}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("service", opt.name)}
                        className={`group relative flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-300 ${
                          selected
                            ? "border-sienna-bright/70 bg-sienna/10 shadow-[0_0_28px_-12px_rgba(255,80,1,0.55)]"
                            : "border-olive/30 bg-espresso/60 hover:border-sienna/50 hover:bg-espresso"
                        }`}
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-300 ${
                            selected ? "bg-sienna-bright text-espresso" : "bg-umber text-sienna-bright/80"
                          }`}
                        >
                          <OptionIcon slug={opt.slug} />
                        </span>
                        <span className="pr-6">
                          <span className="block font-display text-[15px] font-semibold text-ivory">{opt.name}</span>
                          <span className="mt-0.5 block font-body text-xs leading-relaxed text-ivory/45">{opt.tagline}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`absolute right-3.5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                            selected ? "border-sienna-bright bg-sienna-bright text-espresso" : "border-olive/40 text-transparent"
                          }`}
                        >
                          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <path d="m3 8.5 3.2 3.2L13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <StepError message={errors.service} />
              </fieldset>
            )}

            {step === 1 && (
              <fieldset>
                <legend className="sr-only">What is your budget range?</legend>
                <div className="space-y-2.5">
                  {BUDGETS.map((b) => {
                    const selected = data.budget === b.label;
                    return (
                      <button
                        key={b.label}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => set("budget", b.label)}
                        className={`flex w-full items-center justify-between gap-4 rounded-xl border px-5 py-3.5 text-left transition-all duration-300 ${
                          selected
                            ? "border-sienna-bright/70 bg-sienna/10"
                            : "border-olive/30 bg-espresso/60 hover:border-sienna/50 hover:bg-espresso"
                        }`}
                      >
                        <span>
                          <span className="block font-display text-[15px] font-semibold text-ivory">{b.label}</span>
                          <span className="mt-0.5 block font-body text-xs text-ivory/45">{b.hint}</span>
                        </span>
                        <span
                          aria-hidden="true"
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                            selected ? "border-sienna-bright" : "border-olive/40"
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full bg-sienna-bright transition-all duration-300 ${
                              selected ? "scale-100" : "scale-0"
                            }`}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
                <StepError message={errors.budget} />
              </fieldset>
            )}

            {step === 2 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <WizField
                  label="Your name"
                  id="wiz-name"
                  value={data.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                  autoComplete="name"
                />
                <WizField
                  label="Company / brand"
                  id="wiz-company"
                  value={data.company}
                  onChange={(e) => set("company", e.target.value)}
                  error={errors.company}
                  autoComplete="organization"
                />
                <WizField
                  label="Email"
                  id="wiz-email"
                  type="email"
                  inputMode="email"
                  value={data.email}
                  onChange={(e) => set("email", e.target.value)}
                  error={errors.email}
                  autoComplete="email"
                />
                <WizField
                  label="Phone (optional)"
                  id="wiz-phone"
                  type="tel"
                  inputMode="tel"
                  value={data.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-body text-xs uppercase tracking-[0.14em] text-ivory/40">Your picks</span>
                  <ReviewChip label={data.service} onEdit={() => jump(0)} />
                  <ReviewChip label={data.budget} onEdit={() => jump(1)} />
                </div>
                <WizField
                  className="mt-5"
                  label="What are you trying to achieve?"
                  id="wiz-message"
                  textarea
                  value={data.message}
                  onChange={(e) => set("message", e.target.value)}
                  error={errors.message}
                  placeholder="Your market, your competitors, the position you want to claim"
                />
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-t border-olive/20 pt-6">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn btn-ghost font-display text-sm font-semibold">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 10H4m0 0 5 5m-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </button>
          ) : (
            <p className="max-w-[16rem] font-body text-xs leading-relaxed text-ivory/35">
              Your details stay private - no lists, no spam, no sharing.
            </p>
          )}
          <button type="submit" className="btn btn-primary min-w-[190px]">
            {step < 3 ? (
              <>
                Continue
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            ) : (
              <>
                Start the Conversation
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}