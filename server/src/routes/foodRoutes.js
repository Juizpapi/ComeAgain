import express from "express";
import {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} from "../controllers/foodController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getFoods);
router.get("/:id", getFoodById);

router.post("/", protect, adminOnly, createFood);

router.put("/:id", protect, adminOnly, updateFood);

router.delete("/:id", protect, adminOnly, deleteFood);

export default router;