import { Router } from "express";
import cacheService from "../services/cacheService.js";

const router = Router();

router.get("/cache/stats", (req, res) => {
  const stats = cacheService.getStats();
  res.json({
    success: true,
    data: {
      size: stats.size,
      keys: stats.keys,
    },
  });
});

router.delete("/cache/clear", (req, res) => {
  cacheService.clear();
  res.json({ success: true, message: "Cache cleared" });
});

export default router;