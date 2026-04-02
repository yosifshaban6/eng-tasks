import { Request, Response } from "express";
import userService from "../services/userService.js";

export class UserController {
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid user ID",
        });
      }
      
      const user = await userService.getUserById(id);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      const status = (error as Error).message === "User not found" ? 404 : 500;
      res.status(status).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}