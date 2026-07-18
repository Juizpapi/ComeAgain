import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  initializePayment,
  verifyPayment
} from "../controllers/paymentController.js";


const router = express.Router();


// Start Paystack payment
router.post(
  "/initialize",
  protect,
  initializePayment
);


// Verify Paystack payment
router.post(
  "/verify",
  protect,
  verifyPayment
);


export default router;