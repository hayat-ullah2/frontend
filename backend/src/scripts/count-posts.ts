// Read-only: total article count by status + by category.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Post } from "../models/Post.js";
import { Category } from "../models/Category.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function run() {
  await connectDB();
  const [total, published, draft, scheduled, archived] = await Promise.all([
    Post.countDocuments({}),
    Post.countDocuments({ status: "published" }),
    Post.countDocuments({ status: "draft" }),
    Post.countDocuments({ status: "scheduled" }),
    Post.countDocuments({ status: "archived" }),
  ]);

  console.log("\n──── ARTICLE COUNT ────");
  console.log(`  TOTAL:      ${total}`);
  console.log(`  Published:  ${published}`);
  console.log(`  Draft:      ${draft}`);
  console.log(`  Scheduled:  ${scheduled}`);
  console.log(`  Archived:   ${archived}\n`);

  const cats = await Category.find().select("_id name").sort({ name: 1 }).lean();
  console.log("──── BY CATEGORY (published) ────");
  for (const c of cats) {
    const n = await Post.countDocuments({ category: c._id, status: "published" });
    console.log(`  ${c.name}: ${n}`);
  }
  console.log("");
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(()=>{}); process.exit(1); });
