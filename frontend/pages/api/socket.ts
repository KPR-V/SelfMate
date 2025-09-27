import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: {
      io?: Server;
    };
  };
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseServerIO
) {
  if (res.socket.server.io) {
    console.log("✅ Socket.io already running");
  } else {
    console.log("🚀 Initializing Socket.io");
    
    const io = new Server(res.socket.server as any, {
      path: "/api/socket_io",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Join room for match-based chat
      socket.on("join", (roomId: string) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
      });

      socket.on("chat-message", (msg: {
        id: number;
        roomId: string;
        text: string;
        senderId: string;
        timestamp: number;
      }) => {
        console.log("Message received:", msg);
        // Broadcast to all users in the room
        io.to(msg.roomId).emit("chat-message", msg);
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });
  }

  res.end();
}