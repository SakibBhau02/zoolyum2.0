"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MenuLinkItem } from "@/lib/content";
import { Logo } from "./Logo";
import { useSound } from "./SoundProvider";
import { lockScroll, unlockScroll } from "@/lib/smooth-scroll";

function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      title={enabled ? "Mute interface sounds" : "Enable interface sounds"}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/35 text-ivory/60 transition-colors duration-300 hover:border-sienna-bright/60 hover:text-sienna-bright"
    >
      {enabled ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
          <path d="M16.5 8.5a5 5 0 0 1 0 7" strokeLinecap="round" />
          <path d="M19 6a8.5 8.5 0 0 1 0 12" strokeLinecap="round" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" strokeLinejoin="round" />
          <path d="m16.5 9.5 5 5m0-5-5 5" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

export function Header({
  links,
  ctaLabel,
  ctaHref = "/contact",
  tagline,
}: {
  links: MenuLinkItem[];
  ctaLabel: string;
  ctaHref?: string;
  tagline: string;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    if (menuOpen) lockScroll();
    else unlockScroll();
    return () => {
      unlockScroll();
    };
  }, [menuOpen]);

  // Modal behaviour for the mobile menu: move focus in, trap Tab, close on
  // Escape, and hand focus back to the toggle on close.
  useEffect(() => {
    if (!menuOpen) return;
    const panel = panelRef.current;
    if (!panel) return;
    const toggle = toggleRef.current;
    const focusables = () => {
      const inPanel = Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      // The close button lives in the header, outside the panel — keep it in
      // the trap so keyboard users can still dismiss the menu.
      return [toggle, ...inPanel].filter((el): el is HTMLElement => el !== null);
    };    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      toggle?.focus();
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-[250ms] ease-out ${
          scrolled
            ? "header-glass"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="section-shell flex h-[72px] items-center justify-between gap-4">
          <Logo withTagline />

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {links.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  aria-current={active ? "page" : undefined}
                  className={`nav-link relative font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
                    active ? "text-sienna-bright" : "text-ivory/75 hover:text-ivory"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <SoundToggle />
            {/* Wrapper carries the responsive display: .btn sets
                display:inline-flex from globals.css, which would beat a
                `hidden` utility on the button itself. */}
            <span className="hidden md:inline-flex">
              <Link
                href={ctaHref}
                prefetch={false}
                className="btn btn-primary !px-5 !py-2.5 !text-[13px] whitespace-nowrap"
              >
                {ctaLabel}
              </Link>
            </span>
            <button
              ref={toggleRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-olive/35 lg:hidden"
            >
              <span
                className={`block h-[2px] w-4.5 bg-ivory transition-transform duration-300 ${
                  menuOpen ? "translate-y-[4px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[2px] w-4.5 bg-sienna-bright transition-transform duration-300 ${
                  menuOpen ? "-translate-y-[4px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={panelRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="menu-panel fixed inset-0 z-40 flex flex-col bg-espresso lg:hidden"
        >
          <div className="dappled" aria-hidden="true" />
          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1 px-8">
            {links.map((link, i) => (
              <div key={link.href} className="menu-link" style={{ animationDelay: `${60 + i * 45}ms` }}>
                <Link
                  href={link.href}
                  prefetch={false}
                  onClick={() => setMenuOpen(false)}
                  className={`group flex items-baseline gap-4 py-3 ${
                    pathname.startsWith(link.href) ? "text-sienna-bright" : "text-ivory"
                  }`}
                >
                  <span aria-hidden="true" className="font-body text-xs font-medium tracking-widest text-olive">
                    0{i + 1}
                  </span>
                  <span className="font-display text-4xl font-semibold tracking-tight transition-colors group-hover:text-sienna-bright">
                    {link.label}
                  </span>
                </Link>
              </div>
            ))}
            <div className="menu-link mt-8" style={{ animationDelay: `${60 + links.length * 45}ms` }}>
              <Link
                href={ctaHref}
                prefetch={false}
                onClick={() => setMenuOpen(false)}
                className="btn btn-primary w-full"
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
          <p
            className="menu-link px-8 pb-10 font-body text-sm text-ivory/66"
            style={{ animationDelay: `${90 + links.length * 45}ms` }}
          >
            {tagline} - Based in Dhaka.
          </p>
        </div>
      )}
    </>
  );
}
