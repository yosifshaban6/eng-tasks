import prisma from "../utils/prisma";

class ActivityLogService {
  async logStatusChange(
    taskId: number,
    oldStatus: string,
    newStatus: string,
    userId: number,
  ) {
    if (oldStatus === newStatus) return;

    console.log("Logging status change:", {
      taskId,
      oldStatus,
      newStatus,
      userId,
    });

    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "UPDATE",
        field: "status",
        oldValue: oldStatus,
        newValue: newStatus,
      },
    });
  }

  async logPriorityChange(
    taskId: number,
    oldPriority: string,
    newPriority: string,
    userId: number,
  ) {
    if (oldPriority === newPriority) return;

    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "UPDATE",
        field: "priority",
        oldValue: oldPriority,
        newValue: newPriority,
      },
    });
  }

  async logAssigneeChange(
    taskId: number,
    oldAssigneeId: number,
    newAssigneeId: number,
    userId: number,
  ) {
    if (oldAssigneeId === newAssigneeId) return;

    const [oldUser, newUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: oldAssigneeId },
        select: { name: true },
      }),
      prisma.user.findUnique({
        where: { id: newAssigneeId },
        select: { name: true },
      }),
    ]);

    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "UPDATE",
        field: "assignee",
        oldValue: oldUser?.name || `User ${oldAssigneeId}`,
        newValue: newUser?.name || `User ${newAssigneeId}`,
      },
    });
  }

  async logCommentAdded(
    taskId: number,
    commentMessage: string,
    userId: number,
  ) {
    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "COMMENT",
        field: "comment",
        newValue: commentMessage.substring(0, 200),
      },
    });
  }

  async logTaskArchive(taskId: number, userId: number) {
    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "ARCHIVE",
        field: "archived",
        oldValue: "false",
        newValue: "true",
      },
    });
  }

  async logTaskRestore(taskId: number, userId: number) {
    return prisma.activityLog.create({
      data: {
        taskId,
        userId,
        action: "RESTORE",
        field: "archived",
        oldValue: "true",
        newValue: "false",
      },
    });
  }
}

export default new ActivityLogService();
