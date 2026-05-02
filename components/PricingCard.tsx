import { CheckCircle2 } from "lucide-react";

const features = [
  "Unlimited site scans on your own domains",
  "Keyword overlap clusters with risk scoring",
  "Consolidation vs differentiation action plans",
  "Email-based purchase claim and cookie access",
  "Export-ready recommendations for content teams"
];

export function PricingCard() {
  return (
    <article className="rounded-2xl border border-[#2a3a52] bg-[#121923] p-6 shadow-[0_0_0_1px_rgba(76,201,240,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-wider text-[#4cc9f0]">Starter Plan</p>
      <h3 className="mt-2 text-3xl font-bold text-[#e6edf3]">$12/mo</h3>
      <p className="mt-1 text-sm text-[#8b9bb4]">Built for content teams and SEO agencies managing multiple URLs.</p>

      <ul className="mt-5 space-y-3 text-sm text-[#d5deeb]">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#2dd4bf]" size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a
        href={process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? ""}
        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#1f6feb] to-[#0ea5e9] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Buy Access
      </a>
      <p className="mt-3 text-xs text-[#7f8eaa]">
        After checkout, return to the dashboard and claim access with the same purchase email.
      </p>
    </article>
  );
}
