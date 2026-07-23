import express from "express";

import {
  createReview,
  getFoodReviews,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Create a review (logged-in users only)
router.post("/", protect, createReview);


// Get all reviews for a food
router.get("/food/:foodId", getFoodReviews);


export default router;