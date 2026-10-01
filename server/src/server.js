import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import path from "path";

import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import Message from "./models/Message.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

connectDB();

const app = express();
app.set("trust proxy", 1);

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Apply rate limit specifically to auth routes instead of all routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chat", chatRoutes);



app.get("/", (req, res) => {
  res.json({
    message: "Come Again Restaurant API is running 🚀",
  });
});

// Create HTTP server and initialize Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io connection logic
io.on("connection", (socket) => {
  // Client joins a specific room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  // Handle incoming live chat messages
  socket.on("send_message", async (data) => {
    const { chatRoom, sender, senderName, senderId, text } = data;

    try {
      // 1. Save message to Message collection
      const newMessage = await Message.create({
        chatRoom,
        sender,
        senderName,
        senderId: senderId || null,
        text,
      });

      // 2. Send message to everyone inside this room
      io.to(chatRoom).emit("receive_message", newMessage);

      // 3. Global broadcast so Admin Panel refreshes its active room list instantly
      io.emit("receive_message", newMessage);
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on("disconnect", () => {
    // Clean up on disconnect
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server with WebSockets running on http://localhost:${PORT}`);
});