import { Request, Response } from "express";
import userService from "../services/userService.js";
import cacheService from "../services/cacheService.js";

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const cacheKey = "users_all";

      // Try to get from cache
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      const users = await userService.getAllUsers();
      const responseData = { success: true, data: users };

      // Cache for 5 minutes (users don't change often)
      cacheService.set(cacheKey, responseData, 300000);

      res.json(responseData);
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      const cacheKey = `user_${id}`;

      // Try to get from cache
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid user ID" });
      }

      const user = await userService.getUserById(id);
      const responseData = { success: true, data: user };

      // Cache for 5 minutes
      cacheService.set(cacheKey, responseData, 300000);

      res.json(responseData);
    } catch (error) {
      const status = (error as Error).message === "User not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }
}
