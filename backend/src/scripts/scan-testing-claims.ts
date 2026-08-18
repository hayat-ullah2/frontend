// Task 10 — scan published post bodies + excerpts for hands-on testing claims.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const PATTERNS = [/we tested/gi, /we ran/gi, /hands-on/gi, /tested by/gi, /we put .* through/gi, /in our testing/gi, /our tests?/gi];

async function run() {
  await connectDB();
  const posts = await Post.find({ status: "published" });
  let total = 0;
  for (const p of posts) {
    const text = `${p.excerpt || ""}\n${p.content || ""}`;
    const hits: string[] = [];
    for (const re of PATTERNS) {
      const m = text.match(re);
      if (m) hits.push(...m.map((s) => s.toLowerCase()));
    }
    if (hits.length) {
      total += hits.length;
      console.log(`\n• ${p.slug} — ${hits.length} hit(s): ${[...new Set(hits)].join(", ")}`);
    }
  }
  console.log(total ? `\nTOTAL: ${total} testing-claim hit(s).` : "\nNo testing claims found.");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
