import { cookies } from "next/headers";
import Link from "next/link";
import { AnalysisForm } from "@/components/AnalysisForm";

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const error = queryValue(params.error);
  const claimed = queryValue(params.claimed) === "1";

  const cookieStore = await cookies();
  const hasAccess = cookieStore.get("ccd_access")?.value === "granted";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-wider text-[#8ecdf5]">Dashboard</p>
          <h1 className="text-3xl font-bold text-[#e6edf3]" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            Content Cannibalization Detector
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-xl border border-[#334860] bg-[#121923] px-4 py-2 text-sm font-semibold text-[#d9e3f1] transition hover:border-[#4cc9f0]"
        >
          Back to Home
        </Link>
      </div>

      {!hasAccess ? (
        <section className="rounded-2xl border border-[#2a3a52] bg-[#121923] p-6">
          <h2 className="text-xl font-semibold text-[#e6edf3]">Paid Access Required</h2>
          <p className="mt-2 text-sm text-[#9eb1cd]">
            The analyzer is behind a paywall. Purchase a plan, then claim access with your checkout email.
          </p>

          {claimed ? (
            <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
              Access granted. Refresh if your session does not update immediately.
            </div>
          ) : null}

          {error === "not_found" ? (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              We could not find a completed purchase for that email yet.
            </div>
          ) : null}

          {error === "missing_email" ? (
            <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              Enter the email used during Stripe checkout.
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#1f6feb] to-[#0ea5e9] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Buy Access for $12/mo
            </a>
          </div>

          <form action="/api/access/claim" method="POST" className="mt-6 space-y-3">
            <label htmlFor="claim-email" className="block text-sm font-medium text-[#d5deeb]">
              Claim Access with Purchase Email
            </label>
            <input
              id="claim-email"
              name="email"
              type="email"
              placeholder="you@company.com"
              required
              className="w-full max-w-md rounded-xl border border-[#314158] bg-[#0f1723] px-4 py-3 text-[#e6edf3] placeholder:text-[#667a99] outline-none transition focus:border-[#4cc9f0]"
            />
            <button
              type="submit"
              className="rounded-xl border border-[#334860] bg-[#0f1723] px-4 py-2 text-sm font-semibold text-[#d9e3f1] transition hover:border-[#4cc9f0]"
            >
              Verify Purchase
            </button>
          </form>
        </section>
      ) : (
        <AnalysisForm />
      )}
    </main>
  );
}
