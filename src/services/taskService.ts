import taskRepository, {
  CreateTaskInput,
  UpdateTaskInput,
} from "../repositories/taskRepository.js";
import activityLogService from "./activityLogService.js";
import prisma from "../utils/prisma.js";

class TaskService {
  async getAllTasks(filters: any, pagination: any) {
    return await taskRepository.findAllWithFilters(filters, pagination);
  }

  async getTaskById(id: number) {
    const task = await taskRepository.getTaskWithDetails(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async getTasksByStatus(status: string) {
    return taskRepository.findByStatus(status as any);
  }

  async getTasksByAssignee(assigneeId: number) {
    return taskRepository.findByAssignee(assigneeId);
  }

  async createTask(data: CreateTaskInput) {
    // Validate assignee exists
    const user = await prisma.user.findUnique({
      where: { id: data.assigneeId },
    });
    if (!user) {
      throw new Error("Assignee not found");
    }

    // Validate due date is in the future (optional)
    if (new Date(data.dueDate) < new Date()) {
      throw new Error("Due date must be in the future");
    }

    const task = await taskRepository.create(data);
    return task;
  }

  async updateTask(id: number, data: UpdateTaskInput, userId: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Log changes before updating
    if (data.status && data.status !== existingTask.status) {
      await activityLogService.logStatusChange(
        id,
        existingTask.status,
        data.status,
        userId,
      );
    }

    if (data.priority && data.priority !== existingTask.priority) {
      await activityLogService.logPriorityChange(
        id,
        existingTask.priority,
        data.priority,
        userId,
      );
    }

    if (data.assigneeId && data.assigneeId !== existingTask.assigneeId) {
      await activityLogService.logAssigneeChange(
        id,
        existingTask.assigneeId,
        data.assigneeId,
        userId,
      );
    }

    // Remove userId from data before passing to repository
    const { userId: _, ...taskData } = data as any;
    const updatedTask = await taskRepository.update(id, taskData);

    return updatedTask;
  }

  async archiveTask(id: number, userId: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const archivedTask = await taskRepository.archive(id);
    await activityLogService.logTaskArchive(id, userId);

    return archivedTask;
  }

  async restoreTask(id: number, userId: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const restoredTask = await taskRepository.restore(id);
    await activityLogService.logTaskRestore(id, userId);

    return restoredTask;
  }

  async addComment(taskId: number, message: string, userId: number) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const comment = await taskRepository.addComment(taskId, userId, message);

    // Log the comment
    await activityLogService.logCommentAdded(taskId, message, userId);

    return comment;
  }

  async deleteTask(id: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    return taskRepository.delete(id);
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
  }
}

export default new TaskService();
