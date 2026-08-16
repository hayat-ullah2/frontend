// One-off: set all existing posts to target the US market (en-US).
// Safe & idempotent — only sets the two geo fields, touches nothing else.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function run() {
  await connectDB();
  const res = await Post.updateMany(
    {},
    { $set: { targetCountries: ["us"], targetLanguage: "en-US" } },
  );
  console.log(`✅ Retargeted ${res.modifiedCount} post(s) to US / en-US.`);
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(()=>{}); process.exit(1); });
