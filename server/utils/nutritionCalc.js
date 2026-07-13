// Shared BMR / TDEE / macro-target math used by the recommendations
// feature. Kept in one place so the "calculate" endpoint and any
// future auto-recalculation (e.g. after a profile edit) stay in sync.

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Calories to add/subtract from TDEE depending on the user's goal.
const GOAL_CALORIE_ADJUSTMENT = {
  lose_weight: -500,
  maintain_weight: 0,
  gain_weight: 500,
  build_muscle: 300,
};

// % of total calories to assign to protein / carbs / fat, per goal.
// Protein is intentionally higher for fat-loss and muscle-building goals.
const GOAL_MACRO_SPLIT = {
  lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  maintain_weight: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  gain_weight: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  build_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

/**
 * Mifflin-St Jeor equation.
 * male:   10*kg + 6.25*cm - 5*age + 5
 * female: 10*kg + 6.25*cm - 5*age - 161
 * other:  average of the male/female offsets, a reasonable neutral default
 */
export function calculateBMR({ weightKg, heightCm, age, gender }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") return Math.round(base + 5);
  if (gender === "female") return Math.round(base - 161);
  return Math.round(base - 78); // "other" — midpoint of the two offsets
}

export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.sedentary;
  return Math.round(bmr * multiplier);
}

/**
 * Given a complete profile, returns BMR, TDEE, a goal-adjusted calorie
 * target, and gram-based macro targets (protein/carbs/fat).
 * Returns null if the profile is missing required fields.
 */
export function calculateTargets({ weightKg, heightCm, age, gender, activityLevel, goal }) {
  if (!weightKg || !heightCm || !age || !gender) return null;

  const bmr = calculateBMR({ weightKg, heightCm, age, gender });
  const tdee = calculateTDEE(bmr, activityLevel);

  const adjustment = GOAL_CALORIE_ADJUSTMENT[goal] ?? 0;
  // Never recommend dropping below a safe minimum floor
  const calorieTarget = Math.max(1200, tdee + adjustment);

  const split = GOAL_MACRO_SPLIT[goal] || GOAL_MACRO_SPLIT.maintain_weight;
  const proteinTargetG = Math.round((calorieTarget * split.protein) / 4);
  const carbsTargetG = Math.round((calorieTarget * split.carbs) / 4);
  const fatTargetG = Math.round((calorieTarget * split.fat) / 9);

  return {
    bmr,
    tdee,
    calorieTarget,
    proteinTargetG,
    carbsTargetG,
    fatTargetG,
  };
}

export { ACTIVITY_MULTIPLIERS, GOAL_CALORIE_ADJUSTMENT, GOAL_MACRO_SPLIT };
