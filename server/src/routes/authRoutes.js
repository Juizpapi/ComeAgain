import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  register,
  login,
  googleLogin,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resendVerificationEmail,
  updateProfile,
  uploadAvatar,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.post("/google-login", googleLogin);


router.post("/forgot-password", forgotPassword);



router.post("/reset-password/:token", resetPassword);
/*
router.get("/verify-email/:token", verifyEmail);
*/
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Profile loaded successfully",
    user: req.user,
  });
});
router.put("/profile", protect, updateProfile);
router.post(
  "/avatar",
  protect,
  upload.single("avatar"),
  uploadAvatar
);
export default router;