import mongoose from "mongoose";

// A MealLog entry represents one food logged by one user, on one date,
// at one meal (breakfast/lunch/dinner/snack), at a specific quantity.
const mealLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },

    // Snapshot the food's name at the time of logging. If the Food
    // document is ever edited later, old logs still show what was
    // actually eaten at the time.
    foodName: { type: String, required: true },

    quantityGrams: { type: Number, required: true, min: 1 },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },

    // Stored as a plain date (no time) string "YYYY-MM-DD" so it's easy
    // to query "everything logged on this day" without timezone headaches.
    date: { type: String, required: true },

    // Computed once at log time from the food's per-100g values,
    // so the dashboard doesn't have to re-calculate or re-join every time.
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
  },
  { timestamps: true }
);

// Most common query: "get all of this user's logs for this date" —
// this compound index makes that lookup fast.
mealLogSchema.index({ user: 1, date: 1 });

const MealLog = mongoose.model("MealLog", mealLogSchema);
export default MealLog;
