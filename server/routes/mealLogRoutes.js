import express from "express";
import { addMealLog, getMealLogsByDate, getWeeklyLogs, deleteMealLog } from "../controllers/mealLogController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addMealLog);
router.get("/weekly", protect, getWeeklyLogs);
router.get("/", protect, getMealLogsByDate);
router.delete("/:id", protect, deleteMealLog);

export default router;
