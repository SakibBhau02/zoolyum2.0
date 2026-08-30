import Link from "next/link";

/**
 * Custom 404 — understated, per spec 09.11.
 */
export default function NotFound() {
  return (
    <section className="relative flex min-h-svh items-center justify-center overflow-hidden">
      <div className="dappled" aria-hidden="true" />
      <div className="section-shell relative z-10 py-32 text-center">
        <p className="font-display text-[7rem] font-semibold leading-none tracking-tight text-sienna/15 md:text-[10rem]">
          404
        </p>
        <h1 className="mx-auto -mt-4 max-w-2xl font-display text-display-3 font-semibold text-ivory md:-mt-8">
          This page isn&apos;t part of the pattern we mapped.
        </h1>
        <p className="mx-auto mt-5 max-w-md font-accent text-xl italic leading-relaxed text-ivory/55">
          Let&apos;s get you back on the path.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/" className="btn btn-primary">
            Back to the homepage
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            Tell us what you were looking for
          </Link>
        </div>
      </div>
    </section>
  );
}
