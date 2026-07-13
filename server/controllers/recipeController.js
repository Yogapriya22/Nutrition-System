import Recipe from "../models/Recipe.js";

// @route  GET /api/recipes?mealType=lunch&goal=lose_weight&diet=vegan
// @access Private
// Returns recipe suggestions. Defaults `goal` and `diet` filters from the
// logged-in user's own profile if not explicitly passed, so the Recipes
// page can load personalized suggestions with no extra clicks.
export const getRecipes = async (req, res) => {
  try {
    const { mealType, search } = req.query;
    const goal = req.query.goal || req.user.goal;
    const diet = req.query.diet; // explicit single-tag filter, if provided

    const query = {};
    if (mealType) query.mealType = mealType;
    if (goal) query.goalTags = goal;
    if (diet) query.tags = diet;
    if (search) query.name = { $regex: search, $options: "i" };

    const recipes = await Recipe.find(query).sort({ name: 1 });

    // If a goal filter returns nothing (small seed dataset), gracefully
    // fall back to all recipes rather than showing an empty page.
    if (recipes.length === 0 && (goal || diet)) {
      const fallback = await Recipe.find(mealType ? { mealType } : {}).sort({ name: 1 });
      return res.json(fallback);
    }

    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching recipes", error: error.message });
  }
};

// @route  POST /api/recipes/grocery-list
// @access Private
// Body: { items: [{ recipeId, servings }] }
// Aggregates ingredients across the selected recipes (scaled by servings),
// combining matching ingredient+unit pairs into a single grocery line.
export const generateGroceryList = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Select at least one recipe" });
    }

    const recipeIds = items.map((i) => i.recipeId);
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });
    const recipeMap = Object.fromEntries(recipes.map((r) => [r._id.toString(), r]));

    // key = "ingredient name::unit" so we only combine compatible units
    const combined = {};
    const usedRecipes = [];

    items.forEach(({ recipeId, servings }) => {
      const recipe = recipeMap[recipeId];
      if (!recipe) return;

      const multiplier = (Number(servings) || 1) / (recipe.servings || 1);
      usedRecipes.push({ name: recipe.name, servings: Number(servings) || 1 });

      recipe.ingredients.forEach((ing) => {
        const key = `${ing.name.toLowerCase()}::${ing.unit}`;
        const amount = Math.round(ing.amount * multiplier * 10) / 10;
        if (combined[key]) {
          combined[key].amount += amount;
        } else {
          combined[key] = { name: ing.name, unit: ing.unit, amount };
        }
      });
    });

    const groceryList = Object.values(combined)
      .map((item) => ({ ...item, amount: Math.round(item.amount * 10) / 10 }))
      .sort((a, b) => a.name.localeCompare(b.name));

    res.json({ recipes: usedRecipes, groceryList });
  } catch (error) {
    res.status(500).json({ message: "Server error generating grocery list", error: error.message });
  }
};
