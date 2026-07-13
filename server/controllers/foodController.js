import Food from "../models/Food.js";

// @route  GET /api/foods?search=chicken
// @access Private
// Returns foods matching a search term, or the first 30 foods if no
// search term is given (used to populate an initial browse list).
export const getFoods = async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};
    if (search) {
      // Case-insensitive partial match on the food name
      query = { name: { $regex: search, $options: "i" } };
    }

    const foods = await Food.find(query).sort({ name: 1 }).limit(30);
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching foods", error: error.message });
  }
};
