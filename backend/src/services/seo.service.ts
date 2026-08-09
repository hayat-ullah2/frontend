// ────────────────────────────────────────────────────────────────────────────
// SEO service — briefs, AI suggestions and localized drafts.
//
// Every function works WITHOUT an AI provider via local heuristics, and layers
// on richer semantic output when a provider is configured. This keeps the
// platform free-first while remaining upgradeable.
// ────────────────────────────────────────────────────────────────────────────

import { analyzeSeo, type SeoInput } from "../utils/seo/engine.js";
import { COUNTRY_BY_CODE } from "../utils/seo/geo.js";
import {
  getAiProvider,
  isAiConfigured,
  parseAiJson,
} from "./ai/index.js";

export type ContentBrief = {
  source: "ai" | "heuristic";
  targetKeyword: string;
  searchIntent: string;
  targetCountry: string;
  suggestedTitles: string[];
  suggestedH2s: string[];
  suggestedH3s: string[];
  questionsToAnswer: string[];
  subtopics: string[];
  internalLinkOpportunities: string[];
  suggestedCta: string;
  contentGaps: string[];
};

export type AiSuggestion = { category: string; suggestion: string };

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase());

function countryName(code?: string): string {
  if (!code || code === "global") return "a global audience";
  return COUNTRY_BY_CODE[code]?.name ?? "a global audience";
}

// ── Content brief ───────────────────────────────────────────────────────────

export async function generateBrief(input: SeoInput): Promise<ContentBrief> {
  const keyword = (input.primaryKeyword ?? input.title ?? "").trim();
  const country = input.targetCountry ?? "global";
  const provider = getAiProvider();

  if (provider) {
    try {
      const prompt = `You are an SEO strategist. Produce a content brief as strict JSON for an article.
Primary keyword: "${keyword}"
Target country: ${countryName(country)}
Target language: ${input.targetLanguage ?? "English"}
Working title: "${input.title ?? ""}"

Return JSON with these keys (arrays of short strings unless noted):
{"searchIntent": string, "suggestedTitles": string[3], "suggestedH2s": string[6], "suggestedH3s": string[5], "questionsToAnswer": string[6], "subtopics": string[5], "internalLinkOpportunities": string[4], "suggestedCta": string, "contentGaps": string[4]}
Localize terminology, examples and spelling for the target country where genuinely useful. Do not invent brand names.`;
      const raw = await provider.chat(prompt, { json: true, maxTokens: 1400 });
      const parsed = parseAiJson<Partial<ContentBrief>>(raw);
      if (parsed && parsed.suggestedH2s?.length) {
        return {
          source: "ai",
          targetKeyword: keyword,
          searchIntent: parsed.searchIntent ?? "informational",
          targetCountry: country,
          suggestedTitles: parsed.suggestedTitles ?? [],
          suggestedH2s: parsed.suggestedH2s ?? [],
          suggestedH3s: parsed.suggestedH3s ?? [],
          questionsToAnswer: parsed.questionsToAnswer ?? [],
          subtopics: parsed.subtopics ?? [],
          internalLinkOpportunities: parsed.internalLinkOpportunities ?? [],
          suggestedCta: parsed.suggestedCta ?? "",
          contentGaps: parsed.contentGaps ?? [],
        };
      }
    } catch (err) {
      // Fall through to heuristic on any provider error.
      console.warn("[seo.service] AI brief failed, using heuristic:", (err as Error).message);
    }
  }

  return heuristicBrief(keyword, country, input);
}

function heuristicBrief(keyword: string, country: string, input: SeoInput): ContentBrief {
  const analysis = analyzeSeo(input);
  const kw = keyword || "your topic";
  const kwTitle = titleCase(kw);
  const place = country !== "global" ? ` in ${countryName(country)}` : "";
  const intent = analysis.intent?.suggested ?? "informational";

  return {
    source: "heuristic",
    targetKeyword: kw,
    searchIntent: intent,
    targetCountry: country,
    suggestedTitles: [
      `${kwTitle}: The Complete Guide${place}`,
      `Best ${kwTitle}${place} (${new Date().getFullYear()})`,
      `${kwTitle} Explained — What You Need to Know`,
    ],
    suggestedH2s: [
      `What is ${kw}?`,
      `Why ${kw} matters${place}`,
      `How to choose the right ${kw}`,
      `${kwTitle}: key options compared`,
      `Common mistakes to avoid`,
      `Frequently asked questions`,
    ],
    suggestedH3s: [
      `Key features to look for`,
      `Pricing and value${place}`,
      `Pros and cons`,
      `Step-by-step walkthrough`,
      `Real-world examples`,
    ],
    questionsToAnswer: [
      `What is ${kw} and how does it work?`,
      `How much does ${kw} cost${place}?`,
      `What are the best ${kw} options?`,
      `Is ${kw} worth it?`,
      `How do I get started with ${kw}?`,
      `What are the alternatives to ${kw}?`,
    ],
    subtopics: [
      `Benefits of ${kw}`,
      `Comparison of top choices`,
      `Buyer's checklist`,
      `Setup / getting started`,
      `Expert tips`,
    ],
    internalLinkOpportunities: [
      `Link to your category hub for ${kw}`,
      `Link to a related comparison article`,
      `Link to a beginner's guide`,
      `Link to a relevant case study or review`,
    ],
    suggestedCta:
      intent === "transactional" || intent === "commercial"
        ? `Compare the top ${kw} options and pick the best fit for your needs.`
        : `Subscribe for more practical guides on ${kw}.`,
    contentGaps: analysis.issues
      .filter((i) => i.severity !== "good")
      .slice(0, 4)
      .map((i) => i.message),
  };
}

// ── AI suggestions ──────────────────────────────────────────────────────────

export async function generateSuggestions(input: SeoInput): Promise<{
  source: "ai" | "heuristic";
  suggestions: AiSuggestion[];
}> {
  const provider = getAiProvider();
  if (provider) {
    try {
      const prompt = `You are an expert SEO editor. Review this draft and return STRICT JSON:
{"suggestions": [{"category": string, "suggestion": string}, ...]}  (5-8 actionable items)
Focus on: search intent match, missing subtopics, title & meta quality, heading structure, semantic relevance, ${input.targetCountry && input.targetCountry !== "global" ? `relevance for ${countryName(input.targetCountry)}, ` : ""}and any keyword stuffing. Be specific and concrete. Do not restate obvious length rules.

Primary keyword: "${input.primaryKeyword ?? ""}"
Title: "${input.title ?? ""}"
Meta description: "${input.metaDescription ?? input.excerpt ?? ""}"
Content (HTML, truncated):
${(input.content ?? "").slice(0, 6000)}`;
      const raw = await provider.chat(prompt, { json: true, maxTokens: 1200 });
      const parsed = parseAiJson<{ suggestions?: AiSuggestion[] }>(raw);
      if (parsed?.suggestions?.length) {
        return { source: "ai", suggestions: parsed.suggestions.slice(0, 10) };
      }
    } catch (err) {
      console.warn("[seo.service] AI suggestions failed, using heuristic:", (err as Error).message);
    }
  }
  return { source: "heuristic", suggestions: heuristicSuggestions(input) };
}

function heuristicSuggestions(input: SeoInput): AiSuggestion[] {
  const a = analyzeSeo(input);
  const out: AiSuggestion[] = a.issues
    .filter((i) => i.severity !== "good")
    .slice(0, 6)
    .map((i) => ({ category: i.category, suggestion: i.message }));

  if (a.intent) {
    out.push({
      category: "intent",
      suggestion: `The content reads as ${a.intent.suggested} intent (${a.intent.confidence}% confidence). Make sure that matches what searchers want.`,
    });
  }
  a.localization
    .filter((l) => l.severity === "warning")
    .slice(0, 2)
    .forEach((l) => out.push({ category: "localization", suggestion: l.message }));
  return out;
}

// ── Localized draft (local transform, free) ─────────────────────────────────

import { US_TO_UK_SPELLING } from "../utils/seo/geo.js";

export type LocalizedDraft = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  targetCountries: string[];
  targetLanguage?: string;
  seo: { title?: string; description?: string; canonical?: string };
  notes: string[];
};

/**
 * Produce a localized variant of a post for a single country. This is a
 * deterministic, cost-free transform: it adapts the title, spelling and
 * metadata, and returns notes explaining what a human should still review.
 * It never mass-generates identical doorway pages.
 */
export function buildLocalizedDraft(
  post: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    seo?: { title?: string | null; description?: string | null };
    targetLanguage?: string;
  },
  countryCode: string,
  siteUrl?: string,
): LocalizedDraft {
  const country = COUNTRY_BY_CODE[countryCode];
  if (!country || countryCode === "global") {
    throw new Error("A specific target country is required for a localized draft.");
  }

  const suffix = ` in ${country.name}`;
  const localizedTitle = post.title.replace(/\s*$/, "") + suffix;
  const seg = country.urlSegment ?? countryCode;
  const localizedSlug = `${seg}-${post.slug}`.slice(0, 90);

  // Spelling adaptation only for non-US English variants.
  let content = post.content;
  const notes: string[] = [];
  if (country.englishVariant && country.englishVariant !== "us") {
    let swaps = 0;
    for (const [us, uk] of Object.entries(US_TO_UK_SPELLING)) {
      const re = new RegExp(`\\b${us}\\b`, "g");
      content = content.replace(re, (m) => {
        swaps++;
        return matchCase(m, uk);
      });
    }
    if (swaps > 0) notes.push(`Adapted ${swaps} US spelling(s) to ${country.name} English.`);
  }

  notes.push(
    `Review currency (${country.currency}), measurements (${country.measurement}) and local examples/regulations before publishing.`,
    `Set hreflang "${country.hreflang}" — this variant links back to the original to avoid duplicate content.`,
    `Only keep this variant if it adds genuine country-specific value.`,
  );

  const canonical = siteUrl ? `${siteUrl.replace(/\/$/, "")}/blog/${localizedSlug}` : undefined;

  return {
    title: localizedTitle,
    slug: localizedSlug,
    content,
    excerpt: post.excerpt,
    targetCountries: [countryCode],
    targetLanguage: country.hreflang,
    seo: {
      title: (post.seo?.title || post.title) + suffix,
      description: post.seo?.description ?? undefined,
      canonical,
    },
    notes,
  };
}

function matchCase(source: string, replacement: string): string {
  if (source[0] === source[0]?.toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}
