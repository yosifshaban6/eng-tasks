import { z } from "zod";

export const TaskStatusEnum = z.enum([
  "BACKLOG",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
]);

export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200),
    description: z.string().min(1),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    category: z.string().min(1).max(100),
    dueDate: z.string().datetime(),
    assigneeId: z.number().int().positive(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    category: z.string().min(1).max(100).optional(),
    dueDate: z.string().datetime().optional(),
    assigneeId: z.number().int().positive().optional(),
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    assigneeId: z.coerce.number().int().positive().optional(),
    search: z.string().optional(),
    sortBy: z.enum(["createdAt", "dueDate", "priority"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const commentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    message: z.string().min(1).max(1000),
  }),
});
