// Read-only: list published posts with slug + category, for internal-link mapping.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function run() {
  await connectDB();
  const posts = await Post.find({ status: "published" })
    .sort({ createdAt: 1 })
    .select("title slug category primaryKeyword")
    .lean();
  const cats = await Category.find().select("_id name").lean();
  const catName = new Map(cats.map((c) => [String(c._id), c.name]));

  console.log(`\nPUBLISHED POSTS (${posts.length}):\n`);
  for (const p of posts) {
    console.log(`• [${catName.get(String(p.category)) ?? "?"}]`);
    console.log(`  title: ${p.title}`);
    console.log(`  slug:  /blog/${p.slug}`);
    console.log(`  kw:    ${p.primaryKeyword ?? "—"}\n`);
  }
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(()=>{}); process.exit(1); });
