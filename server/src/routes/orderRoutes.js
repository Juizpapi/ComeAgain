import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/my-orders", protect, getMyOrders);

router.get("/", protect, getAllOrders);

router.put("/:id/status", protect, adminOnly, updateOrderStatus);

router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;