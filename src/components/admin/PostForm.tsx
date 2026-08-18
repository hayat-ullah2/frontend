"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import SeoPanel from "@/components/admin/SeoPanel";
import { ApiError } from "@/lib/api";
import type { ApiAffiliateLink, ApiCategory, ApiPost, ApiTag } from "@/lib/models";
import { analyzeSeoRemote, createPost, updatePost, type PostInput } from "@/lib/posts";
import { uploadImage } from "@/lib/uploads";
import { analyzeSeo, type SeoAnalysis } from "@/lib/seo/engine";
import {
  SEARCH_INTENTS,
  TARGET_COUNTRIES,
  TARGET_LANGUAGES,
  type SearchIntent,
} from "@/lib/seo/geo";
import { SITE_URL } from "@/lib/site";
import { ArrowLeft, Check, Tag as TagIcon } from "@/components/Icon";

/** Lightweight shape of published posts used for internal-link suggestions. */
export type LinkablePost = {
  title: string;
  slug: string;
  categorySlug?: string;
  tagSlugs?: string[];
};

const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return undefined;
  }
})();

export default function PostForm({
  categories,
  tags: tagOptions,
  initial,
  publishedPosts = [],
  affiliateOptions = [],
}: {
  categories: ApiCategory[];
  tags: ApiTag[];
  initial?: ApiPost;
  publishedPosts?: LinkablePost[];
  affiliateOptions?: ApiAffiliateLink[];
}) {
  const router = useRouter();
  const isEdit = !!initial;
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  // Public display author (legitimate writer), separate from the admin account.
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [cover, setCover] = useState(initial?.cover ?? "");
  const [coverPublicId, setCoverPublicId] = useState<string | undefined>(undefined);
  const editorRef = useRef<RichTextEditorHandle>(null);
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [categoryId, setCategoryId] = useState(
    initial?.category?._id ?? categories[0]?._id ?? "",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initial?.tags?.map((t) => t._id) ?? [],
  );
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">(
    (initial?.status as "draft" | "published" | "scheduled") ?? "draft",
  );
  const [publishedAt, setPublishedAt] = useState(
    initial?.publishedAt ? initial.publishedAt.slice(0, 16) : "",
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [trending, setTrending] = useState(initial?.trending ?? false);
  // Preview overlay — renders the current form content like the live article
  // so you can review before publishing.
  const [showPreview, setShowPreview] = useState(false);
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? "");
  const [seoDesc, setSeoDesc] = useState(initial?.seo?.description ?? "");
  const [seoCanonical, setSeoCanonical] = useState(initial?.seo?.canonical ?? "");
  const [seoOg, setSeoOg] = useState(initial?.seo?.ogImage ?? "");
  const [seoNoindex, setSeoNoindex] = useState(initial?.seo?.noindex ?? false);

  // ── SEO Content Optimization & Geo-Targeting ──────────────────────────
  const [primaryKeyword, setPrimaryKeyword] = useState(initial?.primaryKeyword ?? "");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>(
    initial?.secondaryKeywords ?? [],
  );
  const [secondaryInput, setSecondaryInput] = useState("");
  const [targetCountries, setTargetCountries] = useState<string[]>(
    // Default new posts to the US market (higher AdSense value + primary audience).
    initial?.targetCountries ?? ["us"],
  );
  const [targetLanguage, setTargetLanguage] = useState(initial?.targetLanguage ?? "en-US");
  const [searchIntent, setSearchIntent] = useState<SearchIntent | "">(
    (initial?.searchIntent as SearchIntent) ?? "",
  );

  // ── Monetization ──────────────────────────────────────────────────────
  const [selectedAffiliate, setSelectedAffiliate] = useState<string[]>(
    initial?.affiliateLinks?.map((l) => l._id) ?? [],
  );
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    initial?.faqs ?? [],
  );

  function toggleAffiliate(id: string) {
    setSelectedAffiliate((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );
  }

  const [saving, setSaving] = useState<null | "draft" | "publish">(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Live SEO analysis (debounced) + server verification state.
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [serverVerified, setServerVerified] = useState(false);

  const autoSlug = useMemo(
    () =>
      title
        .toLowerCase()
        .trim()
        .replace(/['"`’]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
    [title],
  );

  // ── SEO engine input (single source of truth for local + server analysis) ──
  const seoInput = useMemo(
    () => ({
      title: title.trim(),
      slug: slug || autoSlug,
      excerpt: excerpt.trim(),
      content,
      seo: {
        title: seoTitle || undefined,
        description: seoDesc || undefined,
        canonical: seoCanonical || undefined,
        ogImage: seoOg || undefined,
        noindex: seoNoindex || undefined,
      },
      cover: cover.trim(),
      primaryKeyword: primaryKeyword.trim(),
      secondaryKeywords,
      targetCountries,
      targetLanguage,
      searchIntent: searchIntent || undefined,
    }),
    [
      title, slug, autoSlug, excerpt, content, seoTitle, seoDesc, seoCanonical,
      seoOg, seoNoindex, cover, primaryKeyword, secondaryKeywords, targetCountries,
      targetLanguage, searchIntent,
    ],
  );

  // Build the engine's flat input contract from the post-shaped seoInput.
  const engineInput = useMemo(
    () => ({
      title: seoInput.title,
      slug: seoInput.slug,
      excerpt: seoInput.excerpt,
      content: seoInput.content,
      metaTitle: seoInput.seo.title,
      metaDescription: seoInput.seo.description,
      canonical: seoInput.seo.canonical,
      ogImage: seoInput.seo.ogImage,
      cover: seoInput.cover,
      primaryKeyword: seoInput.primaryKeyword,
      secondaryKeywords: seoInput.secondaryKeywords,
      targetCountry: targetCountries[0],
      targetLanguage: seoInput.targetLanguage,
      siteHost: SITE_HOST,
    }),
    [seoInput, targetCountries],
  );

  // Debounced live analysis — never runs on every keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setAnalysis(analyzeSeo(engineInput));
      setServerVerified(false);
    }, 500);
    return () => clearTimeout(id);
  }, [engineInput]);

  const seoErrors = analysis?.issues.filter((i) => i.severity === "error") ?? [];
  const seoWarningCount =
    analysis?.issues.filter((i) => i.severity === "warning").length ?? 0;
  const publishBlocked = seoErrors.length > 0;

  // Internal-link suggestions: match this post's keyword/category/tags against
  // existing published posts. Purely local, no irrelevant auto-links.
  const internalLinkSuggestions = useMemo(() => {
    const terms = new Set(
      [primaryKeyword, ...secondaryKeywords, title]
        .join(" ")
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3),
    );
    const selectedCat = categories.find((c) => c._id === categoryId)?.slug;
    const selectedTagSlugs = new Set(
      selectedTags
        .map((id) => tagOptions.find((t) => t._id === id)?.slug)
        .filter(Boolean) as string[],
    );
    return publishedPosts
      .filter((p) => p.slug !== initial?.slug)
      .map((p) => {
        let score = 0;
        const titleWords = p.title.toLowerCase().split(/\s+/);
        for (const w of titleWords) if (terms.has(w)) score += 2;
        if (p.categorySlug && p.categorySlug === selectedCat) score += 1;
        if (p.tagSlugs?.some((t) => selectedTagSlugs.has(t))) score += 1;
        return { post: p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => ({ title: x.post.title, slug: x.post.slug }));
  }, [
    primaryKeyword, secondaryKeywords, title, categories, categoryId,
    selectedTags, tagOptions, publishedPosts, initial?.slug,
  ]);

  async function runServerAnalysis() {
    setAnalyzing(true);
    setAnalysis(analyzeSeo(engineInput)); // instant local refresh
    try {
      const server = await analyzeSeoRemote(seoInput as Partial<PostInput>);
      setAnalysis(server);
      setServerVerified(true);
    } catch {
      // Keep the local analysis if the server is unreachable.
    } finally {
      setAnalyzing(false);
    }
  }

  function insertInternalLink(targetSlug: string, text: string) {
    editorRef.current?.insertHTML(`<a href="/blog/${targetSlug}">${text}</a>`);
  }

  function addSecondaryKeyword() {
    const v = secondaryInput.trim();
    if (v && !secondaryKeywords.includes(v)) {
      setSecondaryKeywords((s) => [...s, v]);
    }
    setSecondaryInput("");
  }

  function toggleCountry(code: string) {
    setTargetCountries((s) => {
      if (code === "global") return ["global"];
      const without = s.filter((c) => c !== "global");
      return without.includes(code)
        ? without.filter((c) => c !== code)
        : [...without, code];
    });
  }

  function toggleTag(id: string) {
    setSelectedTags((s) =>
      s.includes(id) ? s.filter((t) => t !== id) : [...s, id],
    );
  }

  async function submit(asStatus: "draft" | "published") {
    setError(null);
    setSuccess(null);
    if (!title.trim()) return setError("Please add a title.");
    if (!content.trim()) return setError("Please add some content.");
    if (!categoryId) return setError("Please choose a category.");

    // Block publish (never block draft) when critical SEO errors remain.
    // The server independently re-validates this before publishing.
    if (asStatus === "published" && publishBlocked) {
      setError(
        `Fix ${seoErrors.length} critical SEO issue${seoErrors.length === 1 ? "" : "s"} before publishing (see the SEO panel). You can still save as draft.`,
      );
      return;
    }
    // Warnings don't block, but confirm before publishing.
    if (asStatus === "published" && seoWarningCount > 0) {
      const ok = window.confirm(
        `Your post has ${seoWarningCount} SEO warning${seoWarningCount === 1 ? "" : "s"}. Publish anyway?`,
      );
      if (!ok) return;
    }

    setSaving(asStatus === "draft" ? "draft" : "publish");
    try {
      const payload = {
        title: title.trim(),
        slug: (slug || autoSlug) || undefined,
        excerpt: excerpt.trim() || undefined,
        authorName: authorName.trim() || undefined,
        content,
        cover: cover.trim() || undefined,
        coverPublicId,
        category: categoryId,
        tags: selectedTags,
        status: asStatus,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
        featured,
        trending,
        seo: {
          title: seoTitle || undefined,
          description: seoDesc || undefined,
          canonical: seoCanonical || undefined,
          ogImage: seoOg || undefined,
          noindex: seoNoindex || undefined,
        },
        primaryKeyword: primaryKeyword.trim() || undefined,
        secondaryKeywords,
        targetCountries,
        targetLanguage: targetLanguage || undefined,
        searchIntent: searchIntent || undefined,
        affiliateLinks: selectedAffiliate,
        faqs: faqs
          .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))
          .filter((f) => f.question && f.answer),
      };
      const post = isEdit
        ? await updatePost(initial!.slug, payload)
        : await createPost(payload);
      setSuccess(
        isEdit
          ? "Post updated."
          : asStatus === "draft"
          ? "Draft saved."
          : "Post published.",
      );
      router.push(`/admin/blogs`);
      router.refresh();
      return post;
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Could not save post.";
      setError(msg);
    } finally {
      setSaving(null);
    }
  }

  return (
    <>
      <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {isEdit ? "Edit post" : "Create new post"}
            </h1>
            <p className="text-xs text-foreground-subtle mt-0.5">
              Backend:{" "}
              <span className="text-foreground-muted">
                {isEdit ? `PATCH /api/posts/${initial!.slug}` : "POST /api/posts"}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/blogs" className="btn-ghost text-sm">
              <ArrowLeft size={14} /> Cancel
            </Link>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-ghost text-sm"
              title="See how this article will look before publishing"
            >
              Preview
            </button>
            {!isEdit && (
              <button
                type="button"
                disabled={saving !== null}
                onClick={() => submit("draft")}
                className="btn-ghost text-sm disabled:opacity-60"
              >
                {saving === "draft" ? "Saving…" : "Save draft"}
              </button>
            )}
            <button
              type="button"
              disabled={saving !== null || (publishBlocked && (status !== "draft"))}
              title={publishBlocked && status !== "draft" ? "Fix the SEO issues below first" : ""}
              onClick={() => submit(status === "draft" ? "draft" : "published")}
              className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Check size={14} />{" "}
              {isEdit
                ? saving
                  ? "Saving…"
                  : "Save changes"
                : saving === "publish"
                ? "Publishing…"
                : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit("published");
        }}
        className="p-6 grid lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-200 text-sm px-4 py-3">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 text-sm px-4 py-3">
              {success}
            </div>
          )}

          {publishBlocked && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-100 text-sm px-4 py-3">
              <p className="font-semibold flex items-center gap-2">
                SEO check — {seoErrors.length} critical issue{seoErrors.length === 1 ? "" : "s"} before publishing
              </p>
              <ul className="mt-2 ml-5 list-disc space-y-1 text-rose-200/90 text-xs">
                {seoErrors.map((e) => (
                  <li key={e.id}>{e.message}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-rose-200/60">
                You can still <span className="underline">save as draft</span> — this only blocks publishing.
              </p>
            </div>
          )}

          <div className="card p-6 space-y-5">
            <Field
              label="Title"
              value={title}
              onChange={setTitle}
              placeholder="A clear, specific, irresistible headline"
              className="text-xl font-semibold"
            />
            <Field
              label="Slug"
              value={slug}
              onChange={setSlug}
              placeholder={autoSlug || "auto-generated-from-title"}
              hint={`URL: /blog/${slug || autoSlug || "your-slug"}`}
            />
            <Field
              label="Author"
              value={authorName}
              onChange={setAuthorName}
              placeholder="e.g. Hayat Ullah — the legitimate writer"
              hint="Shown on the article page, never on cards. Leave empty to show no author — it never falls back to the admin account."
            />
            <Field
              label="Excerpt"
              as="textarea"
              rows={3}
              value={excerpt}
              onChange={setExcerpt}
              placeholder="One or two sentences that earn the click."
            />
          </div>

          <div className="card p-6 space-y-3">
            <Label>Content</Label>
            {/* Hidden uploader — the editor's image button triggers this. */}
            <input
              ref={inlineFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.currentTarget.value = "";
                if (!file) return;

                // Require alt text before we upload / insert. Min 5 chars.
                let alt = "";
                while (alt.trim().length < 5) {
                  const answer = window.prompt(
                    "Alt text for this image (min 5 characters, required for SEO & accessibility):",
                    "",
                  );
                  if (answer === null) return; // user cancelled
                  alt = answer;
                  if (alt.trim().length < 5) {
                    window.alert("Alt text must be at least 5 characters.");
                  }
                }
                const safeAlt = alt
                  .trim()
                  .replace(/&/g, "&amp;")
                  .replace(/"/g, "&quot;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");

                setError(null);
                setInlineUploading(true);
                try {
                  const result = await uploadImage(file);
                  editorRef.current?.insertHTML(
                    `<img src="${result.url}" alt="${safeAlt}" />`,
                  );
                } catch (err) {
                  setError(
                    err instanceof ApiError ? err.message : "Image upload failed.",
                  );
                } finally {
                  setInlineUploading(false);
                }
              }}
            />

            <RichTextEditor
              ref={editorRef}
              value={content}
              onChange={setContent}
              onImageClick={() => inlineFileRef.current?.click()}
              imageBusy={inlineUploading}
              placeholder="Start writing… use the toolbar to format (headings, bold, lists, links, images). Saved as clean HTML automatically."
            />

            <div className="flex items-center justify-end text-xs text-foreground-subtle">
              <span>
                {wordCount(content)} words ·{" "}
                {Math.max(1, Math.round(wordCount(content) / 220))} min read
              </span>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <h3 className="font-semibold">Keyword & targeting</h3>
              <p className="text-xs text-foreground-subtle">
                Focus the article and target a market. Powers the SEO analysis.
              </p>
            </div>

            <Field
              label="Primary keyword"
              value={primaryKeyword}
              onChange={setPrimaryKeyword}
              placeholder="e.g. best laptops for students"
            />

            <div>
              <Label>Secondary keywords</Label>
              <div className="flex gap-2">
                <input
                  value={secondaryInput}
                  onChange={(e) => setSecondaryInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSecondaryKeyword();
                    }
                  }}
                  placeholder="Type a keyword and press Enter"
                  className="flex-1 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition"
                />
                <button type="button" onClick={addSecondaryKeyword} className="btn-ghost text-sm">
                  Add
                </button>
              </div>
              {secondaryKeywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {secondaryKeywords.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() =>
                        setSecondaryKeywords((s) => s.filter((x) => x !== k))
                      }
                      className="chip chip-accent"
                      title="Remove"
                    >
                      {k} ✕
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label>Target countries</Label>
              <div className="flex flex-wrap gap-2">
                {TARGET_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCountry(c.code)}
                    className={`chip ${
                      targetCountries.includes(c.code) ? "chip-accent" : "hover:text-foreground"
                    }`}
                  >
                    {targetCountries.includes(c.code) ? "✓ " : ""}
                    {c.name}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-foreground-subtle">
                Multiple countries? Keep one global article, or generate localized drafts per market
                after saving (from the post list). This uses hreflang &amp; canonicals — it never
                forces Google to region-restrict a page.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Target language</Label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  {TARGET_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Search intent</Label>
                <select
                  value={searchIntent}
                  onChange={(e) => setSearchIntent(e.target.value as SearchIntent | "")}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="">Auto-detect</option>
                  {SEARCH_INTENTS.map((i) => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-5">
            <div>
              <h3 className="font-semibold">SEO</h3>
              <p className="text-xs text-foreground-subtle">Override defaults for this post.</p>
            </div>
            <Field label="Meta title" value={seoTitle} onChange={setSeoTitle} placeholder="Defaults to post title" />
            <Field label="Meta description" as="textarea" rows={2} value={seoDesc} onChange={setSeoDesc} placeholder="Defaults to excerpt" />
            <Field label="Canonical URL" value={seoCanonical} onChange={setSeoCanonical} placeholder="https://…" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="OG image URL" value={seoOg} onChange={setSeoOg} placeholder="https://…" />
              <div>
                <Label>Index in search</Label>
                <select
                  value={seoNoindex ? "noindex" : "index"}
                  onChange={(e) => setSeoNoindex(e.target.value === "noindex")}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
                >
                  <option value="index">Index, follow</option>
                  <option value="noindex">Noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>
          <div className="card p-6 space-y-4">
            <div>
              <h3 className="font-semibold">FAQ</h3>
              <p className="text-xs text-foreground-subtle">
                Answer real questions readers ask. Renders on the article and emits
                FAQ schema for rich results — only add genuine Q&amp;As.
              </p>
            </div>
            {faqs.map((f, i) => (
              <div key={i} className="rounded-xl border border-white/10 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground-subtle">Q{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setFaqs((s) => s.filter((_, j) => j !== i))}
                    className="text-xs text-rose-300 hover:text-rose-200"
                  >
                    Remove
                  </button>
                </div>
                <input
                  value={f.question}
                  onChange={(e) =>
                    setFaqs((s) => s.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))
                  }
                  placeholder="Question"
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500/40"
                />
                <textarea
                  rows={2}
                  value={f.answer}
                  onChange={(e) =>
                    setFaqs((s) => s.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))
                  }
                  placeholder="Answer"
                  className="w-full bg-background border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-500/40 resize-none"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFaqs((s) => [...s, { question: "", answer: "" }])}
              className="btn-ghost text-sm"
            >
              + Add question
            </button>
          </div>
        </div>

        <aside className="space-y-6">
          <SeoPanel
            analysis={analysis}
            analyzing={analyzing}
            onAnalyze={runServerAnalysis}
            serverVerified={serverVerified}
            getInput={() => seoInput as Partial<PostInput>}
            internalLinkSuggestions={internalLinkSuggestions}
            onInsertLink={insertInternalLink}
          />

          <div className="card p-6 space-y-5">
            <h3 className="font-semibold">Publish settings</h3>
            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <Field
              label="Publish date"
              type="datetime-local"
              value={publishedAt}
              onChange={setPublishedAt}
            />
            <ToggleRow label="Feature on homepage" checked={featured} onChange={setFeatured} />
            <ToggleRow label="Mark as trending" checked={trending} onChange={setTrending} />
          </div>

          <div className="card p-6">
            <h3 className="font-semibold mb-4">Cover image</h3>
            <ImageUploader
              value={cover}
              onChange={(url, publicId) => {
                setCover(url);
                setCoverPublicId(publicId);
              }}
            />
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="font-semibold">Organize</h3>
            <div>
              <Label>Category</Label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none"
              >
                {categories.length === 0 && <option value="">No categories yet</option>}
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background border border-white/10 text-xs text-foreground-subtle">
                <TagIcon size={14} />
                {selectedTags.length === 0
                  ? "Click chips below to add tags"
                  : `${selectedTags.length} selected`}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.slice(0, 20).map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => toggleTag(t._id)}
                    className={`chip ${selectedTags.includes(t._id) ? "chip-accent" : "hover:text-foreground"}`}
                  >
                    {selectedTags.includes(t._id) ? "✓ " : "+ "}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recommended tools</h3>
              <Link href="/admin/affiliate" className="text-xs text-violet-300 hover:text-violet-200">
                Manage
              </Link>
            </div>
            <p className="text-xs text-foreground-subtle">
              Attach affiliate tools to render tracked comparison + product cards in
              this article. A disclosure is shown automatically.
            </p>
            {affiliateOptions.length === 0 ? (
              <p className="text-xs text-foreground-subtle">
                No tools yet.{" "}
                <Link href="/admin/affiliate" className="underline">
                  Add your first tool
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {affiliateOptions.map((l) => (
                  <button
                    key={l._id}
                    type="button"
                    onClick={() => toggleAffiliate(l._id)}
                    className={`chip ${selectedAffiliate.includes(l._id) ? "chip-accent" : "hover:text-foreground"}`}
                  >
                    {selectedAffiliate.includes(l._id) ? "✓ " : "+ "}
                    {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>
      </form>

      {showPreview && (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Article preview"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-background/80 backdrop-blur-xl px-6 py-3">
            <span className="text-xs uppercase tracking-widest text-foreground-subtle">
              Preview — how your article will look when published
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className="btn-primary text-sm"
            >
              Close preview
            </button>
          </div>
          <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
            {categories.find((c) => c._id === categoryId)?.name && (
              <span className="chip-accent">
                {categories.find((c) => c._id === categoryId)?.name}
              </span>
            )}
            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {title || "Untitled article"}
            </h1>
            {excerpt && (
              <p className="mt-4 text-lg text-foreground-muted">{excerpt}</p>
            )}
            {cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover}
                alt={title}
                className="mt-8 w-full rounded-2xl border border-white/5 object-cover"
              />
            )}
            {content ? (
              <div
                className="prose-article mt-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="mt-8 italic text-foreground-subtle">
                No content yet — start writing to see it here.
              </p>
            )}
          </article>
        </div>
      )}
    </>
  );
}

function wordCount(s: string) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-foreground-subtle mb-1.5">
      {children}
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  as,
  rows,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  as?: "textarea";
  rows?: number;
  hint?: string;
  className?: string;
}) {
  const common = `w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-foreground-subtle focus:border-violet-500/40 transition ${className ?? ""}`;
  return (
    <div>
      <Label>{label}</Label>
      {as === "textarea" ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${common} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={common}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-foreground-subtle">{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-background border border-white/5 cursor-pointer">
      <span className="text-sm">{label}</span>
      <span className="relative inline-block w-9 h-5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-white/10 peer-checked:bg-gradient-accent transition" />
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
