import { Request, Response } from "express";
import taskService from "../services/taskService";
import { CreateTaskInput } from "../repositories/taskRepository";

export class TaskController {
  async getAllTasks(req: Request, res: Response) {
    try {
      console.log("Query params:", req.query);

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const priority = req.query.priority as string | undefined;
      const assigneeId = req.query.assigneeId
        ? parseInt(req.query.assigneeId as string)
        : undefined;
      const search = req.query.search as string | undefined;
      const sortBy = (req.query.sortBy as string) || "createdAt";
      const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

      // Build filters object
      const filters: any = { archived: false };
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assigneeId) filters.assigneeId = assigneeId;
      if (search) filters.search = search;

      const pagination = { page, limit, sortBy, sortOrder };

      // This now returns { data, total, page, limit, totalPages }
      const result = await taskService.getAllTasks(filters, pagination);

      console.log("Result:", {
        dataLength: result.data.length,
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
      });

      res.json({
        success: true,
        data: result.data, // Now result has 'data' property
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      console.error("Get all tasks error:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
  async getTaskById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      // Validate ID is a number
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task ID",
        });
      }

      const task = await taskService.getTaskById(id);
      res.json({ success: true, data: task });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async getTasksByAssignee(req: Request, res: Response) {
    try {
      const assigneeId = parseInt(req.params.assigneeId as string);

      if (isNaN(assigneeId)) {
        return res.status(400).json({
          success: false,
          error: "Invalid assignee ID",
        });
      }

      const tasks = await taskService.getTasksByAssignee(assigneeId);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  async getTasksByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const tasks = await taskService.getTasksByStatus(status as string);
      res.json({ success: true, data: tasks });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  async createTask(req: Request, res: Response) {
    try {
      const taskData: CreateTaskInput = req.body;

      // Validate required fields
      if (
        !taskData.title ||
        !taskData.category ||
        !taskData.dueDate ||
        !taskData.assigneeId
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Missing required fields: title, category, dueDate, assigneeId",
        });
      }

      const newTask = await taskService.createTask(taskData);
      res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      const status = (error as Error).message.includes("not found") ? 404 : 400;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async updateTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task ID",
        });
      }

      const updateData = req.body;
      const updatedTask = await taskService.updateTask(id, updateData);
      res.json({ success: true, data: updatedTask });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 400;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async deleteTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task ID",
        });
      }

      await taskService.deleteTask(id);
      res.json({ success: true, message: "Task deleted successfully" });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async archiveTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task ID",
        });
      }

      const archivedTask = await taskService.archiveTask(id);
      res.json({ success: true, data: archivedTask, message: "Task archived" });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async restoreTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "Invalid task ID",
        });
      }

      const restoredTask = await taskService.restoreTask(id);
      res.json({ success: true, data: restoredTask, message: "Task restored" });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }
}
