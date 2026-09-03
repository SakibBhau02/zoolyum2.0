import { LoginForm } from "../ui";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="flex min-h-svh items-center justify-center bg-espresso px-4">
      <div className="w-full max-w-sm rounded-2xl border border-olive/25 bg-umber/60 p-8">
        <p className="font-body text-[11px] font-semibold uppercase tracking-[0.22em] text-sienna-bright">
          Zoolyum Admin
        </p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ivory">
          Enter the studio<span className="text-sienna">.</span>
        </h1>
        <div className="mt-7">
          <LoginForm next={next ?? "/admin"} />
        </div>
      </div>
    </div>
  );
}