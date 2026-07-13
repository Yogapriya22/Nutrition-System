import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Search, Plus, Trash2, Flame } from "lucide-react";
import api from "../utils/api";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

// Small helper: today's date as "YYYY-MM-DD", matching the format
// stored in MealLog.date on the backend.
const todayStr = () => new Date().toISOString().split("T")[0];

export default function MealLogPage() {
  const [date, setDate] = useState(todayStr());
  const [logs, setLogs] = useState([]);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [mealType, setMealType] = useState("breakfast");
  const [adding, setAdding] = useState(false);

  // Reusable fetch so we can call it after adding/deleting a log too
  const fetchLogs = useCallback(async () => {
    const { data } = await api.get(`/meallogs?date=${date}`);
    setLogs(data.logs);
    setTotals(data.totals);
  }, [date]);

  useEffect(() => {
    fetchLogs().catch(() => toast.error("Could not load meal logs"));
  }, [fetchLogs]);

  // Debounced-ish search: fires whenever searchTerm changes.
  // (Simple version — fine for this dataset size; a real debounce
  // would matter more with a large remote API.)
  useEffect(() => {
    const search = async () => {
      const { data } = await api.get(`/foods?search=${searchTerm}`);
      setResults(data);
    };
    search().catch(() => {});
  }, [searchTerm]);

  const handleAddLog = async () => {
    if (!selectedFood) return toast.error("Pick a food first");
    setAdding(true);
    try {
      await api.post("/meallogs", {
        foodId: selectedFood._id,
        quantityGrams: Number(quantity),
        mealType,
        date,
      });
      toast.success(`${selectedFood.name} logged`);
      setSelectedFood(null);
      setSearchTerm("");
      setResults([]);
      setQuantity(100);
      fetchLogs();
    } catch {
      toast.error("Failed to log meal");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/meallogs/${id}`);
      fetchLogs();
    } catch {
      toast.error("Failed to delete log");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Meal Log</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* Daily totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <TotalCard label="Calories" value={totals.calories} unit="kcal" highlight />
        <TotalCard label="Protein" value={totals.protein} unit="g" />
        <TotalCard label="Carbs" value={totals.carbs} unit="g" />
        <TotalCard label="Fat" value={totals.fat} unit="g" />
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {/* Add food form */}
        <div className="md:col-span-1 bg-white border border-gray-100 rounded-2xl p-6 h-fit">
          <h2 className="font-bold text-gray-800 mb-4">Log a food</h2>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search foods (e.g. chicken)"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedFood(null);
              }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {!selectedFood && results.length > 0 && (
            <div className="mt-2 border border-gray-100 rounded-lg max-h-48 overflow-y-auto">
              {results.map((food) => (
                <button
                  key={food._id}
                  onClick={() => {
                    setSelectedFood(food);
                    setResults([]);
                    setSearchTerm(food.name);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-primary-50 flex justify-between"
                >
                  <span>{food.name}</span>
                  <span className="text-gray-400">{food.caloriesPer100g} kcal/100g</span>
                </button>
              ))}
            </div>
          )}

          {selectedFood && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity (grams)</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Meal</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-primary-400"
                >
                  {MEAL_TYPES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400">
                ≈ {Math.round((selectedFood.caloriesPer100g * quantity) / 100)} kcal for this amount
              </p>
              <button
                onClick={handleAddLog}
                disabled={adding}
                className="w-full flex items-center justify-center gap-1 bg-primary-600 text-white font-semibold py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
              >
                <Plus size={16} /> {adding ? "Adding..." : "Add to log"}
              </button>
            </div>
          )}
        </div>

        {/* Logged meals, grouped by meal type */}
        <div className="md:col-span-2 space-y-6">
          {MEAL_TYPES.map((type) => {
            const typeLogs = logs.filter((l) => l.mealType === type);
            if (typeLogs.length === 0) return null;
            return (
              <div key={type} className="bg-white border border-gray-100 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 capitalize mb-3">{type}</h3>
                <div className="space-y-2">
                  {typeLogs.map((log) => (
                    <div
                      key={log._id}
                      className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{log.foodName}</p>
                        <p className="text-gray-400 text-xs">
                          {log.quantityGrams}g · {log.calories} kcal · P{log.protein} C{log.carbs} F{log.fat}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(log._id)}
                        className="text-gray-300 hover:text-red-500 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {logs.length === 0 && (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-sm">
              Nothing logged for this day yet — search for a food on the left to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TotalCard({ label, value, unit, highlight }) {
  return (
    <div
      className={`rounded-2xl p-4 border ${
        highlight ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-100 text-gray-800"
      }`}
    >
      <div className="flex items-center gap-1.5 text-xs font-medium mb-1 opacity-80">
        {highlight && <Flame size={13} />} {label}
      </div>
      <p className="text-xl font-extrabold">
        {Math.round(value)} <span className="text-xs font-medium opacity-70">{unit}</span>
      </p>
    </div>
  );
}
