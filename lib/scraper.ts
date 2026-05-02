import * as cheerio from "cheerio";

export type ScrapedPage = {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  text: string;
  wordCount: number;
};

const DEFAULT_MAX_PAGES = 8;

function cleanText(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "ContentCannibalizationDetectorBot/1.0 (+https://content-cannibalization-detector.example)"
      },
      redirect: "follow",
      signal: controller.signal
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.status}`);
    }

    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractLinks($: cheerio.CheerioAPI, currentUrl: string, rootHost: string) {
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    try {
      const normalized = new URL(href, currentUrl);
      if (normalized.hostname !== rootHost) {
        return;
      }

      normalized.hash = "";
      links.add(normalized.toString());
    } catch {
      // Ignore malformed links.
    }
  });

  return Array.from(links);
}

function extractPageContent(html: string, url: string) {
  const $ = cheerio.load(html);

  $(
    "script, style, noscript, iframe, nav, footer, header, svg, canvas, form, [aria-hidden='true']"
  ).remove();

  const title = cleanText($("title").first().text()) || "Untitled";
  const metaDescription = cleanText($("meta[name='description']").attr("content") ?? "");

  const headings = Array.from(new Set($("h1, h2").map((_, el) => cleanText($(el).text())).get())).filter(
    Boolean
  );

  const priorityRoots = ["main", "article", "[role='main']", ".content", "#content"];
  let bodyText = "";

  for (const selector of priorityRoots) {
    const text = cleanText($(selector).first().text());
    if (text.length > bodyText.length) {
      bodyText = text;
    }
  }

  if (bodyText.length < 200) {
    bodyText = cleanText($("body").text());
  }

  const wordCount = bodyText.split(/\s+/).filter(Boolean).length;

  return {
    page: {
      url,
      title,
      metaDescription,
      headings,
      text: bodyText,
      wordCount
    } satisfies ScrapedPage,
    links: extractLinks($, url, new URL(url).hostname)
  };
}

function normalizeRootUrl(rawUrl: string) {
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(withProtocol);
  parsed.hash = "";
  return parsed.toString();
}

export async function scrapeWebsite(rootUrl: string, maxPages = DEFAULT_MAX_PAGES): Promise<ScrapedPage[]> {
  const startUrl = normalizeRootUrl(rootUrl);
  const rootHost = new URL(startUrl).hostname;
  const queue: string[] = [startUrl];
  const seen = new Set<string>();
  const pages: ScrapedPage[] = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift();
    if (!current || seen.has(current)) {
      continue;
    }

    seen.add(current);

    let html: string;
    try {
      html = await fetchHtml(current);
    } catch {
      continue;
    }

    const { page, links } = extractPageContent(html, current);
    if (page.wordCount >= 100) {
      pages.push(page);
    }

    for (const link of links) {
      if (queue.length + pages.length >= maxPages * 3) {
        break;
      }

      if (!seen.has(link) && new URL(link).hostname === rootHost) {
        queue.push(link);
      }
    }
  }

  return pages;
}
