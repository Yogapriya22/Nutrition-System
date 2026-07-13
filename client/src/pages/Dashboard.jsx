import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Flame, Beef, Wheat, Droplet, Settings, UtensilsCrossed, ChefHat, BookOpen } from "lucide-react";
import api from "../utils/api";

const todayStr = () => new Date().toISOString().split("T")[0];

const QUICK_LINKS = [
  { to: "/meals", icon: UtensilsCrossed, title: "Log a meal", desc: "Track what you ate today" },
  { to: "/recommendations", icon: Flame, title: "My targets", desc: "BMR, TDEE & macro goals" },
  { to: "/recipes", icon: ChefHat, title: "Recipes", desc: "Find meals & build a grocery list" },
  { to: "/resources", icon: BookOpen, title: "Resources", desc: "Guides & find a dietitian" },
];

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [weekly, setWeekly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [profileRes, todayRes, weeklyRes] = await Promise.all([
        api.get("/auth/profile"),
        api.get(`/meallogs?date=${todayStr()}`),
        api.get("/meallogs/weekly"),
      ]);
      setProfile(profileRes.data);
      setTotals(todayRes.data.totals);
      setWeekly(
        weeklyRes.data.map((d) => ({
          ...d,
          label: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }),
        }))
      );
    };
    load()
      .catch(() => toast.error("Could not load your dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const profileComplete = profile && profile.age && profile.gender && profile.heightCm && profile.weightKg;
  const hasTargets = profile?.dailyCalorieGoal;

  const calorieGoal = profile?.dailyCalorieGoal || 2000;
  const proteinGoal = profile?.proteinTargetG || 0;
  const carbsGoal = profile?.carbsTargetG || 0;
  const fatGoal = profile?.fatTargetG || 0;

  const weeklyAvgCalories = useMemo(() => {
    if (weekly.length === 0) return 0;
    return Math.round(weekly.reduce((sum, d) => sum + d.calories, 0) / weekly.length);
  }, [weekly]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-6 py-16 text-center text-gray-400">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Hi{profile ? `, ${profile.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's how today is looking against your goals.</p>
        </div>
        <Link
          to="/profile"
          className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 border border-gray-200 hover:border-primary-300 rounded-lg px-4 py-2 transition"
        >
          <Settings size={16} /> Edit profile
        </Link>
      </div>

      {!profileComplete && (
        <div className="mt-6 bg-accent-500/10 border border-accent-400/40 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-accent-500 font-medium">
            Add your age, gender, height and weight to unlock personalized calorie & macro targets.
          </p>
          <Link
            to="/profile"
            className="bg-accent-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-400 transition shrink-0"
          >
            Complete profile
          </Link>
        </div>
      )}

      {profileComplete && !hasTargets && (
        <div className="mt-6 bg-primary-50 border border-primary-100 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-primary-700 font-medium">
            Your profile is complete — calculate your BMR/TDEE to set daily calorie & macro targets.
          </p>
          <Link
            to="/recommendations"
            className="bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition shrink-0"
          >
            Calculate my targets
          </Link>
        </div>
      )}

      {/* Today's progress */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <ProgressCard
          icon={<Flame size={16} />}
          label="Calories"
          value={totals.calories}
          goal={calorieGoal}
          unit="kcal"
          highlight
        />
        <ProgressCard icon={<Beef size={16} />} label="Protein" value={totals.protein} goal={proteinGoal} unit="g" />
        <ProgressCard icon={<Wheat size={16} />} label="Carbs" value={totals.carbs} goal={carbsGoal} unit="g" />
        <ProgressCard icon={<Droplet size={16} />} label="Fat" value={totals.fat} goal={fatGoal} unit="g" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mt-8">
        {/* Weekly chart */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Calories — last 7 days</h2>
            <span className="text-xs text-gray-400">Avg {weeklyAvgCalories} kcal/day</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weekly} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f4" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "#f0fdf4" }}
                formatter={(value) => [`${Math.round(value)} kcal`, "Calories"]}
                contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f4", fontSize: 13 }}
              />
              {hasTargets && (
                <ReferenceLine y={calorieGoal} stroke="#f97316" strokeDasharray="4 4" label={{ value: "Goal", position: "insideTopRight", fill: "#f97316", fontSize: 11 }} />
              )}
              <Bar dataKey="calories" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick links */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-bold text-gray-800 mb-4">Quick actions</h2>
          <div className="space-y-3">
            {QUICK_LINKS.map(({ to, icon: Icon, title, desc }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition group"
              >
                <div className="bg-primary-50 group-hover:bg-white w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-primary-600 transition">
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ icon, label, value, goal, unit, highlight }) {
  const pct = goal > 0 ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-100 text-gray-800"}`}>
      <div className={`flex items-center gap-1.5 text-xs font-medium mb-2 ${highlight ? "opacity-90" : "text-gray-400"}`}>
        {icon} {label}
      </div>
      <p className="text-xl font-extrabold">
        {Math.round(value)}
        {goal > 0 && <span className="text-sm font-medium opacity-70"> / {goal}</span>}
        <span className="text-xs font-medium opacity-70"> {unit}</span>
      </p>
      {goal > 0 ? (
        <div className={`mt-2 h-1.5 rounded-full overflow-hidden ${highlight ? "bg-white/25" : "bg-gray-100"}`}>
          <div
            className={`h-full rounded-full ${highlight ? "bg-white" : "bg-primary-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : (
        <p className={`mt-2 text-xs ${highlight ? "opacity-80" : "text-gray-400"}`}>Set a target to track progress</p>
      )}
    </div>
  );
}
