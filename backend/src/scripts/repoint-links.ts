// Task 5c — repoint internal links from retired video slugs to the pillar.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const PILLAR = "/blog/best-ai-tools-for-text-to-video-generators";
const RETIRED = [
  "/blog/best-ai-tools-for-a-video-generator",
  "/blog/best-ai-video-generators-for-creators-in-2026",
];

async function run() {
  await connectDB();
  const posts = await Post.find();
  let changed = 0;
  for (const p of posts) {
    let content = p.content || "";
    let hit = false;
    for (const r of RETIRED) {
      if (content.includes(r)) {
        // Replace the retired path but avoid double-rewriting the pillar itself.
        content = content.split(r).join(PILLAR);
        hit = true;
      }
    }
    if (hit) {
      console.log(`  repointed links in ${p.slug}`);
      p.content = content;
      await p.save();
      changed++;
    }
  }
  console.log(changed ? `\n✅ Updated ${changed} post(s).` : "\nNo retired links found in any post body.");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
