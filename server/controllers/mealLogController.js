import MealLog from "../models/MealLog.js";
import Food from "../models/Food.js";

// @route  POST /api/meallogs
// @access Private
// Body: { foodId, quantityGrams, mealType, date }
export const addMealLog = async (req, res) => {
  try {
    const { foodId, quantityGrams, mealType, date } = req.body;

    if (!foodId || !quantityGrams || !mealType || !date) {
      return res.status(400).json({ message: "foodId, quantityGrams, mealType and date are all required" });
    }

    const food = await Food.findById(foodId);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // Scale the food's per-100g values to the actual quantity logged.
    // e.g. 150g of a food with 52 cal/100g = 78 calories.
    const scale = quantityGrams / 100;

    const mealLog = await MealLog.create({
      user: req.user._id,
      food: food._id,
      foodName: food.name,
      quantityGrams,
      mealType,
      date,
      calories: Math.round(food.caloriesPer100g * scale),
      protein: Math.round(food.proteinPer100g * scale * 10) / 10,
      carbs: Math.round(food.carbsPer100g * scale * 10) / 10,
      fat: Math.round(food.fatPer100g * scale * 10) / 10,
    });

    res.status(201).json(mealLog);
  } catch (error) {
    res.status(500).json({ message: "Server error logging meal", error: error.message });
  }
};

// @route  GET /api/meallogs?date=2026-07-13
// @access Private
// Returns all of the logged-in user's meal logs for a given date,
// plus a totals summary (used to render the day's progress).
export const getMealLogsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "date query param is required" });

    const logs = await MealLog.find({ user: req.user._id, date }).sort({ createdAt: 1 });

    // Reduce over all logs to build a running total — this is what
    // the dashboard's "calories consumed today" card will read from.
    const totals = logs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ logs, totals });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching meal logs", error: error.message });
  }
};

// @route  GET /api/meallogs/weekly?endDate=2026-07-13
// @access Private
// Returns totals per day for the 7-day window ending on endDate (defaults
// to today), including days with no logs (zero-filled), so the Dashboard's
// weekly chart always has a consistent 7-point x-axis.
export const getWeeklyLogs = async (req, res) => {
  try {
    const end = req.query.endDate ? new Date(req.query.endDate) : new Date();

    // Build the 7 calendar dates (oldest to newest) as "YYYY-MM-DD" strings
    const dateStrings = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(end);
      d.setDate(d.getDate() - i);
      dateStrings.push(d.toISOString().split("T")[0]);
    }

    const logs = await MealLog.find({
      user: req.user._id,
      date: { $in: dateStrings },
    });

    const byDate = Object.fromEntries(
      dateStrings.map((date) => [date, { date, calories: 0, protein: 0, carbs: 0, fat: 0 }])
    );

    logs.forEach((log) => {
      const bucket = byDate[log.date];
      if (!bucket) return;
      bucket.calories += log.calories;
      bucket.protein += log.protein;
      bucket.carbs += log.carbs;
      bucket.fat += log.fat;
    });

    res.json(dateStrings.map((date) => byDate[date]));
  } catch (error) {
    res.status(500).json({ message: "Server error fetching weekly logs", error: error.message });
  }
};

// @route  DELETE /api/meallogs/:id
// @access Private
export const deleteMealLog = async (req, res) => {
  try {
    const log = await MealLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Meal log not found" });

    // Make sure users can only delete their own logs, not anyone else's
    if (log.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this log" });
    }

    await log.deleteOne();
    res.json({ message: "Meal log deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting meal log", error: error.message });
  }
};
