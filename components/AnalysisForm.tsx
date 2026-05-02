"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Search } from "lucide-react";
import { z } from "zod";
import { CannibalizedContent } from "@/components/CannibalizedContent";
import type { AnalysisResult } from "@/lib/keyword-analyzer";

type ApiResult = AnalysisResult & {
  pages: {
    url: string;
    title: string;
    wordCount: number;
  }[];
};

const formSchema = z.object({
  websiteUrl: z.string().min(4),
  maxPages: z.number().int().min(3).max(20)
});

function normalizeUrl(raw: string) {
  const withProtocol = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : `https://${raw.trim()}`;
  return withProtocol;
}

export function AnalysisForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [maxPages, setMaxPages] = useState(8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiResult | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    const normalizedUrl = normalizeUrl(websiteUrl);
    const parsed = formSchema.safeParse({
      websiteUrl: normalizedUrl,
      maxPages
    });

    if (!parsed.success) {
      setError("Enter a valid website URL and try again.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(parsed.data)
      });

      const payload = (await response.json()) as ApiResult | { error?: string };
      if (!response.ok) {
        const errorMessage =
          typeof payload === "object" && payload && "error" in payload
            ? payload.error
            : undefined;
        setError(errorMessage ?? "Analysis failed. Please try again.");
        return;
      }

      setResult(payload as ApiResult);
    } catch {
      setError("Unable to reach the analysis API. Check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-[#253041] bg-[#121923] p-5 md:p-6">
      <h2 className="text-xl font-semibold text-[#e6edf3]">Analyze Keyword Cannibalization</h2>
      <p className="mt-2 text-sm text-[#8b9bb4]">
        Enter your website URL to scan internal pages for overlapping keyword targets.
      </p>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="website-url" className="mb-2 block text-sm font-medium text-[#d5deeb]">
            Website URL
          </label>
          <input
            id="website-url"
            type="url"
            inputMode="url"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
            className="w-full rounded-xl border border-[#314158] bg-[#0f1723] px-4 py-3 text-[#e6edf3] placeholder:text-[#667a99] outline-none transition focus:border-[#4cc9f0]"
            required
          />
        </div>

        <div>
          <label htmlFor="max-pages" className="mb-2 block text-sm font-medium text-[#d5deeb]">
            Pages to Crawl
          </label>
          <select
            id="max-pages"
            value={maxPages}
            onChange={(event) => setMaxPages(Number(event.target.value))}
            className="w-full rounded-xl border border-[#314158] bg-[#0f1723] px-4 py-3 text-[#e6edf3] outline-none transition focus:border-[#4cc9f0]"
          >
            <option value={6}>6 pages (quick)</option>
            <option value={8}>8 pages (recommended)</option>
            <option value={12}>12 pages (deep)</option>
            <option value={16}>16 pages (aggressive)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1f6feb] to-[#0ea5e9] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {isLoading ? "Scanning and analyzing..." : "Run Analysis"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {result ? <CannibalizedContent result={result} /> : null}
    </section>
  );
}
