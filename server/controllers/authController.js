import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { calculateTargets } from "../utils/nutritionCalc.js";

// Small helper: creates a signed JWT containing the user's id.
// This token is what the frontend stores and sends back on every
// authenticated request.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route  POST /api/auth/register
// @access Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Password hashing happens automatically via the pre-save hook in User.js
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @route  POST /api/auth/login
// @access Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    // Same error message for "no user" and "wrong password" —
    // this avoids leaking which emails are registered (basic security practice).
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// @route  GET /api/auth/profile
// @access Private (requires token — see authMiddleware.js)
export const getProfile = async (req, res) => {
  // req.user was attached by the protect() middleware
  res.json(req.user);
};

// @route  PUT /api/auth/profile
// @access Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only update fields that were actually sent in the request body
    const fields = [
      "name",
      "age",
      "gender",
      "heightCm",
      "weightKg",
      "activityLevel",
      "goal",
      "dietaryRestrictions",
    ];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Whenever profile fields change, silently keep the calculated
    // targets in sync so the Dashboard/Recommendations pages never show
    // stale numbers without the user having to visit the calculator again.
    const targets = calculateTargets(user);
    if (targets) {
      user.bmr = targets.bmr;
      user.tdee = targets.tdee;
      user.dailyCalorieGoal = targets.calorieTarget;
      user.proteinTargetG = targets.proteinTargetG;
      user.carbsTargetG = targets.carbsTargetG;
      user.fatTargetG = targets.fatTargetG;
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error updating profile", error: error.message });
  }
};

// @route  GET /api/auth/targets
// @access Private
// Returns calculated BMR/TDEE/macro targets from the user's CURRENT saved
// profile, without saving anything. Used by the Recommendations page so
// the user can preview numbers before committing them as their goals.
export const previewTargets = async (req, res) => {
  const targets = calculateTargets(req.user);
  if (!targets) {
    return res.status(400).json({
      message: "Add your age, gender, height and weight to your profile first",
    });
  }
  res.json(targets);
};

// @route  POST /api/auth/targets
// @access Private
// Recalculates targets from the saved profile (optionally overridden by
// values passed in the body, so the calculator can be used interactively
// before saving) and persists them onto the user.
export const saveTargets = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { age, gender, heightCm, weightKg, activityLevel, goal } = req.body;
    const profileInput = {
      age: age ?? user.age,
      gender: gender ?? user.gender,
      heightCm: heightCm ?? user.heightCm,
      weightKg: weightKg ?? user.weightKg,
      activityLevel: activityLevel ?? user.activityLevel,
      goal: goal ?? user.goal,
    };

    const targets = calculateTargets(profileInput);
    if (!targets) {
      return res.status(400).json({
        message: "Add your age, gender, height and weight to your profile first",
      });
    }

    user.bmr = targets.bmr;
    user.tdee = targets.tdee;
    user.dailyCalorieGoal = targets.calorieTarget;
    user.proteinTargetG = targets.proteinTargetG;
    user.carbsTargetG = targets.carbsTargetG;
    user.fatTargetG = targets.fatTargetG;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error saving targets", error: error.message });
  }
};
