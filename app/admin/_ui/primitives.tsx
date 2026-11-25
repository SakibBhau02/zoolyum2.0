import Link from "next/link";
import type { ReactNode } from "react";

/* ------------------------------- page chrome ------------------------------ */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="mb-7">
      {eyebrow && <p className="a-eyebrow">{eyebrow}</p>}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="a-title text-[28px] md:text-[34px]">{title}</h1>
          {description && <div className="a-muted mt-2 max-w-2xl text-[13px] leading-relaxed">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {meta && <div className="mt-4">{meta}</div>}
    </header>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="a-faint mb-3 flex flex-wrap items-center gap-1.5 text-[11.5px]">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-[var(--a-accent)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--a-text)]/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

/* -------------------------------- surfaces ------------------------------- */

export function Card({
  children,
  className = "",
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return <section className={`a-card ${padded ? "p-5" : ""} ${className}`}>{children}</section>;
}

export function CardHeader({
  title,
  hint,
  action,
}: {
  title: ReactNode;
  hint?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="a-title text-[16px]">{title}</h2>
        {hint && <p className="a-faint mt-1 text-[11.5px]">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const body = (
    <>
      <p className="a-faint text-[10.5px] font-semibold uppercase tracking-[0.14em]">{label}</p>
      <p className="a-title mt-2 text-[26px] tabular-nums">{value}</p>
      {hint && (
        <p
          className={`mt-1 text-[11.5px] ${
            tone === "ok"
              ? "text-[var(--a-ok)]"
              : tone === "warn"
                ? "text-[var(--a-warn)]"
                : tone === "bad"
                  ? "text-[var(--a-bad)]"
                  : "a-faint"
          }`}
        >
          {hint}
        </p>
      )}
    </>
  );
  if (href) {
    return (
      <Link href={href} className="a-card block p-4 transition-colors hover:border-[rgba(255,106,38,0.45)]">
        {body}
      </Link>
    );
  }
  return <div className="a-card p-4">{body}</div>;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn" | "bad" | "accent";
}) {
  const cls =
    tone === "ok"
      ? "a-badge a-badge-ok"
      : tone === "warn"
        ? "a-badge a-badge-warn"
        : tone === "bad"
          ? "a-badge a-badge-bad"
          : tone === "accent"
            ? "a-badge a-badge-accent"
            : "a-badge";
  return <span className={cls}>{children}</span>;
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="a-card-quiet flex flex-col items-center justify-center px-6 py-12 text-center">
      <p className="a-title text-[15px]">{title}</p>
      {description && <p className="a-faint mt-2 max-w-sm text-[12.5px] leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* --------------------------------- forms --------------------------------- */

export function Field({
  label,
  hint,
  htmlFor,
  required,
  children,
  error,
  suffix,
}: {
  label: string;
  hint?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
  suffix?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label className="a-label" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-[var(--a-accent)]">*</span>}
        </label>
        {suffix}
      </div>
      {children}
      {error ? (
        <p className="mt-1 text-[11.5px] text-[var(--a-bad)]">{error}</p>
      ) : (
        hint && <p className="a-help">{hint}</p>
      )}
    </div>
  );
}

/* -------------------------------- feedback -------------------------------- */

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "ok" | "warn" | "bad";
  children: ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "border-[rgba(93,211,158,0.35)] bg-[rgba(93,211,158,0.08)] text-[var(--a-ok)]"
      : tone === "warn"
        ? "border-[rgba(242,181,68,0.35)] bg-[rgba(242,181,68,0.08)] text-[var(--a-warn)]"
        : tone === "bad"
          ? "border-[rgba(242,112,95,0.35)] bg-[rgba(242,112,95,0.08)] text-[var(--a-bad)]"
          : "border-[var(--a-line)] bg-[rgba(246,241,232,0.03)] text-[var(--a-muted)]";
  return <div className={`rounded-[9px] border px-3.5 py-2.5 text-[12.5px] leading-relaxed ${cls}`}>{children}</div>;
}

export function Progress({ value, tone = "accent" }: { value: number; tone?: "accent" | "ok" | "warn" | "bad" }) {
  const pct = Math.max(0, Math.min(100, value));
  const color =
    tone === "ok"
      ? "var(--a-ok)"
      : tone === "warn"
        ? "var(--a-warn)"
        : tone === "bad"
          ? "var(--a-bad)"
          : "var(--a-accent)";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(246,241,232,0.1)]" role="presentation">
      <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}
