import { Request, Response, NextFunction } from "express";
import cacheService from "../services/cacheService.js";

export const cache = (durationSeconds: number = 60) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `${req.originalUrl}`;
    
    // Try to get from cache
    const cachedData = cacheService.get(cacheKey);
    
    if (cachedData) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.json(cachedData);
    }
    
    console.log(`❌ Cache MISS: ${cacheKey}`);
    
    // Store original send function
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data: any) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cacheService.set(cacheKey, data, durationSeconds * 1000);
      }
      return originalJson(data);
    };
    
    next();
  };
};

// Middleware to invalidate cache on mutations
export const invalidateTaskCache = (req: Request, res: Response, next: NextFunction) => {
  const taskId = req.params.id;
  
  // Store the taskId to invalidate after response
  res.locals.taskId = taskId;
  
  // Override send to invalidate cache after response
  const originalSend = res.send.bind(res);
  res.send = function(data: any) {
    // Invalidate relevant caches
    cacheService.invalidatePattern("/api/v1/tasks");
    if (taskId) {
      cacheService.invalidatePattern(`/api/v1/tasks/${taskId}`);
    }
    cacheService.invalidatePattern("/api/v1/users");
    
    return originalSend(data);
  };
  
  next();
};