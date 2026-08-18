import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";
setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);
async function run() {
  await connectDB();
  const p = await Post.findOne({ slug: "veo-3-vs-kling-ai" });
  const c = p?.content || "";
  const i = c.indexOf("controlled comparison");
  console.log(JSON.stringify(c.slice(Math.max(0, i - 60), i + 80)));
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
