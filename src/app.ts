// src/app.ts
import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Express server is running'
  });
});

export default app;