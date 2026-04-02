import { Router } from "express";
import { TaskController } from "../controllers/taskController.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators/taskValidator.js";

const router = Router();
const taskController = new TaskController();

/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Get all tasks with pagination and filtering
 *     tags: [Tasks]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10, maximum: 100 }
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [BACKLOG, IN_PROGRESS, BLOCKED, DONE] }
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *         description: Filter by priority
 *       - in: query
 *         name: assigneeId
 *         schema: { type: integer }
 *         description: Filter by assignee ID
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search in title and description
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [createdAt, dueDate, priority], default: createdAt }
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Task' } }
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get(
  "/",
  validate(taskQuerySchema),
  taskController.getAllTasks.bind(taskController),
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID with comments and activity log
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/TaskWithDetails' }
 *       404:
 *         description: Task not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get("/:id", taskController.getTaskById.bind(taskController));

/**
 * @swagger
 * /api/v1/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *               - dueDate
 *               - assigneeId
 *             properties:
 *               title: { type: string, example: "Complete patient report" }
 *               description: { type: string, example: "Finish the discharge summary" }
 *               status: { type: string, enum: [BACKLOG, IN_PROGRESS, BLOCKED, DONE], default: BACKLOG }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT], default: MEDIUM }
 *               category: { type: string, example: "Documentation" }
 *               dueDate: { type: string, format: date-time, example: "2026-04-15T10:00:00Z" }
 *               assigneeId: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.post(
  "/",
  validate(createTaskSchema),
  taskController.createTask.bind(taskController),
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   patch:
 *     summary: Partially update a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               status: { type: string, enum: [BACKLOG, IN_PROGRESS, BLOCKED, DONE] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               category: { type: string }
 *               dueDate: { type: string, format: date-time }
 *               assigneeId: { type: integer }
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *       404:
 *         description: Task not found
 *       400:
 *         description: Validation error
 */
router.patch(
  "/:id",
  validate(updateTaskSchema),
  taskController.updateTask.bind(taskController),
);

/**
 * @swagger
 * /api/v1/tasks/{id}:
 *   delete:
 *     summary: Permanently delete a task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *       404:
 *         description: Task not found
 */
router.delete("/:id", taskController.deleteTask.bind(taskController));

/**
 * @swagger
 * /api/v1/tasks/{id}/archive:
 *   patch:
 *     summary: Archive a task (soft delete)
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *                 message: { type: string }
 *       404:
 *         description: Task not found
 */
router.patch("/:id/archive", taskController.archiveTask.bind(taskController));

/**
 * @swagger
 * /api/v1/tasks/{id}/restore:
 *   patch:
 *     summary: Restore an archived task
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Task' }
 *                 message: { type: string }
 *       404:
 *         description: Task not found
 */
router.patch("/:id/restore", taskController.restoreTask.bind(taskController));

/**
 * @swagger
 * /api/v1/tasks/status/{status}:
 *   get:
 *     summary: Get tasks by status
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema: { type: string, enum: [BACKLOG, IN_PROGRESS, BLOCKED, DONE] }
 *         description: Task status
 *     responses:
 *       200:
 *         description: List of tasks with the specified status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Task' } }
 */
router.get(
  "/status/:status",
  taskController.getTasksByStatus.bind(taskController),
);

/**
 * @swagger
 * /api/v1/tasks/assignee/{assigneeId}:
 *   get:
 *     summary: Get tasks assigned to a specific user
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: assigneeId
 *         required: true
 *         schema: { type: integer }
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of tasks assigned to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { type: array, items: { $ref: '#/components/schemas/Task' } }
 */
router.get(
  "/assignee/:assigneeId",
  taskController.getTasksByAssignee.bind(taskController),
);

/**
 * @swagger
 * /api/v1/tasks/{id}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Working on this task now"
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     taskId: { type: integer }
 *                     authorId: { type: integer }
 *                     message: { type: string }
 *                     createdAt: { type: string, format: date-time }
 *                     author:
 *                       type: object
 *                       properties:
 *                         id: { type: integer }
 *                         name: { type: string }
 *                         email: { type: string }
 *       400:
 *         description: Validation error
 *       404:
 *         description: Task not found
 */
router.post(
  "/:id/comments",
  validate(commentSchema),
  taskController.addComment.bind(taskController),
);
export default router;
