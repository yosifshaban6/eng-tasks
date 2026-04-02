import taskRepository, {
  CreateTaskInput,
  UpdateTaskInput,
} from "../repositories/taskRepository";
import prisma from "../utils/prisma";

class TaskService {
  async getAllTasks(filters: any, pagination: any) {
    return await taskRepository.findAllWithFilters(filters, pagination);
  }

  async getTaskById(id: number) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async getTasksByAssignee(assigneeId: number) {
    return taskRepository.findByAssignee(assigneeId);
  }

  async getTasksByStatus(status: string) {
    return taskRepository.findByStatus(status as any);
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
    if (data.dueDate < new Date()) {
      throw new Error("Due date must be in the future");
    }

    return taskRepository.create(data);
  }

  async updateTask(id: number, data: UpdateTaskInput) {
    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    // If assignee is being updated, validate new assignee exists
    if (data.assigneeId) {
      const user = await prisma.user.findUnique({
        where: { id: data.assigneeId },
      });
      if (!user) {
        throw new Error("New assignee not found");
      }
    }

    return taskRepository.update(id, data);
  }

  async deleteTask(id: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    return taskRepository.delete(id);
  }

  async archiveTask(id: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    return taskRepository.archive(id);
  }

  async restoreTask(id: number) {
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    return taskRepository.restore(id);
  }

  async addComment(taskId: number, authorId: number, message: string) {
    // Check if task exists
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Add comment
    const comment = await taskRepository.addComment(taskId, authorId, message);

    // Log activity (optional but good for tracking)
    await activityLogService.logChange(
      taskId,
      authorId,
      "COMMENT",
      "comment",
      null,
      message,
    );

    return comment;
  }
}

export default new TaskService();
