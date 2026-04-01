// src/server.ts
import dotenv from 'dotenv';
import app from './app.js';
import prisma from './utils/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully via Prisma');

    app.listen(PORT, () => {
      console.log(`\nExpress server is running!`);
      console.log(`URL: http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`\nNo routes loaded - just infrastructure running\n`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\nServer shut down gracefully');
  process.exit(0);
});