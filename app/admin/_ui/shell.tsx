"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { logoutAction } from "../actions";
import { Icon } from "./icons";
import { NAV_GROUPS, QUICK_CREATE, type NavItem } from "./nav-config";

type ShellUser = { name: string; email: string; role: string };

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function NavLink({ item, active, unread, onClick }: { item: NavItem; active: boolean; unread: number; onClick?: () => void }) {
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--a-accent-soft)] text-[var(--a-accent)]"
          : "text-[var(--a-muted)] hover:bg-[rgba(246,241,232,0.05)] hover:text-[var(--a-text)]"
      }`}
    >
      <Icon name={item.icon} className="h-4 w-4 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badgeKey === "leads" && unread > 0 && (
        <span className="rounded-full bg-[var(--a-accent)] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#1a1109]">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  );
}

function SidebarBody({
  path,
  user,
  unread,
  onNavigate,
}: {
  path: string;
  user: ShellUser;
  unread: number;
  onNavigate?: () => void;
}) {
  // Highlight the most specific match, so /admin/seo/search does not also
  // light up /admin/seo.
  const best = NAV_GROUPS.flatMap((g) => g.items)
    .filter((item) => (item.exact ? path === item.href : path === item.href || path.startsWith(item.href + "/")))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[var(--a-accent)] font-[family-name:var(--font-display)] text-[13px] font-bold text-[#1a1109]">
          Z
        </span>
        <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-tight">
          Zoolyum<span className="text-[var(--a-accent)]">.</span>
        </span>
        <span className="a-badge ml-1 !px-1.5 !py-0 !text-[9px]">CMS</span>
      </Link>

      <nav className="a-scroll mt-5 flex-1 space-y-5 overflow-y-auto pb-4" aria-label="Admin">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="a-faint mb-1.5 px-2.5 text-[9.5px] font-bold uppercase tracking-[0.18em]">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={best === item.href} unread={unread} onClick={onNavigate} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="a-divide pt-3">
        <div className="flex items-center gap-2.5 px-1.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--a-line-strong)] bg-[var(--a-panel-2)] text-[11px] font-semibold">
            {initials(user.name) || "Z"}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[12px] font-semibold">{user.name}</span>
            <span className="a-faint block truncate text-[10.5px] capitalize">{user.role}</span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="a-btn a-btn-ghost a-btn-sm" title="Log out" aria-label="Log out">
              <Icon name="arrowLeft" className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

type PaletteItem = { label: string; href: string; icon: NavItem["icon"]; hint?: string };

export function AdminShell({
  user,
  unread,
  online,
  children,
}: {
  user: ShellUser;
  unread: number;
  online: boolean;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const nav = NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ label: i.label, href: i.href, icon: i.icon, hint: g.label })));
    const create = QUICK_CREATE.map((q) => ({ label: q.label, href: q.href, icon: q.icon, hint: "Create" }));
    return [...nav, ...create];
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return paletteItems.slice(0, 10);
    return paletteItems
      .filter((i) => i.label.toLowerCase().includes(q) || i.href.toLowerCase().includes(q))
      .slice(0, 10);
  }, [paletteItems, query]);

  const go = useCallback(
    (href: string) => {
      setPalette(false);
      setQuery("");
      setCursor(0);
      setDrawer(false);
      router.push(href);
    },
    [router],
  );

  const openPalette = useCallback(() => {
    setQuery("");
    setCursor(0);
    setPalette(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => {
          if (!v) {
            setQuery("");
            setCursor(0);
          }
          return !v;
        });
      }
      if (e.key === "Escape") {
        setPalette(false);
        setDrawer(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="a-root min-h-svh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[236px] border-r border-[var(--a-line)] bg-[var(--a-panel)] px-3 py-4 lg:block">
        <SidebarBody path={path} user={user} unread={unread} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawer(false)}
          />
          <div className="a-fade-in absolute inset-y-0 left-0 w-[268px] border-r border-[var(--a-line)] bg-[var(--a-panel)] px-3 py-4">
            <SidebarBody path={path} user={user} unread={unread} onNavigate={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-[236px]">
        {/* Topbar */}
        <header className="sticky top-0 z-20 border-b border-[var(--a-line)] bg-[rgba(23,19,16,0.86)] backdrop-blur-md">
          <div className="flex h-[54px] items-center gap-2 px-4 md:px-7">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="a-btn a-btn-ghost a-btn-sm lg:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={openPalette}
              className="a-btn a-btn-ghost !justify-start gap-2 !px-2.5 !text-[12px]"
              aria-label="Open command palette"
            >
              <Icon name="search" className="h-4 w-4" />
              <span className="a-faint hidden sm:inline">Search or jump to...</span>
              <span className="a-kbd ml-1 hidden sm:inline">Ctrl K</span>
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span className="a-faint hidden items-center gap-1.5 text-[11px] sm:flex" title={online ? "Database connected" : "Database unreachable"}>
                <span className={`h-1.5 w-1.5 rounded-full ${online ? "bg-[var(--a-ok)]" : "bg-[var(--a-bad)]"}`} aria-hidden="true" />
                {online ? "DB connected" : "DB offline"}
              </span>
              <a href="/" target="_blank" rel="noreferrer" className="a-btn a-btn-sm">
                <Icon name="external" className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View site</span>
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-7 md:py-8">{children}</main>
      </div>

      {/* Command palette */}
      {palette && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 px-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Command palette">
          <button type="button" aria-label="Close" className="absolute inset-0" onClick={() => setPalette(false)} />
          <div className="a-fade-in relative w-full max-w-lg overflow-hidden rounded-[13px] border border-[var(--a-line-strong)] bg-[var(--a-panel)] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-[var(--a-line)] px-3.5">
              <Icon name="search" className="h-4 w-4 text-[var(--a-faint)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCursor((c) => Math.min(c + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setCursor((c) => Math.max(c - 1, 0));
                  } else if (e.key === "Enter" && results[cursor]) {
                    e.preventDefault();
                    go(results[cursor].href);
                  }
                }}
                placeholder="Search pages, collections, actions..."
                className="w-full bg-transparent py-3.5 text-[13.5px] outline-none placeholder:text-[var(--a-faint)]"
                aria-label="Search"
              />
              <span className="a-kbd shrink-0">ESC</span>
            </div>
            <ul className="a-scroll max-h-[52vh] overflow-y-auto p-1.5" role="listbox">
              {results.length === 0 && <li className="a-faint px-3 py-6 text-center text-[12.5px]">Nothing matches that.</li>}
              {results.map((item, i) => (
                <li key={item.href + item.label}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(item.href)}
                    className={`flex w-full items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[12.5px] ${
                      i === cursor ? "bg-[var(--a-accent-soft)] text-[var(--a-accent)]" : "text-[var(--a-muted)]"
                    }`}
                  >
                    <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && <span className="a-faint text-[10px] uppercase tracking-[0.12em]">{item.hint}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
