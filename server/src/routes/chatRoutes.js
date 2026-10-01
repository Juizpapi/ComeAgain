import express from "express";
import { getChatHistory, getActiveRooms } from "../controllers/chatController.js";

const router = express.Router();

// Fetch message history for a room
router.get("/history/:chatRoom", getChatHistory);

// Fetch all active chat rooms for admin dashboard
router.get("/rooms", getActiveRooms);

export default router;