// ────────────────────────────────────────────────────────────────────────────
// prune-categories — remove the legacy multi-niche categories after the site
// was refocused on the "AI Tools & Software" niche.
//
// SAFE BY DEFAULT: run with no flag to get a DRY-RUN report (deletes nothing).
// Re-run with `--apply` to actually delete the legacy categories AND the demo
// posts attached to them.
//
//   npx tsx src/scripts/prune-categories.ts            # report only
//   npx tsx src/scripts/prune-categories.ts --apply    # perform deletions
//
// A category is KEPT if its name is in KEEP (the new AI-tool categories).
// Everything else is treated as legacy.
// ────────────────────────────────────────────────────────────────────────────

import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

// The canonical AI-tool categories (must match seed-content.ts).
const KEEP = new Set([
  "AI Writing Tools",
  "AI Coding Tools",
  "AI Image Tools",
  "AI Video Tools",
  "AI Chatbots & Assistants",
  "AI for Business",
  "AI Productivity Tools",
  "Comparisons",
  "Guides & Tutorials",
]);

const apply = process.argv.includes("--apply");

async function run() {
  await connectDB();

  const cats = await Category.find().sort({ name: 1 });
  const legacy = cats.filter((c) => !KEEP.has(c.name));
  const kept = cats.filter((c) => KEEP.has(c.name));

  console.log("\n──────── CURRENT CATEGORIES ────────");
  for (const c of cats) {
    const posts = await Post.countDocuments({ category: c._id });
    const flag = KEEP.has(c.name) ? "KEEP  " : "DELETE";
    console.log(`  [${flag}] ${c.name}  —  ${posts} post(s)`);
  }

  if (legacy.length === 0) {
    console.log("\n✅ No legacy categories found. Nothing to do.");
    await mongoose.disconnect();
    return;
  }

  // Count posts that would be deleted (posts attached to legacy categories).
  const legacyIds = legacy.map((c) => c._id);
  const postsToDelete = await Post.countDocuments({ category: { $in: legacyIds } });

  console.log(
    `\n${apply ? "APPLYING" : "DRY-RUN"}: ${legacy.length} legacy categor${
      legacy.length === 1 ? "y" : "ies"
    } and ${postsToDelete} attached demo post(s) will be deleted.`,
  );
  console.log(`Kept AI categories: ${kept.length}`);

  if (!apply) {
    console.log("\nNothing was changed. Re-run with `--apply` to delete.\n");
    await mongoose.disconnect();
    return;
  }

  // 1) Delete demo posts attached to legacy categories.
  const delPosts = await Post.deleteMany({ category: { $in: legacyIds } });
  // 2) Delete the legacy categories themselves.
  const delCats = await Category.deleteMany({ _id: { $in: legacyIds } });

  console.log(
    `\n✅ Deleted ${delCats.deletedCount} categor${
      delCats.deletedCount === 1 ? "y" : "ies"
    } and ${delPosts.deletedCount} post(s).`,
  );

  // Refresh denormalized post counts on the surviving categories.
  for (const c of kept) {
    const count = await Post.countDocuments({ category: c._id });
    await Category.updateOne({ _id: c._id }, { $set: { postCount: count } });
  }
  console.log("Refreshed postCount on kept categories.\n");

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("[prune-categories] failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
