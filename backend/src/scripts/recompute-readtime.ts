// Task 8e — recompute readingTime for every post from its real body word count.
// Posts under 100 words get 0 (badge stays hidden); everything else gets a real
// estimate (~220 wpm, min 1).
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const wc = (html: string) =>
  (html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().split(" ").filter(Boolean).length;

async function run() {
  await connectDB();
  const posts = await Post.find();
  let changed = 0;
  for (const p of posts) {
    const words = wc(p.content || "");
    const rt = words < 100 ? 0 : Math.max(1, Math.round(words / 220));
    if (p.readingTime !== rt) {
      console.log(`  ${p.slug}: ${p.readingTime} → ${rt}m (${words} words)`);
      p.readingTime = rt;
      await p.save();
      changed++;
    }
  }
  console.log(changed ? `\n✅ Updated readingTime on ${changed} post(s).` : "\nAll read-times already correct.");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
