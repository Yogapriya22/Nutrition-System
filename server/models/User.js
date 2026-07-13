import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// The User schema stores login credentials plus the health/profile data
// that later phases (BMR/TDEE calculator, recommendations, tracking)
// will read from. Keeping it here now avoids a painful migration later.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },

    // --- Profile fields used for personalized recommendations later ---
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "other"] },
    heightCm: { type: Number },
    weightKg: { type: Number },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very_active"],
      default: "sedentary",
    },
    goal: {
      type: String,
      enum: ["lose_weight", "maintain_weight", "gain_weight", "build_muscle"],
      default: "maintain_weight",
    },
    dietaryRestrictions: {
      type: [String], // e.g. ["vegetarian", "gluten_free", "lactose_intolerant"]
      default: [],
    },
    dailyCalorieGoal: { type: Number }, // filled in once we build the calculator

    // --- Computed by the BMR/TDEE recommendations feature ---
    bmr: { type: Number },
    tdee: { type: Number },
    proteinTargetG: { type: Number },
    carbsTargetG: { type: Number },
    fatTargetG: { type: Number },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Mongoose "pre-save" hook: runs automatically right before a user document
// is saved. We use it to hash the password so we NEVER store plain text.
userSchema.pre("save", async function (next) {
  // Only re-hash if the password field was actually changed
  // (otherwise updating e.g. weight would re-hash an already-hashed password)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: lets us call user.matchPassword("typedPassword")
// in the login controller instead of repeating bcrypt logic everywhere.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
