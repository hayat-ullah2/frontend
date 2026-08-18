// ────────────────────────────────────────────────────────────────────────────
// audit-fix-db — batched, guarded DB fixes for the SEO/trust audit.
// DRY-RUN by default; pass --apply to write.
//   npx tsx src/scripts/audit-fix-db.ts           # preview
//   npx tsx src/scripts/audit-fix-db.ts --apply    # write
//
// Covers: Task 1a/1b (unpublish demo posts), 5a (retitle pillar), 7 (tag
// cleanup), 8a (missing publishedAt), 8d (en→en-US), 11 (category reassigns).
// Every mutation is guarded so it only acts on the expected state.
// ────────────────────────────────────────────────────────────────────────────
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { Tag } from "../models/Tag.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);
const apply = process.argv.includes("--apply");
const log = (s: string) => console.log(`  ${s}`);

// Demo posts to unpublish — ONLY if body still contains the sample marker.
const DEMO_SLUGS = [
  "github-copilot-vs-cursor-the-honest-comparison",
  "7-best-free-ai-image-generators-no-watermark",
  "best-ai-note-takers-for-meetings-compared",
  "best-ai-video-generators-for-creators-in-2026", // 4th → also 301'd in next.config
];

// Task 7b — the ONLY tags to keep. Everything else is deleted + unassigned.
const KEEP_TAGS = new Set([
  "Review", "Comparison", "Free Tools", "Paid Tools", "ChatGPT",
  "Claude", "Gemini", "Midjourney", "Automation", "Pricing",
]);

const PILLAR_SLUG = "best-ai-tools-for-text-to-video-generators";
const PILLAR_TITLE = "Best AI Video Generators in 2026: Text-to-Video Tools Compared";
const PILLAR_META =
  "Compare the best AI video generators and text-to-video tools in 2026 — features, pricing (USD), pros and cons, and which one to pick.";

async function run() {
  await connectDB();
  console.log(`\n════ AUDIT DB FIX (${apply ? "APPLY" : "DRY-RUN"}) ════\n`);

  const cats = await Category.find().lean();
  const catBySlug = new Map(cats.map((c) => [c.slug, c._id]));
  const catById = new Map(cats.map((c) => [String(c._id), c.name]));
  const prodId = catBySlug.get("ai-productivity-tools");
  const videoId = catBySlug.get("ai-video-tools");

  // ── Task 1a/1b — unpublish demo posts (guarded on sample marker) ──────────
  console.log("Task 1 — unpublish demo posts:");
  for (const slug of DEMO_SLUGS) {
    const p = await Post.findOne({ slug });
    if (!p) { log(`skip ${slug} (not found)`); continue; }
    const isSample = /sample article body/i.test(p.content || "");
    if (!isSample) { log(`KEEP ${slug} (no sample marker — content looks real, not touching)`); continue; }
    log(`unpublish ${slug} (status ${p.status} → draft)`);
    if (apply) { p.status = "draft"; await p.save(); }
  }

  // ── Task 5a — retitle the pillar ──────────────────────────────────────────
  console.log("\nTask 5a — retitle pillar:");
  const pillar = await Post.findOne({ slug: PILLAR_SLUG });
  if (pillar) {
    log(`"${pillar.title}" → "${PILLAR_TITLE}"`);
    if (apply) {
      pillar.title = PILLAR_TITLE;
      pillar.set("seo.title", PILLAR_TITLE);
      pillar.set("seo.description", PILLAR_META);
      await pillar.save();
    }
  } else log(`skip (pillar ${PILLAR_SLUG} not found)`);

  // ── Task 8a/8d — fix missing publishedAt + non en-US language ─────────────
  console.log("\nTask 8a/8d — publishedAt + language:");
  const published = await Post.find({ status: "published" });
  for (const p of published) {
    if (!p.publishedAt) {
      const when = p.createdAt ?? new Date();
      log(`set publishedAt for ${p.slug}`);
      if (apply) { p.publishedAt = when; }
    }
    if (p.targetLanguage !== "en-US") {
      log(`set lang en-US for ${p.slug} (was ${p.targetLanguage ?? "-"})`);
      if (apply) { p.targetLanguage = "en-US"; }
    }
    if (apply && p.isModified()) await p.save();
  }

  // ── Task 11 — category reassignments ──────────────────────────────────────
  console.log("\nTask 11 — category reassignments:");
  const reassigns: Array<[string, mongoose.Types.ObjectId | undefined, string]> = [
    ["10-ai-tools-every-small-business-should-use", prodId as mongoose.Types.ObjectId, "AI Productivity Tools"],
    ["how-to-automate-your-inbox-with-ai-step-by-step", prodId as mongoose.Types.ObjectId, "AI Productivity Tools"],
    ["veo-3-vs-kling-ai", videoId as mongoose.Types.ObjectId, "AI Video Tools"],
  ];
  for (const [slug, toId, label] of reassigns) {
    const p = await Post.findOne({ slug });
    if (!p || !toId) { log(`skip ${slug}`); continue; }
    log(`${slug}: ${catById.get(String(p.category))} → ${label}`);
    if (apply) { p.category = toId; await p.save(); }
  }

  // ── Task 7 — tag cleanup (delete all but KEEP_TAGS, unassign from posts) ───
  console.log("\nTask 7 — tag cleanup:");
  const allTags = await Tag.find();
  const deleteTags = allTags.filter((t) => !KEEP_TAGS.has(t.name));
  const deleteIds = deleteTags.map((t) => t._id);
  log(`keeping ${allTags.length - deleteTags.length}, deleting ${deleteTags.length}: ${deleteTags.map((t) => t.name).join(", ")}`);
  if (apply) {
    await Post.updateMany({ tags: { $in: deleteIds } }, { $pull: { tags: { $in: deleteIds } } });
    await Tag.deleteMany({ _id: { $in: deleteIds } });
  }

  // ── Refresh denormalized counters ─────────────────────────────────────────
  if (apply) {
    for (const c of cats) {
      const n = await Post.countDocuments({ category: c._id, status: "published" });
      await Category.updateOne({ _id: c._id }, { $set: { postCount: n } });
    }
    for (const t of await Tag.find()) {
      const n = await Post.countDocuments({ tags: t._id });
      await Tag.updateOne({ _id: t._id }, { $set: { postCount: n } });
    }
    console.log("\n✅ Applied. Counters refreshed.");
  } else {
    console.log("\nDRY-RUN only. Re-run with --apply to write.");
  }
  console.log("");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
