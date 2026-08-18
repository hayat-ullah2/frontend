import { setServers } from "node:dns";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

const ADMIN_EMAIL = "admin@nexes.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Nexversal Admin";

async function run() {
  await connectDB();

  const existing = await User.findOne({ email: ADMIN_EMAIL }).select("+password");

  if (existing) {
    existing.name = ADMIN_NAME;
    existing.role = "admin";
    existing.status = "active";
    existing.password = ADMIN_PASSWORD; // pre-save hook re-hashes
    await existing.save();
    console.log(`[seed] updated admin: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
      status: "active",
    });
    console.log(`[seed] created admin: ${ADMIN_EMAIL}`);
  }

  console.log("[seed] credentials → email: %s · password: %s", ADMIN_EMAIL, ADMIN_PASSWORD);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("[seed] failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
