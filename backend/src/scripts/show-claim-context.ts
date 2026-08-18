import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);
const PAT = /(we tested|we ran|hands-on|tested by|in our testing|our tests?)/gi;

async function run() {
  await connectDB();
  const posts = await Post.find({ status: "published" });
  for (const p of posts) {
    const text = `${p.content || ""}`;
    let m: RegExpExecArray | null;
    const re = new RegExp(PAT);
    while ((m = re.exec(text))) {
      const start = Math.max(0, m.index - 90);
      const end = Math.min(text.length, m.index + m[0].length + 90);
      console.log(`\n[${p.slug}] …${text.slice(start, end).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}…`);
    }
  }
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
