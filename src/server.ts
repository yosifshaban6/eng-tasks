// src/server.ts
import dotenv from "dotenv";
import app from "./app";
import prisma from "./utils/prisma";
import { config } from "./config/index";

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL connected successfully via Prisma");

    app.listen(config.port, () => {
      console.log(`\nExpress server is running!`);
      console.log(`URL: http://localhost:${config.port}`);
      console.log(`Health check: http://localhost:${config.port}/health`);
      console.log(`\nNo routes loaded - just infrastructure running\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("\nServer shut down gracefully");
  process.exit(0);
});
