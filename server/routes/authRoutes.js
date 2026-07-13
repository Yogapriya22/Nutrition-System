import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  previewTargets,
  saveTargets,
} from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes — no token required
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes — protect() runs first and blocks the request
// if there's no valid token
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/targets", protect, previewTargets);
router.post("/targets", protect, saveTargets);

export default router;
