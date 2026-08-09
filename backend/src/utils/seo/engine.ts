// ⚠ MIRROR of frontend/src/lib/seo/engine.ts — keep the two in sync so the
//   browser's live score and the server's authoritative score always match.
// ────────────────────────────────────────────────────────────────────────────
// SEO Scoring Engine — transparent, deterministic, zero-dependency.
//
// Runs identically in the browser (live analysis in the admin) and on the server
// (authoritative score computed before publish). NO framework imports so it can
// be mirrored 1:1 into the Express backend.
//
// Philosophy: the score reflects *observable* on-page SEO fundamentals — never a
// promise of ranking. Keyword checks reward natural placement and actively
// penalise stuffing. Length limits are presented as guidance, not hard rules.
// ────────────────────────────────────────────────────────────────────────────

import {
  COUNTRY_BY_CODE,
  US_TERMINOLOGY,
  US_TO_UK_SPELLING,
  UK_TERMINOLOGY,
  type SearchIntent,
} from "./geo.js";

export type Severity = "error" | "warning" | "good";

export type SeoCategoryKey =
  | "keyword"
  | "structure"
  | "metadata"
  | "readability"
  | "links"
  | "images";

export const CATEGORY_LABELS: Record<SeoCategoryKey, string> = {
  keyword: "Keyword optimization",
  structure: "Content structure",
  metadata: "Metadata",
  readability: "Readability",
  links: "Internal links",
  images: "Images",
};

export const CATEGORY_MAX: Record<SeoCategoryKey, number> = {
  keyword: 25,
  structure: 20,
  metadata: 20,
  readability: 15,
  links: 10,
  images: 10,
};

export type SeoIssue = {
  id: string;
  severity: Severity;
  category: SeoCategoryKey;
  message: string;
};

export type ContentMetrics = {
  words: number;
  readingTimeMin: number;
  sentences: number;
  avgSentenceLength: number;
  paragraphs: number;
  avgParagraphWords: number;
  longParagraphs: number; // > 150 words
  longSentences: number; // > 30 words
  headings: { h1: number; h2: number; h3: number; total: number };
  internalLinks: number;
  externalLinks: number;
  images: number;
  imagesMissingAlt: number;
  fleschReadingEase: number;
};

export type KeywordStatus = {
  keyword: string;
  count: number;
  density: number; // percent
  status: "missing" | "underused" | "good" | "overused";
  inTitle: boolean;
  inFirstParagraph: boolean;
  inHeadings: boolean;
  inMetaDescription: boolean;
  inSlug: boolean;
};

export type SerpPreview = {
  title: string;
  titleLength: number;
  description: string;
  descriptionLength: number;
  url: string;
};

export type LocalizationHint = {
  severity: Severity;
  message: string;
};

export type SeoRating = "excellent" | "good" | "needs-improvement" | "poor";

export type SeoAnalysis = {
  score: number; // 0-100
  rating: SeoRating;
  categories: Record<SeoCategoryKey, { score: number; max: number; percent: number }>;
  issues: SeoIssue[];
  metrics: ContentMetrics;
  primary: KeywordStatus | null;
  secondary: KeywordStatus[];
  serp: SerpPreview;
  localization: LocalizationHint[];
  intent: { suggested: SearchIntent; confidence: number } | null;
  analyzedAt: string;
};

export type SeoInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string; // HTML
  metaTitle?: string;
  metaDescription?: string;
  canonical?: string;
  ogImage?: string;
  cover?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetCountry?: string; // country code
  targetLanguage?: string;
  /** Optional site host so link analysis can tell internal from external. */
  siteHost?: string;
};

// ── HTML / text helpers (regex-based; portable, no DOM) ─────────────────────

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

type Heading = { level: number; text: string };

function extractHeadings(html: string): Heading[] {
  const out: Heading[] = [];
  const re = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    out.push({ level: Number(m[1]), text: stripHtml(m[2]) });
  }
  return out;
}

type LinkInfo = { href: string; text: string; external: boolean };

function extractLinks(html: string, siteHost?: string): LinkInfo[] {
  const out: LinkInfo[] = [];
  const re = /<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const href = m[1].trim();
    const text = stripHtml(m[2]);
    let external = false;
    if (/^https?:\/\//i.test(href)) {
      external = true;
      if (siteHost) {
        try {
          const u = new URL(href);
          if (u.host.replace(/^www\./, "") === siteHost.replace(/^www\./, "")) {
            external = false;
          }
        } catch {
          /* keep external */
        }
      }
    } else if (/^(mailto:|tel:)/i.test(href)) {
      external = true;
    }
    // Relative ("/", "./", "#", "blog/...") counts as internal.
    out.push({ href, text, external });
  }
  return out;
}

type ImageInfo = { src: string; alt: string };

function extractImages(html: string): ImageInfo[] {
  const out: ImageInfo[] = [];
  const re = /<img\s[^>]*>/gi;
  const imgs = html.match(re) ?? [];
  for (const img of imgs) {
    const src = img.match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    const alt = img.match(/\balt\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
    out.push({ src, alt: alt.trim() });
  }
  return out;
}

function extractParagraphs(html: string): string[] {
  const matches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) =>
    stripHtml(m[1]),
  );
  if (matches.length > 0) return matches.filter((p) => p.length > 0);
  // Fall back to blank-line separated blocks (plain-text content).
  const text = stripHtml(html);
  return text.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    .match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

function fleschReadingEase(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = splitSentences(text);
  if (words.length === 0 || sentences.length === 0) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const score =
    206.835 -
    1.015 * (words.length / sentences.length) -
    84.6 * (syllables / words.length);
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Case-insensitive count of a phrase, tolerant of extra whitespace. */
function countPhrase(haystack: string, phrase: string): number {
  const p = phrase.trim().toLowerCase();
  if (!p) return 0;
  const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\s+/g, "\\s+");
  const re = new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, "giu");
  let count = 0;
  while (re.exec(haystack)) count++;
  return count;
}

function includesPhrase(haystack: string, phrase: string): boolean {
  return countPhrase(haystack, phrase) > 0;
}

// ── Keyword analysis ────────────────────────────────────────────────────────

function analyzeKeyword(
  keyword: string,
  ctx: {
    bodyText: string;
    totalWords: number;
    effectiveTitle: string;
    firstParagraph: string;
    headingText: string;
    metaDescription: string;
    slug: string;
  },
  isPrimary: boolean,
): KeywordStatus {
  const count = countPhrase(ctx.bodyText, keyword);
  const kwWords = countWords(keyword) || 1;
  // Density = (occurrences × keyword length in words) / total words.
  const density =
    ctx.totalWords > 0
      ? Number((((count * kwWords) / ctx.totalWords) * 100).toFixed(2))
      : 0;

  let status: KeywordStatus["status"];
  if (count === 0) status = "missing";
  else if (density > 3.0) status = "overused";
  else if (density < 0.3 && isPrimary) status = "underused";
  else status = "good";

  return {
    keyword,
    count,
    density,
    status,
    inTitle: includesPhrase(ctx.effectiveTitle, keyword),
    inFirstParagraph: includesPhrase(ctx.firstParagraph, keyword),
    inHeadings: includesPhrase(ctx.headingText, keyword),
    inMetaDescription: includesPhrase(ctx.metaDescription, keyword),
    inSlug: keyword
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every((w) => ctx.slug.includes(w)),
  };
}

// ── Search-intent heuristic ─────────────────────────────────────────────────

function guessIntent(text: string): { suggested: SearchIntent; confidence: number } {
  const t = text.toLowerCase();
  const buckets: Record<SearchIntent, string[]> = {
    transactional: ["buy", "price", "pricing", "cheap", "deal", "coupon", "discount", "order", "shop", "subscribe", "free trial"],
    commercial: ["best", "top", "review", "reviews", "vs", "versus", "compare", "comparison", "alternative", "alternatives"],
    informational: ["how to", "what is", "guide", "tutorial", "learn", "why", "examples", "tips", "explained"],
    navigational: ["login", "sign in", "download", "official", "homepage", "contact"],
  };
  const scores = Object.entries(buckets).map(([intent, words]) => {
    const hits = words.reduce((s, w) => s + (t.includes(w) ? 1 : 0), 0);
    return { intent: intent as SearchIntent, hits };
  });
  scores.sort((a, b) => b.hits - a.hits);
  const top = scores[0];
  const totalHits = scores.reduce((s, x) => s + x.hits, 0);
  if (top.hits === 0) return { suggested: "informational", confidence: 40 };
  const confidence = Math.min(95, 45 + Math.round((top.hits / Math.max(1, totalHits)) * 50));
  return { suggested: top.intent, confidence };
}

// ── Localization checks ─────────────────────────────────────────────────────

function checkLocalization(text: string, countryCode?: string): LocalizationHint[] {
  const hints: LocalizationHint[] = [];
  if (!countryCode || countryCode === "global") return hints;
  const country = COUNTRY_BY_CODE[countryCode];
  if (!country?.englishVariant) return hints;
  const t = ` ${text.toLowerCase()} `;

  if (country.englishVariant === "us") {
    // Target is US → flag Commonwealth spellings.
    const flagged = Object.entries(US_TO_UK_SPELLING)
      .filter(([, uk]) => t.includes(` ${uk} `))
      .slice(0, 4)
      .map(([us, uk]) => `“${uk}” → “${us}”`);
    if (flagged.length) {
      hints.push({
        severity: "warning",
        message: `US target: consider US spelling — ${flagged.join(", ")}.`,
      });
    }
    const ukTerms = UK_TERMINOLOGY.filter((w) => t.includes(` ${w} `)).slice(0, 3);
    if (ukTerms.length) {
      hints.push({
        severity: "warning",
        message: `UK-centric terms found for a US audience: ${ukTerms.join(", ")}.`,
      });
    }
  } else {
    // Target is UK/CA/AU/etc → flag US spellings.
    const flagged = Object.entries(US_TO_UK_SPELLING)
      .filter(([us]) => t.includes(` ${us} `))
      .slice(0, 4)
      .map(([us, uk]) => `“${us}” → “${uk}”`);
    if (flagged.length) {
      hints.push({
        severity: "warning",
        message: `${country.name} target: consider local spelling — ${flagged.join(", ")}.`,
      });
    }
    const usTerms = US_TERMINOLOGY.filter((w) => t.includes(` ${w} `)).slice(0, 3);
    if (usTerms.length) {
      hints.push({
        severity: "warning",
        message: `US-centric terms found for a ${country.name} audience: ${usTerms.join(", ")}.`,
      });
    }
  }

  if (hints.length === 0) {
    hints.push({
      severity: "good",
      message: `No obvious spelling/terminology mismatches for ${country.name}.`,
    });
  }
  return hints;
}

// ── Scoring accumulator ─────────────────────────────────────────────────────

class Scorer {
  private cat: Record<SeoCategoryKey, number> = {
    keyword: 0,
    structure: 0,
    metadata: 0,
    readability: 0,
    links: 0,
    images: 0,
  };
  issues: SeoIssue[] = [];

  add(category: SeoCategoryKey, points: number) {
    this.cat[category] = Math.min(
      CATEGORY_MAX[category],
      Math.max(0, this.cat[category] + points),
    );
  }

  issue(id: string, severity: Severity, category: SeoCategoryKey, message: string) {
    this.issues.push({ id, severity, category, message });
  }

  categories() {
    const out = {} as SeoAnalysis["categories"];
    (Object.keys(CATEGORY_MAX) as SeoCategoryKey[]).forEach((k) => {
      const max = CATEGORY_MAX[k];
      const score = Math.round(this.cat[k]);
      out[k] = { score, max, percent: Math.round((score / max) * 100) };
    });
    return out;
  }

  total() {
    return Math.round(
      (Object.keys(this.cat) as SeoCategoryKey[]).reduce(
        (s, k) => s + this.cat[k],
        0,
      ),
    );
  }
}

export function ratingFor(score: number): SeoRating {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "needs-improvement";
  return "poor";
}

// ── Main entry point ────────────────────────────────────────────────────────

export function analyzeSeo(input: SeoInput): SeoAnalysis {
  const s = new Scorer();

  const title = (input.title ?? "").trim();
  const metaTitle = (input.metaTitle ?? "").trim();
  const metaDescription = (input.metaDescription ?? input.excerpt ?? "").trim();
  const slug = (input.slug ?? "").trim().toLowerCase();
  const content = input.content ?? "";
  const effectiveTitle = metaTitle || title;

  const bodyText = stripHtml(content);
  const totalWords = countWords(bodyText);
  const headings = extractHeadings(content);
  const headingText = headings.map((h) => h.text).join(" ");
  const paragraphs = extractParagraphs(content);
  const firstParagraph = paragraphs[0] ?? bodyText.split(/\s+/).slice(0, 150).join(" ");
  const links = extractLinks(content, input.siteHost);
  const images = extractImages(content);
  const sentences = splitSentences(bodyText);

  const h1 = headings.filter((h) => h.level === 1);
  const h2 = headings.filter((h) => h.level === 2);
  const h3 = headings.filter((h) => h.level === 3);
  const internalLinks = links.filter((l) => !l.external);
  const externalLinks = links.filter((l) => l.external);
  const imagesMissingAlt = images.filter((i) => !i.alt).length;
  const featuredImage = (input.cover ?? "").trim() || (input.ogImage ?? "").trim();

  const paragraphWordCounts = paragraphs.map((p) => countWords(p));
  const longParagraphs = paragraphWordCounts.filter((w) => w > 150).length;
  const sentenceWordCounts = sentences.map((x) => countWords(x));
  const longSentences = sentenceWordCounts.filter((w) => w > 30).length;
  const avgSentenceLength = sentences.length
    ? Math.round(totalWords / sentences.length)
    : 0;
  const avgParagraphWords = paragraphs.length
    ? Math.round(totalWords / paragraphs.length)
    : 0;
  const flesch = fleschReadingEase(bodyText);

  const metrics: ContentMetrics = {
    words: totalWords,
    readingTimeMin: Math.max(1, Math.round(totalWords / 220)),
    sentences: sentences.length,
    avgSentenceLength,
    paragraphs: paragraphs.length,
    avgParagraphWords,
    longParagraphs,
    longSentences,
    headings: { h1: h1.length, h2: h2.length, h3: h3.length, total: headings.length },
    internalLinks: internalLinks.length,
    externalLinks: externalLinks.length,
    images: images.length,
    imagesMissingAlt,
    fleschReadingEase: flesch,
  };

  const kwCtx = {
    bodyText,
    totalWords,
    effectiveTitle,
    firstParagraph,
    headingText,
    metaDescription,
    slug,
  };

  // ── 1. KEYWORD OPTIMIZATION (25) ──────────────────────────────────────────
  const primaryKw = (input.primaryKeyword ?? "").trim();
  let primary: KeywordStatus | null = null;
  if (!primaryKw) {
    s.issue("kw-missing", "error", "keyword", "No primary keyword set — add one to focus the article.");
  } else {
    primary = analyzeKeyword(primaryKw, kwCtx, true);
    if (primary.count === 0) {
      s.issue("kw-not-in-body", "error", "keyword", `Primary keyword “${primaryKw}” never appears in the content.`);
    } else {
      if (primary.inTitle) { s.add("keyword", 5); s.issue("kw-title", "good", "keyword", "Primary keyword appears in the title."); }
      else s.issue("kw-title-missing", "warning", "keyword", "Primary keyword is not in the title — titles carry strong weight.");

      if (primary.inFirstParagraph) { s.add("keyword", 5); s.issue("kw-intro", "good", "keyword", "Primary keyword appears in the first paragraph."); }
      else s.issue("kw-intro-missing", "warning", "keyword", "Primary keyword does not appear near the beginning of the content.");

      if (primary.inHeadings) { s.add("keyword", 4); s.issue("kw-heading", "good", "keyword", "Primary keyword appears in a heading."); }
      else s.issue("kw-heading-missing", "warning", "keyword", "Add the primary keyword to at least one H2 where it reads naturally.");

      if (primary.inSlug) { s.add("keyword", 3); }
      else s.issue("kw-slug-missing", "warning", "keyword", "Primary keyword is not in the URL slug.");

      if (primary.inMetaDescription) { s.add("keyword", 4); }
      else s.issue("kw-meta-missing", "warning", "keyword", "Primary keyword is not in the meta description.");

      // Density band: reward natural usage, penalise stuffing.
      if (primary.status === "overused") {
        s.issue("kw-stuffing", "error", "keyword", `Keyword density is ${primary.density}% — this looks like keyword stuffing. Aim for natural usage.`);
      } else if (primary.status === "underused") {
        s.add("keyword", 2);
        s.issue("kw-underused", "warning", "keyword", `Primary keyword is used sparingly (${primary.density}%). Weave it in a few more times where natural.`);
      } else {
        s.add("keyword", 4);
        s.issue("kw-density", "good", "keyword", `Keyword density is ${primary.density}% — a natural range.`);
      }
    }
  }

  const secondary: KeywordStatus[] = (input.secondaryKeywords ?? [])
    .map((k) => k.trim())
    .filter(Boolean)
    .map((k) => analyzeKeyword(k, kwCtx, false));
  if (secondary.length > 0) {
    const used = secondary.filter((k) => k.count > 0).length;
    if (used > 0) s.add("keyword", Math.min(3, used));
    const overused = secondary.filter((k) => k.status === "overused");
    if (overused.length) {
      s.issue("skw-overused", "warning", "keyword", `Secondary keyword(s) overused: ${overused.map((k) => `“${k.keyword}”`).join(", ")}.`);
    }
  }

  // ── 2. CONTENT STRUCTURE (20) ─────────────────────────────────────────────
  // The rendered page uses the post title as the H1, so a title implies an H1.
  if (title) {
    s.add("structure", 3);
    s.issue("h1-ok", "good", "structure", "Page has a single H1 (the post title).");
  } else {
    s.issue("h1-missing", "error", "structure", "No title — the page has no H1.");
  }
  if (h1.length >= 1) {
    s.issue("h1-dup", "warning", "structure", "Content contains its own <h1>. The title is already the H1 — use H2/H3 in the body.");
    s.add("structure", -2);
  }

  if (h2.length >= 1) {
    s.add("structure", 5);
    s.issue("h2-ok", "good", "structure", `${h2.length} H2 section${h2.length === 1 ? "" : "s"} structure the article.`);
  } else {
    s.issue("h2-missing", "warning", "structure", "No H2 headings — break the article into scannable sections.");
  }

  // Heading hierarchy: an H3 should follow an H2.
  let hierarchyOk = true;
  let seenH2 = false;
  for (const h of headings) {
    if (h.level === 2) seenH2 = true;
    if (h.level === 3 && !seenH2) hierarchyOk = false;
  }
  if (headings.length > 0 && hierarchyOk) s.add("structure", 3);
  else if (!hierarchyOk) s.issue("hierarchy", "warning", "structure", "Heading hierarchy skips levels (an H3 appears before any H2).");

  // Content depth (guidance, not a fake minimum).
  if (totalWords >= 600) s.add("structure", 4);
  else if (totalWords >= 300) s.add("structure", 2);
  if (totalWords > 0 && totalWords < 300) {
    s.issue("short-content", "warning", "structure", `Content is very short (${totalWords} words). Make sure it fully satisfies the search intent.`);
  }
  if (totalWords === 0) {
    s.issue("no-content", "error", "structure", "There is no content yet.");
  }

  // Intro & conclusion.
  if (firstParagraph && countWords(firstParagraph) >= 20) {
    s.add("structure", 2);
  } else if (totalWords > 0) {
    s.issue("no-intro", "warning", "structure", "The introduction is thin — open with a clear paragraph that frames the topic.");
  }
  const hasConclusion =
    /\b(conclusion|summary|final thoughts|wrapping up|to sum up|takeaway)\b/i.test(headingText) ||
    (paragraphs.length >= 3);
  if (hasConclusion) s.add("structure", 1);
  else if (totalWords > 300) s.issue("no-conclusion", "warning", "structure", "Consider adding a conclusion or summary to close the article.");

  // Paragraph length.
  if (longParagraphs === 0 && paragraphs.length > 0) s.add("structure", 2);
  else if (longParagraphs > 0) s.issue("long-paras", "warning", "structure", `${longParagraphs} paragraph(s) exceed 150 words — split them for readability.`);

  // ── 3. METADATA (20) ──────────────────────────────────────────────────────
  const titleForSerp = effectiveTitle;
  if (titleForSerp) {
    if (titleForSerp.length < 15) s.issue("title-short", "warning", "metadata", `Meta title is short (${titleForSerp.length} chars). Aim for ~50–60.`);
    else if (titleForSerp.length > 60) s.issue("title-long", "warning", "metadata", `Meta title is ${titleForSerp.length} chars — Google typically truncates around 60.`);
    else { s.add("metadata", 5); s.issue("title-ok", "good", "metadata", "Meta title length is in the ideal range."); }
    if (titleForSerp.length >= 15 && titleForSerp.length <= 60) { /* already added */ }
    else s.add("metadata", 3);
  } else {
    s.issue("title-missing-meta", "error", "metadata", "No title/meta title set.");
  }

  if (metaDescription) {
    if (metaDescription.length < 50) s.issue("desc-short", "warning", "metadata", `Meta description is short (${metaDescription.length} chars). Aim for ~120–160.`);
    else if (metaDescription.length > 160) s.issue("desc-long", "warning", "metadata", `Meta description is ${metaDescription.length} chars — Google typically truncates around 160.`);
    else { s.add("metadata", 6); s.issue("desc-ok", "good", "metadata", "Meta description length is in the ideal range."); }
    if (!(metaDescription.length >= 50 && metaDescription.length <= 160)) s.add("metadata", 3);
  } else {
    s.issue("desc-missing", "error", "metadata", "Meta description is missing — Google shows one in search results.");
  }

  if (slug) {
    if (slug.length > 75) s.issue("slug-long", "warning", "metadata", `Slug is long (${slug.length} chars). Keep URLs short and descriptive.`);
    else s.add("metadata", 3);
    if (/[^a-z0-9-]/.test(slug)) s.issue("slug-chars", "warning", "metadata", "Slug contains non-URL-safe characters.");
  } else {
    s.issue("slug-missing", "error", "metadata", "No slug — the post has no URL.");
  }

  if ((input.canonical ?? "").trim()) {
    if (isValidUrl(input.canonical!.trim())) s.add("metadata", 2);
    else s.issue("canonical-invalid", "warning", "metadata", "Canonical URL is not a valid absolute URL.");
  } else {
    s.add("metadata", 1); // a canonical is auto-derived from the slug
    s.issue("canonical-auto", "good", "metadata", "Canonical URL will default to the post URL.");
  }

  if (featuredImage) s.add("metadata", 2);
  else s.issue("og-missing", "warning", "metadata", "No featured/OG image — social shares fall back to a generic card.");

  // ── 4. READABILITY (15) ───────────────────────────────────────────────────
  if (totalWords > 0) {
    // Flesch → up to 9 points (60+ is "plain English").
    const fleschPoints = Math.round((Math.min(100, flesch) / 100) * 9);
    s.add("readability", fleschPoints);
    if (flesch >= 60) s.issue("flesch-ok", "good", "readability", `Reading ease is ${flesch} — comfortable for a general audience.`);
    else if (flesch < 40) s.issue("flesch-hard", "warning", "readability", `Reading ease is ${flesch} — the writing is dense. Shorten sentences and simplify wording.`);

    if (avgSentenceLength > 0 && avgSentenceLength <= 20) s.add("readability", 3);
    else if (avgSentenceLength > 25) s.issue("long-avg-sentence", "warning", "readability", `Average sentence length is ${avgSentenceLength} words — aim for under 20.`);

    if (longSentences === 0) s.add("readability", 3);
    else s.issue("long-sentences", "warning", "readability", `${longSentences} sentence(s) exceed 30 words — break them up.`);
  }

  // ── 5. INTERNAL / EXTERNAL LINKS (10) ─────────────────────────────────────
  if (internalLinks.length >= 3) { s.add("links", 6); s.issue("internal-ok", "good", "links", `${internalLinks.length} internal links help users and crawlers navigate.`); }
  else if (internalLinks.length >= 1) { s.add("links", 3); s.issue("internal-few", "warning", "links", `Only ${internalLinks.length} internal link(s). Add a couple more to related articles.`); }
  else s.issue("internal-missing", "warning", "links", "No internal links — link to related articles on your site.");

  if (externalLinks.length >= 1) { s.add("links", 4); s.issue("external-ok", "good", "links", "Links to external references add credibility."); }
  else if (totalWords > 400) s.issue("external-missing", "warning", "links", "No external references — cite authoritative sources where relevant.");

  // ── 6. IMAGES (10) ────────────────────────────────────────────────────────
  if (featuredImage) { s.add("images", 5); s.issue("cover-ok", "good", "images", "Featured image is set."); }
  else s.issue("cover-missing", "warning", "images", "No featured image.");

  if (images.length >= 1) {
    s.add("images", 2);
    if (imagesMissingAlt === 0) { s.add("images", 3); s.issue("alt-ok", "good", "images", "All in-content images have alt text."); }
    else s.issue("alt-missing", "error", "images", `${imagesMissingAlt} in-content image(s) missing alt text — required for SEO & accessibility.`);
  } else if (totalWords > 500) {
    s.issue("no-images", "warning", "images", "No in-content images — visuals improve engagement and dwell time.");
  } else {
    s.add("images", 2);
  }

  // ── Localization + intent ─────────────────────────────────────────────────
  const localization = checkLocalization(bodyText, input.targetCountry);
  const intent = totalWords > 0 || title ? guessIntent(`${title} ${primaryKw} ${bodyText}`) : null;

  const serp: SerpPreview = {
    title: titleForSerp || "Untitled",
    titleLength: titleForSerp.length,
    description: metaDescription || "No description set.",
    descriptionLength: metaDescription.length,
    url: buildSerpUrl(input.siteHost, input.targetCountry, slug),
  };

  const score = s.total();
  return {
    score,
    rating: ratingFor(score),
    categories: s.categories(),
    issues: sortIssues(s.issues),
    metrics,
    primary,
    secondary,
    serp,
    localization,
    intent,
    analyzedAt: new Date().toISOString(),
  };
}

function sortIssues(issues: SeoIssue[]): SeoIssue[] {
  const order: Record<Severity, number> = { error: 0, warning: 1, good: 2 };
  return [...issues].sort((a, b) => order[a.severity] - order[b.severity]);
}

function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function buildSerpUrl(siteHost: string | undefined, countryCode: string | undefined, slug: string): string {
  const host = siteHost || "example.com";
  const seg = countryCode && countryCode !== "global" ? COUNTRY_BY_CODE[countryCode]?.urlSegment : null;
  const path = ["blog", slug || "your-post-slug"];
  if (seg) path.unshift(seg);
  return `https://${host}/${path.join("/")}`;
}

/** Convenience: the list of issues that must block publishing. */
export function blockingIssues(analysis: SeoAnalysis): SeoIssue[] {
  return analysis.issues.filter((i) => i.severity === "error");
}
