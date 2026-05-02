import Link from "next/link";
import { ArrowRight, BarChart3, Files, SearchCheck } from "lucide-react";
import { PricingCard } from "@/components/PricingCard";

const faqs = [
  {
    q: "How is this different from a regular SEO audit tool?",
    a: "Most audits only report page-level metadata issues. This tool compares page intent and keyword targets across your site to detect where multiple pages are competing for the same SERP opportunity."
  },
  {
    q: "Do I need Search Console access?",
    a: "No. The scanner works directly from your public URLs, so you can run a first-pass cannibalization analysis without connecting third-party accounts."
  },
  {
    q: "What should I do with the recommendations?",
    a: "Use high-risk clusters to prioritize merges, redirects, and heading rewrites. Medium-risk clusters are usually resolved by tightening each page's target intent."
  },
  {
    q: "Can agencies use this with client websites?",
    a: "Yes. Agencies can use scans as part of monthly reporting and content strategy reviews for each client domain they manage."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="inline-flex items-center rounded-full border border-[#32445f] bg-[#111a27] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#8ecdf5]">
            Content-Creation SEO Tool
          </p>
          <h1
            className="mt-6 text-4xl font-bold leading-tight text-[#e6edf3] md:text-6xl"
            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
          >
            Find content competing against itself in search
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[#a8b7cf]">
            Content Cannibalization Detector scans your site, flags pages targeting the same keywords, and gives clear consolidation or differentiation steps to recover lost organic traffic.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f6feb] to-[#0ea5e9] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Open Dashboard
              <ArrowRight size={16} />
            </Link>
            <a
              href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
              className="inline-flex items-center justify-center rounded-xl border border-[#334860] bg-[#121923] px-6 py-3 text-sm font-semibold text-[#d9e3f1] transition hover:border-[#4cc9f0]"
            >
              Buy for $12/mo
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#263347] bg-[#121923] p-5">
            <p className="text-xs uppercase tracking-wider text-[#7f8eaa]">Traffic Risk</p>
            <p className="mt-2 text-3xl font-bold text-[#f1f6ff]">20-40%</p>
            <p className="mt-1 text-sm text-[#9fb0c9]">
              Typical organic traffic loss when multiple pages chase the same query.
            </p>
          </div>
          <div className="rounded-2xl border border-[#263347] bg-[#121923] p-5">
            <p className="text-xs uppercase tracking-wider text-[#7f8eaa]">Fix Priority</p>
            <p className="mt-2 text-3xl font-bold text-[#f1f6ff]">High</p>
            <p className="mt-1 text-sm text-[#9fb0c9]">
              Consolidation can lift ranking signals quickly when duplicates are clear.
            </p>
          </div>
          <div className="rounded-2xl border border-[#263347] bg-[#121923] p-5">
            <p className="text-xs uppercase tracking-wider text-[#7f8eaa]">Time to Insight</p>
            <p className="mt-2 text-3xl font-bold text-[#f1f6ff]">&lt; 2 min</p>
            <p className="mt-1 text-sm text-[#9fb0c9]">
              Crawl, compare, and prioritize overlapping content opportunities fast.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-[#1f2a3a] bg-[#0f1723] py-16">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3">
          <div className="rounded-2xl border border-[#253041] bg-[#111a27] p-5">
            <Files className="text-[#4cc9f0]" size={22} />
            <h2 className="mt-3 text-lg font-semibold text-[#e6edf3]">The Problem</h2>
            <p className="mt-2 text-sm text-[#9eb1cd]">
              Teams publish new posts for every campaign and accidentally create overlapping pages with near-identical intent.
            </p>
          </div>
          <div className="rounded-2xl border border-[#253041] bg-[#111a27] p-5">
            <SearchCheck className="text-[#4cc9f0]" size={22} />
            <h2 className="mt-3 text-lg font-semibold text-[#e6edf3]">The Solution</h2>
            <p className="mt-2 text-sm text-[#9eb1cd]">
              We crawl internal pages, extract core topics, and identify keyword clusters where your pages cannibalize each other.
            </p>
          </div>
          <div className="rounded-2xl border border-[#253041] bg-[#111a27] p-5">
            <BarChart3 className="text-[#4cc9f0]" size={22} />
            <h2 className="mt-3 text-lg font-semibold text-[#e6edf3]">The Outcome</h2>
            <p className="mt-2 text-sm text-[#9eb1cd]">
              Get practical action plans: what to merge, what to redirect, and what to reposition for clearer search intent.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="text-3xl font-bold text-[#e6edf3]" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
            Pricing that fits content teams
          </h2>
          <p className="mt-3 text-[#9eb1cd]">
            One flat monthly plan designed for marketers who need clear decisions, not another dashboard of vague SEO signals.
          </p>
          <div className="mt-6 space-y-4 text-sm text-[#c8d4e6]">
            <p>Use every scan to surface hidden overlap before it drags rankings down.</p>
            <p>Share quick wins with editors and strategists in weekly planning meetings.</p>
            <p>Prioritize fixes by risk level so high-impact consolidations happen first.</p>
          </div>
        </div>

        <PricingCard />
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="text-3xl font-bold text-[#e6edf3]" style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}>
          FAQ
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.q} className="rounded-2xl border border-[#253041] bg-[#121923] p-5">
              <h3 className="text-base font-semibold text-[#e6edf3]">{faq.q}</h3>
              <p className="mt-2 text-sm text-[#9eb1cd]">{faq.a}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
