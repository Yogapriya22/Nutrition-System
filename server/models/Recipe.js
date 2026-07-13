import mongoose from "mongoose";

// Recipes power two features at once: suggestion browsing (Phase 5) and
// the auto-generated grocery list, which just aggregates the
// `ingredients` arrays of whichever recipes the user selects.
const recipeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },

    // Diet tags let us filter suggestions against the user's
    // dietaryRestrictions (e.g. only show "vegan" recipes).
    tags: { type: [String], default: [] },

    // Goal tags let us bias suggestions toward the user's stated goal
    // (e.g. high-protein recipes for "build_muscle").
    goalTags: { type: [String], default: [] },

    prepTimeMinutes: { type: Number, default: 15 },
    servings: { type: Number, default: 1 },

    // Nutrition PER SERVING
    caloriesPerServing: { type: Number, required: true },
    proteinPerServing: { type: Number, required: true },
    carbsPerServing: { type: Number, required: true },
    fatPerServing: { type: Number, required: true },

    ingredients: {
      type: [
        {
          name: { type: String, required: true },
          amount: { type: Number, required: true },
          unit: { type: String, required: true }, // g, ml, tsp, tbsp, piece...
        },
      ],
      default: [],
    },

    instructions: { type: [String], default: [] },
  },
  { timestamps: true }
);

recipeSchema.index({ name: "text" });

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
