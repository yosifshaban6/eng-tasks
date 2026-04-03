import prisma from "../utils/prisma.js";
import { TaskStatus, TaskPriority } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category: string;
  dueDate: Date;
  assigneeId: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: string;
  dueDate?: Date;
  assigneeId?: number;
  archived?: boolean;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;
  search?: string;
  archived?: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

class TaskRepository {
  async findAll() {
    return prisma.task.findMany({
      include: {
        assignee: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number) {
    return prisma.task.findUnique({
      where: { id }, // Make sure id is passed correctly
      include: {
        assignee: true,
        comments: {
          include: {
            author: true,
          },
          orderBy: { createdAt: "desc" },
        },
        activity: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findByAssignee(assigneeId: number) {
    return prisma.task.findMany({
      where: { assigneeId },
      include: { assignee: true },
      orderBy: { dueDate: "asc" },
    });
  }

  async findByStatus(status: TaskStatus) {
    return prisma.task.findMany({
      where: { status },
      include: { assignee: true },
      orderBy: { priority: "desc" },
    });
  }

  async create(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "BACKLOG",
        priority: data.priority || "LOW",
        category: data.category,
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
      },
      include: {
        assignee: true,
      },
    });
  }

  async update(id: number, data: UpdateTaskInput) {
    const { userId, ...taskData } = data as any;

    return prisma.task.update({
      where: { id },
      data: taskData,
      include: {
        assignee: true,
      },
    });
  }

  async delete(id: number) {
    return prisma.task.delete({
      where: { id },
    });
  }

  async archive(id: number) {
    return prisma.task.update({
      where: { id },
      data: { archived: true },
    });
  }

  async restore(id: number) {
    return prisma.task.update({
      where: { id },
      data: { archived: false },
    });
  }

  async findAllWithFilters(filters: any, pagination: any) {
    const { page, limit, sortBy, sortOrder } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Handle archived filter - if specified, use it, otherwise default to false (active tasks only)
    if (filters.archived !== undefined) {
      where.archived = filters.archived;
    } else {
      where.archived = false; // Default: show only active tasks
    }

    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (sortBy === "priority") {
      orderBy.priority = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.task.count({ where }),
    ]);

    // Return paginated result object
    return {
      data: data,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getTaskWithDetails(id: number) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        activity: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    });
  }

  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async addComment(taskId: number, authorId: number, message: string) {
    return prisma.comment.create({
      data: {
        taskId,
        authorId,
        message,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getCommentsByTask(taskId: number) {
    return prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default new TaskRepository();
