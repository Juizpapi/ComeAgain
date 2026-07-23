import express from "express";

import {
  createReview,
  getFoodReviews,
  checkReview,
  getReviewReminders,
  getAllReviews,
} from "../controllers/reviewController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();


// Create a review (logged-in users only)
router.post("/", protect, createReview);

// Check if user already reviewed this food in this order
router.get(
  "/check/:foodId/:orderId",
  protect,
  checkReview
);

// Get homepage customer reviews
router.get("/", getAllReviews);


// Get all reviews for a food
router.get("/food/:foodId", getFoodReviews);

// Get meals waiting for review reminder
router.get(
  "/reminders",
  protect,
  getReviewReminders
);


export default router;