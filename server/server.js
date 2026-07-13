import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import foodRoutes from "./routes/foodRoutes.js";
import mealLogRoutes from "./routes/mealLogRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

dotenv.config(); // loads variables from .env into process.env

connectDB(); // open the MongoDB connection before accepting requests

const app = express();

app.use(cors()); // allows the React frontend (different port) to call this API
app.use(express.json()); // parses incoming JSON request bodies into req.body
app.use(morgan("dev")); // logs each request to the console — handy while developing

// Health check route — quick way to confirm the server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Nutrition Assistant API is running" });
});

// Feature routes — more will be added here in later phases (recipeRoutes, etc.)
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/meallogs", mealLogRoutes);
app.use("/api/recipes", recipeRoutes);

// Catch-all error handler — makes sure unexpected errors return JSON,
// not an HTML stack trace, which the React frontend can't parse.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
