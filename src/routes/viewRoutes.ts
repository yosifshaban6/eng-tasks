import { Router } from "express";
import prisma from "../utils/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  res.render("pages/tasks", {
    title: "Task Dashboard",
    currentPage: "tasks",
  });
});

router.get("/archived", async (req, res) => {
  res.render("pages/archived-tasks", {
    title: "Archived Tasks",
    currentPage: "archived",
  });
});

router.get("/task/:id", async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
        activity: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!task) {
      return res.status(404).send("Task not found");
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    res.render("pages/task-detail", {
      title: `${task.title} - Eng Tasks`,
      task,
      users,
      currentPage: "tasks",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default router;
