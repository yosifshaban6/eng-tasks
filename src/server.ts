import dotenv from "dotenv";
import http from "http";
import { initSocket } from "./sockets/index.js";
import app from "./app.js";
import prisma from "./utils/prisma.js";
import { config } from "./config/index.js";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected successfully via Prisma");

    const server = http.createServer(app);

    // Initialize Socket.io
    console.log("🔌 Initializing WebSocket server...");
    initSocket(server);

    server.listen(config.port, () => {
      console.log(
        `\n╔═══════════════════════════════════════════════════════╗`,
      );
      console.log(`║           Eng Tasks API - Server Started              ║`);
      console.log(`╚═══════════════════════════════════════════════════════╝`);
      console.log(`\n🚀 Express: http://localhost:${config.port}`);
      console.log(`🔌 WebSocket: ws://localhost:${config.port}`);
      console.log(`📚 API Docs: http://localhost:${config.port}/api-docs`);
      console.log(`✅ Health: http://localhost:${config.port}/health`);
      console.log(`📋 Tasks: http://localhost:${config.port}/api/v1/tasks`);
      console.log(`\n🌍 Environment: ${config.env}`);
      console.log(`📦 API Version: ${config.apiVersion}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("\n👋 Server shut down gracefully");
  process.exit(0);
});
