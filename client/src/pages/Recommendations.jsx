import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Flame, Zap, Target } from "lucide-react";
import api from "../utils/api";

const ACTIVITY_OPTIONS = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Lightly active (1-3 days/week)" },
  { value: "moderate", label: "Moderately active (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very_active", label: "Very active (hard exercise daily)" },
];

const GOAL_OPTIONS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain_weight", label: "Maintain weight" },
  { value: "gain_weight", label: "Gain weight" },
  { value: "build_muscle", label: "Build muscle" },
];

const MACRO_COLORS = { protein: "#16a34a", carbs: "#4ade80", fat: "#f97316" };

// Mirrors server/utils/nutritionCalc.js so "Calculate" can preview
// instantly client-side without writing to the database. The backend
// recomputes independently when "Save" is clicked, so it's the source
// of truth — this is purely for a snappy preview.
const ACTIVITY_MULTIPLIERS = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
const GOAL_CALORIE_ADJUSTMENT = { lose_weight: -500, maintain_weight: 0, gain_weight: 500, build_muscle: 300 };
const GOAL_MACRO_SPLIT = {
  lose_weight: { protein: 0.35, carbs: 0.35, fat: 0.3 },
  maintain_weight: { protein: 0.25, carbs: 0.45, fat: 0.3 },
  gain_weight: { protein: 0.25, carbs: 0.5, fat: 0.25 },
  build_muscle: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

function computeTargets({ age, gender, heightCm, weightKg, activityLevel, goal }) {
  const a = Number(age), h = Number(heightCm), w = Number(weightKg);
  const base = 10 * w + 6.25 * h - 5 * a;
  const bmr = Math.round(gender === "male" ? base + 5 : gender === "female" ? base - 161 : base - 78);
  const tdee = Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
  const calorieTarget = Math.max(1200, tdee + (GOAL_CALORIE_ADJUSTMENT[goal] ?? 0));
  const split = GOAL_MACRO_SPLIT[goal] || GOAL_MACRO_SPLIT.maintain_weight;
  return {
    bmr,
    tdee,
    calorieTarget,
    proteinTargetG: Math.round((calorieTarget * split.protein) / 4),
    carbsTargetG: Math.round((calorieTarget * split.carbs) / 4),
    fatTargetG: Math.round((calorieTarget * split.fat) / 9),
  };
}

export default function Recommendations() {
  const [form, setForm] = useState(null); // profile-derived calculator inputs
  const [preview, setPreview] = useState(null); // live-computed targets (not yet saved)
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/auth/profile");
      setForm({
        age: data.age || "",
        gender: data.gender || "",
        heightCm: data.heightCm || "",
        weightKg: data.weightKg || "",
        activityLevel: data.activityLevel || "sedentary",
        goal: data.goal || "maintain_weight",
      });
      if (data.dailyCalorieGoal) {
        setPreview({
          bmr: data.bmr,
          tdee: data.tdee,
          calorieTarget: data.dailyCalorieGoal,
          proteinTargetG: data.proteinTargetG,
          carbsTargetG: data.carbsTargetG,
          fatTargetG: data.fatTargetG,
        });
      }
    };
    load()
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const complete = form && form.age && form.gender && form.heightCm && form.weightKg;

  const handleCalculate = (e) => {
    e.preventDefault();
    if (!complete) return toast.error("Fill in age, gender, height and weight first");
    setPreview(computeTargets(form));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("/auth/targets", form);
      toast.success("Saved as your daily targets");
    } catch {
      toast.error("Failed to save targets");
    } finally {
      setSaving(false);
    }
  };

  const macroData = preview
    ? [
        { name: "Protein", value: preview.proteinTargetG, grams: preview.proteinTargetG, key: "protein" },
        { name: "Carbs", value: preview.carbsTargetG, grams: preview.carbsTargetG, key: "carbs" },
        { name: "Fat", value: preview.fatTargetG, grams: preview.fatTargetG, key: "fat" },
      ]
    : [];

  if (loading) {
    return <div className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-400">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Personalized recommendations</h1>
      <p className="text-gray-500 mt-1">
        We use the Mifflin-St Jeor formula to estimate your BMR, then scale it to your activity level and goal.
      </p>

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {/* Calculator form */}
        <form onSubmit={handleCalculate} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4 h-fit">
          <h2 className="font-bold text-gray-800 mb-2">Your details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Height (cm)</label>
              <input
                type="number"
                name="heightCm"
                value={form.heightCm}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                name="weightKg"
                value={form.weightKg}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Activity level</label>
            <select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Goal</label>
            <select
              name="goal"
              value={form.goal}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-600 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition"
          >
            Calculate
          </button>
          {!complete && (
            <p className="text-xs text-gray-400">
              Missing details? <Link to="/profile" className="text-primary-600 font-medium">Update your profile</Link> or fill them in above.
            </p>
          )}
        </form>

        {/* Results */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-4">Your results</h2>
          {!preview ? (
            <div className="text-center text-gray-400 text-sm py-16 border border-dashed border-gray-200 rounded-xl">
              Fill in your details and hit Calculate to see your numbers.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={<Zap size={16} />} label="BMR" value={preview.bmr} unit="kcal/day" />
                <StatCard icon={<Flame size={16} />} label="TDEE" value={preview.tdee} unit="kcal/day" />
              </div>
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
                <div className="bg-primary-600 text-white w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                  <Target size={18} />
                </div>
                <div>
                  <p className="text-xs text-primary-700 font-medium">Daily calorie target</p>
                  <p className="text-xl font-extrabold text-primary-700">{preview.calorieTarget} kcal</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Macro breakdown</p>
                <div className="flex items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={macroData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                        {macroData.map((entry) => (
                          <Cell key={entry.key} fill={MACRO_COLORS[entry.key]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} g`} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gray-900 text-white font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save as my daily targets"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Saved targets show up as progress bars on your Dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 mb-1">
        {icon} {label}
      </div>
      <p className="text-lg font-extrabold text-gray-800">
        {value} <span className="text-xs font-medium text-gray-400">{unit}</span>
      </p>
    </div>
  );
}
