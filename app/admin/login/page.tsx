import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "../ui";

export const metadata: Metadata = {
  title: "Sign in — Zoolyum Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-3xl overflow-hidden rounded-[16px] border border-[var(--a-line)] bg-[var(--a-panel)] md:grid-cols-[1.05fr_1fr]">
        <div className="relative hidden flex-col justify-between bg-[#1d1712] p-8 md:flex">
          <div>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--a-accent)] font-[family-name:var(--font-display)] text-sm font-bold text-[#1a1109]">
              Z
            </span>
            <p className="a-eyebrow mt-8">Zoolyum Studio</p>
            <h1 className="a-title mt-3 text-[27px] leading-[1.15]">
              Read the market.
              <br />
              Publish the position.
            </h1>
            <p className="a-muted mt-4 max-w-[28ch] text-[12.5px] leading-relaxed">
              Content, SEO and the site&apos;s answer-engine surface — all in one workspace.
            </p>
          </div>
          <p className="a-faint text-[11px]">Private area · authorised staff only</p>
        </div>

        <div className="p-7 md:p-9">
          <p className="a-eyebrow md:hidden">Zoolyum Studio</p>
          <h2 className="a-title mt-2 text-[22px] md:mt-0">Sign in</h2>
          <p className="a-faint mt-1.5 text-[12px]">Use the email and password on your account.</p>
          <div className="mt-6">
            <LoginForm next={next ?? "/admin"} />
          </div>
          <p className="a-faint mt-6 text-center text-[11.5px]">
            <Link href="/" className="underline underline-offset-2 transition-colors hover:text-[var(--a-accent)]">
              Back to site
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
