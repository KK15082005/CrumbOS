import app from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/env";

const startServer = async () => {
  // Connect to database
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`[Server] CrumbOS Backend is running on http://localhost:${config.port}`);
    console.log(`[Server] Environment: ${config.nodeEnv}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log("[Server] HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

startServer().catch((err) => {
  console.error("[Server] Fatal Startup Error:", err);
  process.exit(1);
});
