// Task 13 cleanup — rename the admin account off "NexBlog Admin" and clear the
// leftover "Smoke-test bio". The account is never shown publicly (author system
// uses per-article authorName), but this keeps the DB clean.
import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function run() {
  await connectDB();
  const res = await User.updateMany(
    { $or: [{ name: /NexBlog/i }, { bio: /smoke-test/i }] },
    { $set: { name: "Nexversal Admin", bio: "" } },
  );
  console.log(`✅ Updated ${res.modifiedCount} user(s).`);
  await mongoose.disconnect();
}
run().catch(async (e) => { console.error(e); await mongoose.disconnect().catch(() => {}); process.exit(1); });
