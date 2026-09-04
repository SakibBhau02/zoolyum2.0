"use client";

import Link from "next/link";
import { useState } from "react";
import type { MenuLinkItem } from "@/lib/content";
import { createLead } from "@/app/admin/actions";
import { trackLead } from "@/components/analytics/GoogleAnalytics";
import { Logo } from "./Logo";

const SOCIALS = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    path: "M4.98 3.5A2.49 2.49 0 1 1 0 3.5a2.49 2.49 0 0 1 4.98 0zM.24 8.31h4.72V23.5H.24V8.31zm7.72 0h4.52v2.07h.06c.63-1.19 2.17-2.45 4.47-2.45 4.78 0 5.66 3.15 5.66 7.24v8.33h-4.71v-7.39c0-1.76-.03-4.03-2.45-4.03-2.46 0-2.84 1.92-2.84 3.9v7.52H7.96V8.31z",
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    path: "M13.5 23.5v-8.6h2.9l.43-3.36H13.5V9.39c0-.97.27-1.64 1.66-1.64h1.78V4.63c-.31-.04-1.36-.13-2.59-.13-2.56 0-4.32 1.57-4.32 4.44v2.6H7.13v3.36h2.9v8.6h3.47z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    path: "M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2zm0 1.8c-3.15 0-3.5.01-4.74.07-1.08.05-1.67.23-2.06.38-.52.2-.89.44-1.28.83-.39.39-.63.76-.83 1.28-.15.39-.33.98-.38 2.06-.06 1.24-.07 1.59-.07 4.74s.01 3.5.07 4.74c.05 1.08.23 1.67.38 2.06.2.52.44.89.83 1.28.39.39.76.63 1.28.83.39.15.98.33 2.06.38 1.24.06 1.59.07 4.74.07s3.5-.01 4.74-.07c1.08-.05 1.67-.23 2.06-.38.52-.2.89-.44 1.28-.83.39-.39.63-.76.83-1.28.15-.39.33-.98.38-2.06.06-1.24.07-1.59.07-4.74s-.01-3.5-.07-4.74c-.05-1.08-.23-1.67-.38-2.06a3.45 3.45 0 0 0-.83-1.28 3.45 3.45 0 0 0-1.28-.83c-.39-.15-.98-.33-2.06-.38-1.24-.06-1.59-.07-4.74-.07zm0 3.06a4.94 4.94 0 1 1 0 9.88 4.94 4.94 0 0 1 0-9.88zm0 8.15a3.21 3.21 0 1 0 0-6.42 3.21 3.21 0 0 0 0 6.42zm6.4-8.35a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0z",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    path: "M23.5 7.6a2.9 2.9 0 0 0-2.05-2.05C19.6 5.1 12 5.1 12 5.1s-7.6 0-9.45.45A2.9 2.9 0 0 0 .5 7.6 30.3 30.3 0 0 0 .05 12c0 1.47.15 2.94.45 4.4a2.9 2.9 0 0 0 2.05 2.05c1.85.45 9.45.45 9.45.45s7.6 0 9.45-.45a2.9 2.9 0 0 0 2.05-2.05c.3-1.46.45-2.93.45-4.4 0-1.47-.15-2.94-.45-4.4zM9.75 15.35V8.65l5.85 3.35-5.85 3.35z",
  },
] as const;

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setDone(true);
        createLead("newsletter", { email: email.trim() })
          .then((r) => {
            if (r.ok) trackLead("newsletter");
          })
          .catch(() => {});
      }}
    >
      {done ? (
        <p className="font-accent text-lg italic text-sienna-bright">
          You&apos;re on the list. First insight arrives next month.
        </p>
      ) : (
        <div className="flex overflow-hidden rounded-lg border border-olive/35 focus-within:border-sienna-bright/70">
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="w-full bg-transparent px-4 py-3 font-body text-sm text-ivory placeholder:text-ivory/40 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 bg-sienna-bright px-5 font-display text-sm font-semibold text-espresso transition-colors duration-300 hover:bg-sienna"
          >
            Subscribe
          </button>
        </div>
      )}
    </form>
  );
}

export function Footer({
  explore,
  legal,
  services,
  contact,
  socials,
  tagline,
}: {
  explore: MenuLinkItem[];
  legal: MenuLinkItem[];
  services: { name: string; slug: string }[];
  contact: { email: string; phone: string; address: string };
  socials: Record<string, string>;
  tagline: string;
}) {
  return (
    <footer className="relative overflow-hidden bg-umber/50">
      {/* Thin Signal Thread rule above the footer */}
      <div className="section-shell pt-10" aria-hidden="true">
        <div className="thread w-full opacity-70" />
      </div>

      <div className="section-shell relative z-10 grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div>
          <Logo />
          <p className="body-copy mt-5 font-body text-sm leading-relaxed text-ivory/60">
            The strategic partner that turns market noise into a clear
            competitive advantage.
          </p>
          <address className="mt-6 space-y-1.5 font-body text-sm not-italic text-ivory/60">
            <p>{contact.address}</p>
            <p>
              <a href={`mailto:${contact.email}`} className="text-sienna-bright transition-opacity hover:opacity-80">
                {contact.email}
              </a>
            </p>
            <p>{contact.phone}</p>
          </address>
        </div>

        <nav aria-label="Company">
          <h3 className="eyebrow">Company</h3>
          <ul className="mt-5 space-y-3">
            {explore.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-body text-sm text-ivory/65 transition-colors hover:text-sienna-bright"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Services">
          <h3 className="eyebrow">Services</h3>
          <ul className="mt-5 space-y-3">
            {services.map((service) => (
              <li key={service.slug}>
                <Link
                  href={`/services/${service.slug}`}
                  className="font-body text-sm text-ivory/65 transition-colors hover:text-sienna-bright"
                >
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div data-lead-inline>
          <h3 className="eyebrow">One insight a month</h3>
          <p className="body-copy mt-5 font-body text-sm leading-relaxed text-ivory/60">
            One strategic insight a month. No noise — we dislike noise more
            than you do.
          </p>
          <NewsletterForm />
          <div className="mt-8 flex gap-3">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={socials[social.label.toLowerCase()] ?? social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/35 text-ivory/60 transition-colors duration-300 hover:border-sienna-bright/60 hover:text-sienna-bright"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-olive/20">
        <div className="section-shell flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="font-display text-sm font-semibold tracking-wide text-ivory">
            {tagline}{" "}
            <span className="font-normal text-ivory/50">— Based in Dhaka.</span>
          </p>
          <div className="flex gap-6 font-body text-xs text-ivory/45">
            {legal.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-sienna-bright">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative select-none overflow-hidden">
        <p className="translate-y-[30%] bg-gradient-to-b from-ivory/[0.05] to-transparent bg-clip-text text-center font-display text-[17vw] font-semibold leading-none tracking-tight text-transparent">
          ZOOYLUM
        </p>
      </div>
    </footer>
  );
}
