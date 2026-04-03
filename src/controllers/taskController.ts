import { Request, Response } from "express";
import taskService from "../services/taskService.js";
import { CreateTaskInput } from "../repositories/taskRepository.js";
import cacheService from "../services/cacheService.js";

export class TaskController {
  async getAllTasks(req: Request, res: Response) {
    try {
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

      // Get archived parameter - default to false if not specified
      let archived = false;
      if (req.query.archived === "true") {
        archived = true;
      } else if (req.query.archived === "false") {
        archived = false;
      }
      // If archived is not in query, it will be undefined and handled by repository default

      // Build filters object
      const filters: any = {};

      // Only add archived filter if explicitly specified
      if (req.query.archived !== undefined) {
        filters.archived = archived;
      }

      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      if (assigneeId) filters.assigneeId = assigneeId;
      if (search) filters.search = search;

      const pagination = { page, limit, sortBy, sortOrder };
      const result = await taskService.getAllTasks(filters, pagination);

      res.json({
        success: true,
        data: result.data,
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
      const cacheKey = `task_${id}`;

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
          .json({ success: false, error: "Invalid task ID" });
      }

      const task = await taskService.getTaskById(id);
      const responseData = { success: true, data: task };

      // Cache for 30 seconds
      cacheService.set(cacheKey, responseData, 30000);

      res.json(responseData);
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

      // Invalidate task list caches
      cacheService.invalidatePattern("/api/v1/tasks");

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
        return res
          .status(400)
          .json({ success: false, error: "Invalid task ID" });
      }

      const { userId, ...updateData } = req.body;

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "userId is required" });
      }

      const updatedTask = await taskService.updateTask(id, updateData, userId);

      // Invalidate caches for this task and task lists
      cacheService.invalidatePattern(`task_${id}`);
      cacheService.invalidatePattern("/api/v1/tasks");

      res.json({ success: true, data: updatedTask });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 400;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  // Add similar cache invalidation to deleteTask, archiveTask, restoreTask, addComment
  async deleteTask(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string);

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid task ID" });
      }

      await taskService.deleteTask(id);

      // Invalidate caches
      cacheService.invalidatePattern(`task_${id}`);
      cacheService.invalidatePattern("/api/v1/tasks");

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
      const { userId } = req.body;

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid task ID" });
      }

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "userId is required" });
      }

      const archivedTask = await taskService.archiveTask(id, userId);

      // Invalidate caches
      cacheService.invalidatePattern(`task_${id}`);
      cacheService.invalidatePattern("/api/v1/tasks");

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
      const { userId } = req.body;

      if (isNaN(id)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid task ID" });
      }

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "userId is required" });
      }

      const restoredTask = await taskService.restoreTask(id, userId);

      // Invalidate caches
      cacheService.invalidatePattern(`task_${id}`);
      cacheService.invalidatePattern("/api/v1/tasks");

      res.json({ success: true, data: restoredTask, message: "Task restored" });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const taskId = parseInt(req.params.id as string);
      const { message, userId } = req.body;

      if (isNaN(taskId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid task ID" });
      }

      if (!message) {
        return res
          .status(400)
          .json({ success: false, error: "Message is required" });
      }

      if (!userId) {
        return res
          .status(400)
          .json({ success: false, error: "userId is required" });
      }

      const comment = await taskService.addComment(taskId, message, userId);

      // Invalidate task cache to show new comment
      cacheService.invalidatePattern(`task_${taskId}`);

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      const status = (error as Error).message === "Task not found" ? 404 : 500;
      res
        .status(status)
        .json({ success: false, error: (error as Error).message });
    }
  }
}
