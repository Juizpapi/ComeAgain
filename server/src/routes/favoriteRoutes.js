import express from "express";
import {
  toggleFavorite,
  getFavorites,
} from "../controllers/favoriteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all favorites for logged-in user
router.get("/", protect, getFavorites);

// Add/Remove favorite
router.post("/:foodId", protect, toggleFavorite);

export default router;