import { Server } from "socket.io";

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id);

    socket.on("join-task", (taskId: number) => {
      const room = `task-${taskId}`;
      socket.join(room);
      console.log(`📌 Client ${socket.id} joined task ${taskId}`);
    });

    socket.on("leave-task", (taskId: number) => {
      const room = `task-${taskId}`;
      socket.leave(room);
      console.log(`🚪 Client ${socket.id} left task ${taskId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized!");
  return io;
};

// WebSocket event emitters
export const emitTaskUpdate = (taskId: number, event: string, data: any) => {
  const io = getIO();
  io.to(`task-${taskId}`).emit(event, {
    ...data,
    taskId,
    timestamp: new Date(),
  });
};

export const emitCommentAdded = (taskId: number, comment: any) => {
  const io = getIO();
  io.to(`task-${taskId}`).emit("comment-added", {
    taskId,
    comment,
    timestamp: new Date(),
  });
};

export const emitStatusChanged = (taskId: number, oldStatus: string, newStatus: string, userId: number) => {
  const io = getIO();
  io.to(`task-${taskId}`).emit("status-changed", {
    taskId,
    oldStatus,
    newStatus,
    userId,
    timestamp: new Date(),
  });
};
