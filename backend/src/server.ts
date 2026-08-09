import { setServers } from "node:dns";
import { createApp } from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

// Force Node's DNS resolver to use public DNS. Works around Windows setups
// where c-ares can't reach the configured router DNS (firewall/AV blocking
// UDP 53 from Node), which manifests as `querySrv ECONNREFUSED` on Atlas
// `mongodb+srv://` URIs.
setServers(["1.1.1.1", "8.8.8.8", "1.0.0.1", "8.8.4.4"]);

async function bootstrap() {
  const app = createApp();

  try {
    await connectDB();
  } catch (err) {
    console.error("[server] starting without DB connection — DB-backed routes will fail.");
  }

  const server = app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n[server] received ${signal}, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

bootstrap().catch((err) => {
  console.error("[server] fatal:", err);
  process.exit(1);
});
