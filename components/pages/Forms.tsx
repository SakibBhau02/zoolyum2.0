"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useSound } from "@/components/layout/SoundProvider";
import { createLead } from "@/app/admin/actions";
import { trackLead } from "@/components/analytics/GoogleAnalytics";

/**
 * Field — floating-label form field with inline validation styling
 * and the Sienna Amber focus ring.
 */
export function Field({
  label,
  name,
  type = "text",
  required = false,
  textarea = false,
  options,
  file = false,
  accept,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  options?: string[];
  file?: boolean;
  accept?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  const sharedClasses =
    "peer w-full rounded-lg border border-olive/35 bg-espresso px-4 pt-6 pb-2.5 font-body text-[15px] text-ivory placeholder:text-transparent transition-colors duration-300 focus:border-sienna-bright/70 focus:outline-none";

  const labelClasses =
    "pointer-events-none absolute left-4 top-2 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-ivory/45 transition-all duration-300 peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-ivory/50 peer-focus:top-2 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-sienna-bright";

  return (
    <div className="relative">
      {options ? (
        <select name={name} required={required} defaultValue={defaultValue ?? ""} className={`${sharedClasses} appearance-none`}>
          <option value="" disabled>
            Select…
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          name={name}
          required={required}
          rows={5}
          placeholder={placeholder ?? " "}
          defaultValue={defaultValue}
          className={`${sharedClasses} resize-y`}
        />
      ) : file ? (
        <input
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="w-full cursor-pointer rounded-lg border border-olive/35 bg-espresso px-4 py-5 font-body text-sm text-ivory/60 file:mr-4 file:rounded-md file:border-0 file:bg-sienna-bright file:px-4 file:py-2 file:font-display file:text-sm file:font-semibold file:text-espresso hover:border-sienna-bright/50"
        />
      ) : (
        <input
          type={type}
          name={name}
          required={required}
          placeholder={placeholder ?? " "}
          defaultValue={defaultValue}
          className={sharedClasses}
        />
      )}
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-sienna-bright"> *</span>}
      </label>
      {options && (
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ivory/45"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m5 8 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/**
 * SubmitButton — fades to a checkmark morph on submit (300ms).
 * Plays the opt-in micro-click.
 */
export function SubmitButton({ label }: { label: string }) {
  const [done, setDone] = useState(false);
  const { click } = useSound();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Morph to the checkmark only when the form actually submits
  // (validation passed) — listen on the form, not the click.
  useEffect(() => {
    const form = buttonRef.current?.closest("form");
    if (!form) return;
    const onSubmit = () => setDone(true);
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, []);


  return (
    <button
      ref={buttonRef}
      type="submit"
      onClick={click}
      disabled={done}
      className={`btn ${done ? "btn-secondary" : "btn-primary"} relative min-w-[220px]`}
    >
      {done ? (
        <>
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
            <path d="m3.5 10.5 4 4 9-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Received. We reply within a day.
        </>
      ) : (
        <>
          {label}
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M4 10h12m0 0-5-5m5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </>
      )}
    </button>
  );
}

/**
 * FormShell — shared client form wrapper.
 */
export function FormShell({
  children,
  onSubmitted,
  className = "",
  leadKind,
}: {
  children: ReactNode;
  onSubmitted?: () => void;
  className?: string;
  leadKind?: string;
}) {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitted) return;
    setSubmitted(true);
    if (leadKind) {
      const fd = new FormData(e.currentTarget);
      const fields: Record<string, string | File> = {};
      fd.forEach((v, k) => {
        if (v instanceof File && v.size === 0) return;
        fields[k] = v instanceof File ? v : String(v);
      });
      createLead(leadKind, fields)
        .then((r) => {
          if (r.ok) trackLead(leadKind);
        })
        .catch(() => {});
    }
    onSubmitted?.();
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
