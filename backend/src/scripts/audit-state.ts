// Read-only audit dump to ground the fix plan. Prints posts (with content
// analysis), tags, and categories. Changes nothing.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";
import { Tag } from "../models/Tag.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const wc = (html: string) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

async function run() {
  await connectDB();
  const cats = await Category.find().lean();
  const catName = new Map(cats.map((c) => [String(c._id), c.name]));
  const tags = await Tag.find().lean();
  const tagName = new Map(tags.map((t) => [String(t._id), t.name]));

  const posts = await Post.find().sort({ createdAt: 1 }).lean();
  console.log(`\n════ POSTS (${posts.length}) ════`);
  for (const p of posts) {
    const words = wc(p.content as string);
    const sample = /sample article body/i.test((p.content as string) || "");
    const unsplash = /images\.unsplash\.com/.test((p.cover as string) || "");
    console.log(
      `\n• ${p.slug}` +
      `\n   status=${p.status} words=${words}${sample ? " ⚠SAMPLE" : ""} ` +
      `publishedAt=${p.publishedAt ? "yes" : "NO"} lang=${p.targetLanguage ?? "-"}` +
      `\n   cat=${catName.get(String(p.category)) ?? "?"} ` +
      `tags=[${(p.tags as unknown[]).map((t) => tagName.get(String(t)) ?? "?").join(", ")}]` +
      `${unsplash ? "\n   cover=UNSPLASH-hotlink" : ""}`,
    );
  }

  console.log(`\n════ CATEGORIES (${cats.length}) ════`);
  for (const c of cats) {
    const n = await Post.countDocuments({ category: c._id, status: "published" });
    console.log(`  ${c.name} (${c.slug}) — ${n} published`);
  }

  console.log(`\n════ TAGS (${tags.length}) ════`);
  for (const t of tags) {
    const n = await Post.countDocuments({ tags: t._id });
    console.log(`  ${t.name} (${t.slug}) — ${n} posts`);
  }
  console.log("");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
