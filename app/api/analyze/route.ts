import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeKeywordCannibalization } from "@/lib/keyword-analyzer";
import { saveAnalysisSnapshot } from "@/lib/database";
import { scrapeWebsite } from "@/lib/scraper";

export const runtime = "nodejs";

const bodySchema = z.object({
  websiteUrl: z.string().min(3),
  maxPages: z.number().int().min(3).max(20).optional()
});

export async function POST(request: Request) {
  const accessCookie = request.headers.get("cookie")?.includes("ccd_access=granted");
  if (!accessCookie) {
    return NextResponse.json(
      {
        error: "Paid access is required. Purchase a plan and claim access on the dashboard."
      },
      { status: 403 }
    );
  }

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  try {
    const pages = await scrapeWebsite(payload.websiteUrl, payload.maxPages ?? 8);
    const analysis = await analyzeKeywordCannibalization(pages);

    const domain = (() => {
      try {
        return new URL(payload.websiteUrl.startsWith("http") ? payload.websiteUrl : `https://${payload.websiteUrl}`)
          .hostname;
      } catch {
        return payload.websiteUrl;
      }
    })();

    await saveAnalysisSnapshot({
      domain,
      scannedAt: new Date().toISOString(),
      pagesScanned: pages.length,
      cannibalizationScore: analysis.cannibalizationScore
    });

    return NextResponse.json({
      ...analysis,
      pages
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze site.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
