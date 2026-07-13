import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Food from "../models/Food.js";

dotenv.config();

// A curated list of common foods with nutrition values PER 100g.
// This avoids needing a paid/rate-limited external API for the MVP —
// good enough for demoing meal logging end-to-end. Can be swapped for
// USDA FoodData Central later without changing any other code, since
// everything else just queries the Food collection.
const foods = [
  // Fruits
  { name: "Apple", category: "fruit", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, fiberPer100g: 2.4, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Banana", category: "fruit", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, fiberPer100g: 2.6, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Orange", category: "fruit", caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, fiberPer100g: 2.4, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Mango", category: "fruit", caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, fiberPer100g: 1.6, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Grapes", category: "fruit", caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, fiberPer100g: 0.9, tags: ["vegan", "vegetarian", "gluten_free"] },

  // Vegetables
  { name: "Broccoli", category: "vegetable", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, fiberPer100g: 2.6, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Spinach", category: "vegetable", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 2.2, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Carrot", category: "vegetable", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 2.8, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Potato (boiled)", category: "vegetable", caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, fiberPer100g: 1.8, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Tomato", category: "vegetable", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, fiberPer100g: 1.2, tags: ["vegan", "vegetarian", "gluten_free"] },

  // Grains
  { name: "White Rice (cooked)", category: "grain", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Brown Rice (cooked)", category: "grain", caloriesPer100g: 123, proteinPer100g: 2.7, carbsPer100g: 26, fatPer100g: 1.0, fiberPer100g: 1.6, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Roti / Chapati", category: "grain", caloriesPer100g: 297, proteinPer100g: 9, carbsPer100g: 58, fatPer100g: 4, fiberPer100g: 5, tags: ["vegan", "vegetarian"] },
  { name: "Oats (dry)", category: "grain", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, fiberPer100g: 10, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "White Bread", category: "grain", caloriesPer100g: 265, proteinPer100g: 9, carbsPer100g: 49, fatPer100g: 3.2, fiberPer100g: 2.7, tags: ["vegetarian"] },
  { name: "Pasta (cooked)", category: "grain", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, tags: ["vegetarian"] },

  // Protein
  { name: "Chicken Breast (cooked)", category: "protein", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, fiberPer100g: 0, tags: ["gluten_free"] },
  { name: "Egg (whole, boiled)", category: "protein", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, fiberPer100g: 0, tags: ["vegetarian", "gluten_free"] },
  { name: "Salmon (cooked)", category: "protein", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, fiberPer100g: 0, tags: ["gluten_free"] },
  { name: "Paneer", category: "protein", caloriesPer100g: 265, proteinPer100g: 18, carbsPer100g: 3.4, fatPer100g: 20, fiberPer100g: 0, tags: ["vegetarian", "gluten_free"] },
  { name: "Tofu", category: "protein", caloriesPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, fiberPer100g: 0.3, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Chickpeas (cooked)", category: "protein", caloriesPer100g: 164, proteinPer100g: 9, carbsPer100g: 27, fatPer100g: 2.6, fiberPer100g: 7.6, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Lentils / Dal (cooked)", category: "protein", caloriesPer100g: 116, proteinPer100g: 9, carbsPer100g: 20, fatPer100g: 0.4, fiberPer100g: 8, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Almonds", category: "protein", caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50, fiberPer100g: 12.5, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Peanut Butter", category: "protein", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, fiberPer100g: 6, tags: ["vegetarian", "gluten_free"] },

  // Dairy
  { name: "Milk (whole)", category: "dairy", caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3, fiberPer100g: 0, tags: ["vegetarian", "gluten_free"] },
  { name: "Greek Yogurt (plain)", category: "dairy", caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4, fiberPer100g: 0, tags: ["vegetarian", "gluten_free"] },
  { name: "Cheddar Cheese", category: "dairy", caloriesPer100g: 403, proteinPer100g: 25, carbsPer100g: 1.3, fatPer100g: 33, fiberPer100g: 0, tags: ["vegetarian", "gluten_free"] },

  // Snacks / Beverages
  { name: "Dark Chocolate", category: "snack", caloriesPer100g: 546, proteinPer100g: 4.9, carbsPer100g: 61, fatPer100g: 31, fiberPer100g: 7, tags: ["vegetarian", "gluten_free"] },
  { name: "Potato Chips", category: "snack", caloriesPer100g: 536, proteinPer100g: 7, carbsPer100g: 53, fatPer100g: 35, fiberPer100g: 4.4, tags: ["vegetarian"] },
  { name: "Orange Juice", category: "beverage", caloriesPer100g: 45, proteinPer100g: 0.7, carbsPer100g: 10, fatPer100g: 0.2, fiberPer100g: 0.2, tags: ["vegan", "vegetarian", "gluten_free"] },
  { name: "Black Coffee", category: "beverage", caloriesPer100g: 1, proteinPer100g: 0.1, carbsPer100g: 0, fatPer100g: 0, fiberPer100g: 0, tags: ["vegan", "vegetarian", "gluten_free"] },
];

const seed = async () => {
  await connectDB();
  try {
    await Food.deleteMany(); // clear existing foods so re-running this script doesn't create duplicates
    await Food.insertMany(foods);
    console.log(`Seeded ${foods.length} foods successfully.`);
  } catch (error) {
    console.error("Seeding error:", error.message);
  } finally {
    process.exit();
  }
};

seed();
