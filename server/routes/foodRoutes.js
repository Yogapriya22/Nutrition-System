import express from "express";
import { getFoods } from "../controllers/foodController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All food routes require login — keeps the database from being
// scraped anonymously and keeps things simple (one consistent auth model)
router.get("/", protect, getFoods);

export default router;
