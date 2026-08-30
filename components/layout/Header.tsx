"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "@/lib/data";
import { Logo } from "./Logo";
import { useSound } from "./SoundProvider";

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

const menuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.06, when: "beforeChildren" },
  },
  exit: { opacity: 0, transition: { duration: 0.22, when: "afterChildren" } },
};

const linkVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: { opacity: 0, transition: { duration: 0.12 } },
};

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-[250ms] ease-out ${
          scrolled
            ? "bg-espresso/90 shadow-[0_2px_16px_rgba(0,0,0,0.35)] backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="section-shell flex h-[72px] items-center justify-between gap-4">
          <Logo withTagline />

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative font-body text-sm font-medium tracking-wide transition-colors duration-300 ${
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
            <Link
              href="/contact"
              className="btn btn-primary hidden !px-5 !py-2.5 !text-[13px] md:inline-flex"
            >
              Start a Conversation
            </Link>
            <button
              type="button"
              aria-expanded={menuOpen}
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

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-40 flex flex-col bg-espresso lg:hidden"
          >
            <div className="dappled" aria-hidden="true" />
            <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-1 px-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div key={link.href} variants={linkVariants}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-baseline gap-4 py-3 ${
                      pathname.startsWith(link.href) ? "text-sienna-bright" : "text-ivory"
                    }`}
                  >
                    <span className="font-body text-xs font-medium tracking-widest text-olive">
                      0{i + 1}
                    </span>
                    <span className="font-display text-4xl font-semibold tracking-tight transition-colors group-hover:text-sienna-bright">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={linkVariants} className="mt-8">
                <Link
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Start a Conversation
                </Link>
              </motion.div>
            </nav>
            <motion.p
              variants={linkVariants}
              className="px-8 pb-10 font-body text-sm text-ivory/45"
            >
              Consultancy. Strategy. Solution. — Based in Dhaka.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
