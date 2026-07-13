import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Clock, Flame, Plus, Check, ShoppingCart, X } from "lucide-react";
import api from "../utils/api";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [mealType, setMealType] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({}); // { recipeId: servings }
  const [groceryList, setGroceryList] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchRecipes = async (type) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/recipes${type ? `?mealType=${type}` : ""}`);
      setRecipes(data);
    } catch {
      toast.error("Could not load recipes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(mealType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealType]);

  const toggleSelect = (recipe) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[recipe._id]) {
        delete next[recipe._id];
      } else {
        next[recipe._id] = recipe.servings || 1;
      }
      return next;
    });
  };

  const updateServings = (recipeId, servings) => {
    setSelected((prev) => ({ ...prev, [recipeId]: Math.max(1, Number(servings) || 1) }));
  };

  const selectedCount = Object.keys(selected).length;

  const handleGenerateList = async () => {
    if (selectedCount === 0) return toast.error("Select at least one recipe");
    setGenerating(true);
    try {
      const items = Object.entries(selected).map(([recipeId, servings]) => ({ recipeId, servings }));
      const { data } = await api.post("/recipes/grocery-list", { items });
      setGroceryList(data);
    } catch {
      toast.error("Could not generate grocery list");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Recipe suggestions</h1>
          <p className="text-gray-500 mt-1">Personalized to your goal and dietary preferences.</p>
        </div>
        {selectedCount > 0 && (
          <button
            onClick={handleGenerateList}
            disabled={generating}
            className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-primary-700 transition disabled:opacity-60"
          >
            <ShoppingCart size={16} />
            {generating ? "Building list..." : `Generate grocery list (${selectedCount})`}
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mt-6">
        <FilterChip active={mealType === ""} onClick={() => setMealType("")}>
          All
        </FilterChip>
        {MEAL_TYPES.map((type) => (
          <FilterChip key={type} active={mealType === type} onClick={() => setMealType(type)}>
            {type[0].toUpperCase() + type.slice(1)}
          </FilterChip>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-16">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No recipes found for this filter.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              isSelected={!!selected[recipe._id]}
              servings={selected[recipe._id] || recipe.servings || 1}
              onToggle={() => toggleSelect(recipe)}
              onServingsChange={(v) => updateServings(recipe._id, v)}
            />
          ))}
        </div>
      )}

      {groceryList && <GroceryListModal data={groceryList} onClose={() => setGroceryList(null)} />}
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
        active ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-primary-300"
      }`}
    >
      {children}
    </button>
  );
}

function RecipeCard({ recipe, isSelected, servings, onToggle, onServingsChange }) {
  return (
    <div
      className={`bg-white border rounded-2xl p-5 flex flex-col transition ${
        isSelected ? "border-primary-400 ring-2 ring-primary-100" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">{recipe.mealType}</span>
          <h3 className="font-bold text-gray-800 mt-1">{recipe.name}</h3>
        </div>
        <button
          onClick={onToggle}
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition ${
            isSelected ? "bg-primary-600 text-white" : "bg-primary-50 text-primary-600 hover:bg-primary-100"
          }`}
          title={isSelected ? "Remove from grocery list" : "Add to grocery list"}
        >
          {isSelected ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-2 flex-1">{recipe.description}</p>

      <div className="flex items-center gap-4 text-xs text-gray-400 mt-3">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {recipe.prepTimeMinutes} min
        </span>
        <span className="flex items-center gap-1">
          <Flame size={13} /> {recipe.caloriesPerServing} kcal
        </span>
        <span>
          P{recipe.proteinPerServing} C{recipe.carbsPerServing} F{recipe.fatPerServing}
        </span>
      </div>

      {recipe.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.tags.map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full capitalize">
              {tag.replace("_", " ")}
            </span>
          ))}
        </div>
      )}

      {isSelected && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <label className="text-xs text-gray-500">Servings</label>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => onServingsChange(e.target.value)}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function GroceryListModal({ data, onClose }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-gray-800 text-lg">Grocery list</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          From {data.recipes.map((r) => r.name).join(", ")}
        </p>
        <ul className="space-y-2">
          {data.groceryList.map((item) => (
            <li
              key={`${item.name}-${item.unit}`}
              className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0"
            >
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-400 font-medium">
                {item.amount} {item.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
