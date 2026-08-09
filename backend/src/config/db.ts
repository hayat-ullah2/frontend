import mongoose from "mongoose";
import { env } from "./env.js";

/**
 * Connect to MongoDB with options tuned for MongoDB Atlas free tier on Windows:
 * - `family: 4` forces IPv4. Some Windows networks (firewall + AV) fail the TLS
 *   handshake over IPv6 with "tlsv1 alert internal error" — IPv4 sidesteps that.
 * - Longer `serverSelectionTimeoutMS` so a paused M0 cluster has time to wake up.
 * - Larger socket timeout to ride out the warmup.
 * - `bufferCommands` left enabled so queries during a brief reconnect aren't
 *   dropped immediately.
 */
export async function connectDB(): Promise<void> {
  mongoose.set("strictQuery", true);

  // Make the (sometimes slow) Atlas handshake visible so a cold connect never
  // looks like a frozen process. Show the scheme + host, never the credentials.
  const scheme = env.mongoUri.startsWith("mongodb+srv") ? "mongodb+srv" : "mongodb";
  const hostPart = env.mongoUri.replace(/^mongodb(\+srv)?:\/\/([^@]*@)?/, "").split(/[/?]/)[0];
  console.log(`[db] connecting (${scheme}) to ${hostPart} …`);

  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const conn = await mongoose.connect(env.mongoUri, {
        family: 4,
        serverSelectionTimeoutMS: 20000,
        socketTimeoutMS: 60000,
        maxPoolSize: 10,
        retryWrites: true,
      });
      console.log(
        `[db] connected: ${conn.connection.host}/${conn.connection.name}`,
      );
      break;
    } catch (err) {
      lastErr = err;
      const code = (err as { code?: string }).code;
      console.warn(
        `[db] connect attempt ${attempt}/${maxAttempts} failed${code ? ` (${code})` : ""}: ${
          (err as Error).message
        }`,
      );
      if (attempt < maxAttempts) {
        const delay = 1500 * attempt;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  if (mongoose.connection.readyState !== 1) {
    console.error("[db] all connection attempts failed; throwing.");
    throw lastErr;
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] disconnected — driver will auto-reconnect");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("[db] reconnected");
  });
  mongoose.connection.on("error", (err) => {
    console.warn("[db] error event:", err.message);
  });
}
