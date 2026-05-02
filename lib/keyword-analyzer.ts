import OpenAI from "openai";
import { z } from "zod";
import type { ScrapedPage } from "@/lib/scraper";

export type CannibalizedPage = {
  url: string;
  title: string;
  overlapScore: number;
  primaryAngle: string;
};

export type CannibalizationCluster = {
  keyword: string;
  intent: string;
  risk: "low" | "medium" | "high";
  conflictScore: number;
  pages: CannibalizedPage[];
  recommendation: string;
  actionPlan: string[];
};

export type AnalysisResult = {
  summary: string;
  cannibalizationScore: number;
  totalPages: number;
  clusters: CannibalizationCluster[];
  quickWins: string[];
};

const stopWords = new Set([
  "about",
  "after",
  "also",
  "among",
  "and",
  "been",
  "before",
  "below",
  "between",
  "both",
  "can",
  "could",
  "each",
  "from",
  "have",
  "into",
  "just",
  "more",
  "most",
  "only",
  "other",
  "over",
  "same",
  "such",
  "than",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "those",
  "through",
  "under",
  "very",
  "what",
  "when",
  "where",
  "which",
  "while",
  "with",
  "your",
  "www",
  "http",
  "https"
]);

const clusterSchema = z.object({
  keyword: z.string().min(2),
  intent: z.string().min(2),
  risk: z.enum(["low", "medium", "high"]),
  conflictScore: z.number().min(0).max(100),
  pages: z
    .array(
      z.object({
        url: z.string().url(),
        title: z.string(),
        overlapScore: z.number().min(0).max(100),
        primaryAngle: z.string()
      })
    )
    .min(2),
  recommendation: z.string(),
  actionPlan: z.array(z.string()).min(1)
});

const aiResponseSchema = z.object({
  summary: z.string(),
  cannibalizationScore: z.number().min(0).max(100),
  clusters: z.array(clusterSchema),
  quickWins: z.array(z.string())
});

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !stopWords.has(token));
}

function keywordCounts(text: string) {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function scoreToRisk(score: number): "low" | "medium" | "high" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function deterministicAnalyze(pages: ScrapedPage[]): AnalysisResult {
  const keywordToPages = new Map<string, { page: ScrapedPage; count: number }[]>();

  for (const page of pages) {
    const content = [page.title, page.metaDescription, ...page.headings, page.text.slice(0, 9000)].join(" ");
    const counts = keywordCounts(content);

    for (const [keyword, count] of counts.entries()) {
      if (count < 3) continue;
      const list = keywordToPages.get(keyword) ?? [];
      list.push({ page, count });
      keywordToPages.set(keyword, list);
    }
  }

  const clusters: CannibalizationCluster[] = Array.from(keywordToPages.entries())
    .filter(([, entries]) => entries.length >= 2)
    .map(([keyword, entries]) => {
      const sorted = entries.sort((a, b) => b.count - a.count).slice(0, 4);
      const meanCount = sorted.reduce((acc, current) => acc + current.count, 0) / sorted.length;
      const conflictScore = Math.min(100, Math.round(sorted.length * 18 + meanCount * 7));

      const pagesForCluster: CannibalizedPage[] = sorted.map(({ page, count }) => ({
        url: page.url,
        title: page.title,
        overlapScore: Math.min(100, Math.round(count * 10)),
        primaryAngle: page.headings[0] ?? page.metaDescription.slice(0, 90) ?? "General overview"
      }));

      return {
        keyword,
        intent: "informational",
        risk: scoreToRisk(conflictScore),
        conflictScore,
        pages: pagesForCluster,
        recommendation:
          conflictScore >= 70
            ? "Merge overlapping pages into one pillar page and preserve unique sections with clear subheadings."
            : "Differentiate page intent by assigning one primary keyword and narrowing each page's angle.",
        actionPlan:
          conflictScore >= 70
            ? [
                `Select ${pagesForCluster[0].url} as canonical for \"${keyword}\".`,
                "301-redirect weaker pages or repurpose them for long-tail intent.",
                "Rewrite titles and H1s so each page owns a distinct query variant."
              ]
            : [
                "Map each page to a separate search intent.",
                "Update intros and headings to reduce topical overlap.",
                "Add internal links clarifying the intent split."
              ]
      } satisfies CannibalizationCluster;
    })
    .sort((a, b) => b.conflictScore - a.conflictScore)
    .slice(0, 8);

  const cannibalizationScore =
    clusters.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(clusters.reduce((acc, cluster) => acc + cluster.conflictScore, 0) / clusters.length)
        );

  const quickWins = clusters.slice(0, 3).map((cluster) => {
    const topUrl = cluster.pages[0]?.url;
    return `Fix \"${cluster.keyword}\" overlap first by keeping ${topUrl} as the primary page.`;
  });

  return {
    summary:
      clusters.length === 0
        ? "No critical cannibalization patterns were detected across the crawled pages."
        : `Detected ${clusters.length} overlapping keyword clusters likely diluting ranking signals.`,
    cannibalizationScore,
    totalPages: pages.length,
    clusters,
    quickWins
  };
}

async function aiAnalyze(pages: ScrapedPage[]) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const client = new OpenAI({ apiKey });

  const condensed = pages.map((page) => ({
    url: page.url,
    title: page.title,
    description: page.metaDescription,
    headings: page.headings.slice(0, 5),
    excerpt: page.text.slice(0, 1800)
  }));

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an SEO strategist. Detect keyword cannibalization and return only valid JSON. No markdown."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Analyze overlapping keyword targets and suggest concrete fixes.",
          outputRequirements: {
            summary: "string",
            cannibalizationScore: "number 0-100",
            clusters: [
              {
                keyword: "string",
                intent: "string",
                risk: "low|medium|high",
                conflictScore: "number 0-100",
                pages: [
                  {
                    url: "url",
                    title: "string",
                    overlapScore: "number 0-100",
                    primaryAngle: "string"
                  }
                ],
                recommendation: "string",
                actionPlan: ["string"]
              }
            ],
            quickWins: ["string"]
          },
          pages: condensed
        })
      }
    ]
  });

  const rawContent = completion.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "";

  if (!content) {
    return null;
  }

  const parsed = aiResponseSchema.safeParse(JSON.parse(content));
  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    totalPages: pages.length
  } satisfies AnalysisResult;
}

export async function analyzeKeywordCannibalization(pages: ScrapedPage[]): Promise<AnalysisResult> {
  if (pages.length === 0) {
    return {
      summary: "No crawlable pages were found. Try a different URL or include https:// in the address.",
      cannibalizationScore: 0,
      totalPages: 0,
      clusters: [],
      quickWins: []
    };
  }

  try {
    const ai = await aiAnalyze(pages);
    if (ai) {
      return ai;
    }
  } catch {
    // Fall through to deterministic analysis.
  }

  return deterministicAnalyze(pages);
}
