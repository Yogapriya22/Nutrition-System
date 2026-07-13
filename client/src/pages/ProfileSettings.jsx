import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const DIET_TAGS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
];

export default function ProfileSettings() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "sedentary",
    goal: "maintain_weight",
    dietaryRestrictions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await api.get("/auth/profile");
      setForm({
        name: data.name || "",
        age: data.age || "",
        gender: data.gender || "",
        heightCm: data.heightCm || "",
        weightKg: data.weightKg || "",
        activityLevel: data.activityLevel || "sedentary",
        goal: data.goal || "maintain_weight",
        dietaryRestrictions: data.dietaryRestrictions || [],
      });
    };
    fetchProfile()
      .catch(() => toast.error("Could not load your profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDiet = (value) => {
    setForm((f) => ({
      ...f,
      dietaryRestrictions: f.dietaryRestrictions.includes(value)
        ? f.dietaryRestrictions.filter((d) => d !== value)
        : [...f.dietaryRestrictions, value],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", form);
      // Keep the cached user (used for the navbar greeting) in sync too
      const cachedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...cachedUser, name: data.name }));
      toast.success("Profile updated");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-400">Loading your profile...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Your health profile</h1>
      <p className="text-gray-500 mt-1">
        This information powers your calorie & macro targets, and recipe suggestions.
      </p>

      <form onSubmit={handleSave} className="mt-8 bg-white border border-gray-100 rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>

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
          <div>
            <label className="text-sm font-medium text-gray-700">Activity level</label>
            <select
              name="activityLevel"
              value={form.activityLevel}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly active</option>
              <option value="moderate">Moderately active</option>
              <option value="active">Active</option>
              <option value="very_active">Very active</option>
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
              <option value="lose_weight">Lose weight</option>
              <option value="maintain_weight">Maintain weight</option>
              <option value="gain_weight">Gain weight</option>
              <option value="build_muscle">Build muscle</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Dietary restrictions</label>
          <div className="flex flex-wrap gap-2">
            {DIET_TAGS.map((tag) => {
              const active = form.dietaryRestrictions.includes(tag.value);
              return (
                <button
                  type="button"
                  key={tag.value}
                  onClick={() => toggleDiet(tag.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    active
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:border-primary-300"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save profile"}
        </button>
        <p className="text-xs text-gray-400">
          Saving your profile automatically refreshes your calorie & macro targets.
        </p>
      </form>
    </div>
  );
}
