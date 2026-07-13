import express from "express";
import { getRecipes, generateGroceryList } from "../controllers/recipeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getRecipes);
router.post("/grocery-list", protect, generateGroceryList);

export default router;
