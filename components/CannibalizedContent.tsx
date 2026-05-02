import type { AnalysisResult } from "@/lib/keyword-analyzer";

type Props = {
  result: AnalysisResult & {
    pages: {
      url: string;
      title: string;
      wordCount: number;
    }[];
  };
};

function scoreTone(score: number) {
  if (score >= 70) {
    return {
      label: "Severe overlap",
      className: "bg-red-500/15 text-red-300 border border-red-500/30"
    };
  }

  if (score >= 40) {
    return {
      label: "Moderate overlap",
      className: "bg-amber-500/15 text-amber-300 border border-amber-500/30"
    };
  }

  return {
    label: "Low overlap",
    className: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
  };
}

export function CannibalizedContent({ result }: Props) {
  const tone = scoreTone(result.cannibalizationScore);

  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-2xl border border-[#253041] bg-[#121923] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#e6edf3]">Cannibalization Report</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>
            Score {result.cannibalizationScore}/100 · {tone.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-[#8b9bb4]">{result.summary}</p>
        <p className="mt-2 text-xs text-[#6f7f99]">
          Crawled {result.totalPages} pages and found {result.clusters.length} overlapping keyword clusters.
        </p>
      </div>

      {result.quickWins.length > 0 ? (
        <div className="rounded-2xl border border-[#253041] bg-[#121923] p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#a8b7cf]">Quick Wins</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#d5deeb]">
            {result.quickWins.map((item) => (
              <li key={item} className="rounded-md border border-[#253041] bg-[#0f1723] p-3">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-4">
        {result.clusters.map((cluster) => (
          <article key={`${cluster.keyword}-${cluster.intent}`} className="rounded-2xl border border-[#253041] bg-[#121923] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-[#e6edf3]">{cluster.keyword}</h3>
              <span className="rounded-full border border-[#314158] px-2 py-0.5 text-xs text-[#9eb1cd]">
                {cluster.intent}
              </span>
              <span className="rounded-full border border-[#314158] px-2 py-0.5 text-xs text-[#9eb1cd]">
                Risk: {cluster.risk}
              </span>
              <span className="rounded-full border border-[#314158] px-2 py-0.5 text-xs text-[#9eb1cd]">
                Conflict {cluster.conflictScore}
              </span>
            </div>

            <p className="mt-3 text-sm text-[#d5deeb]">{cluster.recommendation}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {cluster.pages.map((page) => (
                <div key={page.url} className="rounded-lg border border-[#253041] bg-[#0f1723] p-3">
                  <p className="text-xs uppercase tracking-wide text-[#7f8eaa]">Overlap {page.overlapScore}/100</p>
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block text-sm font-semibold text-[#7dd3fc] hover:underline"
                  >
                    {page.title || page.url}
                  </a>
                  <p className="mt-1 text-sm text-[#a8b7cf]">{page.primaryAngle}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#a8b7cf]">Action Plan</h4>
              <ul className="mt-2 space-y-2 text-sm text-[#d5deeb]">
                {cluster.actionPlan.map((step) => (
                  <li key={step} className="rounded-md border border-[#253041] bg-[#0f1723] p-3">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
