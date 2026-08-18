// Task 10 — rewrite the 3 genuine hands-on testing claims to research-based
// phrasing (tested-tools = "none yet"). Honest disclaimers are left untouched.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const EDITS: Record<string, Array<[string, string]>> = {
  "veo-3-vs-kling-ai": [
    [
      "We ran five <strong>controlled comparisons</strong> using prompts for common creator scenarios",
      "We compared the two tools across five <strong>common creator scenarios</strong>, based on their documented capabilities and public sample outputs",
    ],
  ],
};

async function run() {
  await connectDB();
  for (const [slug, edits] of Object.entries(EDITS)) {
    const p = await Post.findOne({ slug });
    if (!p) { console.log(`skip ${slug} (not found)`); continue; }
    let content = p.content || "";
    for (const [find, repl] of edits) {
      if (content.includes(find)) {
        content = content.split(find).join(repl);
        console.log(`  ✏️  ${slug}: "${find.slice(0, 40)}…" → research-based`);
      } else {
        console.log(`  ⚠️  ${slug}: phrase not found (may need manual check): "${find.slice(0, 40)}…"`);
      }
    }
    p.content = content;
    await p.save();
  }
  console.log("\n✅ Done.");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
