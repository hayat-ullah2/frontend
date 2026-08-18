// Task 5b — the duplicate "best-ai-tools-for-a-video-generator" is 301'd to the
// pillar in next.config. Set it to draft so it also leaves listings + sitemap;
// its content is preserved for you to merge into the pillar manually.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function run() {
  await connectDB();
  const r = await Post.updateOne(
    { slug: "best-ai-tools-for-a-video-generator", status: "published" },
    { $set: { status: "draft" } },
  );
  console.log(`✅ retired best-ai-tools-for-a-video-generator (modified=${r.modifiedCount})`);
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
