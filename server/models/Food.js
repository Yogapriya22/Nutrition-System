import mongoose from "mongoose";

// Each Food document stores nutrition values PER 100g, so we can scale
// them to any quantity the user logs (see MealLog.js for the math).
const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["fruit", "vegetable", "grain", "protein", "dairy", "snack", "beverage", "other"],
      default: "other",
    },
    caloriesPer100g: { type: Number, required: true },
    proteinPer100g: { type: Number, required: true },
    carbsPer100g: { type: Number, required: true },
    fatPer100g: { type: Number, required: true },
    fiberPer100g: { type: Number, default: 0 },

    // Common dietary tags — used later for recipe/recommendation filtering
    tags: { type: [String], default: [] }, // e.g. ["vegetarian", "vegan", "gluten_free"]
  },
  { timestamps: true }
);

// Text index lets us do fast, typo-tolerant search on the food name
foodSchema.index({ name: "text" });

const Food = mongoose.model("Food", foodSchema);
export default Food;
