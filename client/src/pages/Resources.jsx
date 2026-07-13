import { useState } from "react";
import { BookOpen, ExternalLink, MapPin, Star, Search } from "lucide-react";

const ARTICLES = [
  {
    title: "Understanding Macronutrients",
    summary: "What protein, carbs, and fat actually do in your body, and how to balance them for your goal.",
    tag: "Basics",
    readMins: 6,
  },
  {
    title: "How Many Calories Do You Really Need?",
    summary: "A plain-English walkthrough of BMR, TDEE, and why calorie needs vary so much between people.",
    tag: "Basics",
    readMins: 5,
  },
  {
    title: "Reading a Nutrition Label",
    summary: "Serving sizes, % daily value, and the numbers worth paying attention to.",
    tag: "Basics",
    readMins: 4,
  },
  {
    title: "Protein Timing for Muscle Growth",
    summary: "Does when you eat protein actually matter? What the evidence says about distribution across the day.",
    tag: "Muscle Building",
    readMins: 7,
  },
  {
    title: "Sustainable Weight Loss, Without the Yo-Yo",
    summary: "Why moderate deficits tend to stick better than extreme ones, and how to think about the process.",
    tag: "Weight Loss",
    readMins: 8,
  },
  {
    title: "Eating Well on a Plant-Based Diet",
    summary: "Getting enough protein, iron, and B12 without meat or dairy — practical food pairings included.",
    tag: "Vegetarian & Vegan",
    readMins: 6,
  },
  {
    title: "Meal Prep 101",
    summary: "A simple weekly system for planning, batch-cooking, and storing meals so healthy eating stays easy.",
    tag: "Habits",
    readMins: 5,
  },
  {
    title: "Hydration and Performance",
    summary: "How much water you actually need, and the signs your intake might be off.",
    tag: "Basics",
    readMins: 4,
  },
];

const PROFESSIONALS = [
  {
    name: "Dr. Anjali Rao",
    specialty: "Registered Dietitian — Weight Management",
    credentials: "RD, CDE",
    rating: 4.9,
    location: "Chennai, IN · Also offers video consults",
  },
  {
    name: "Marcus Bell",
    specialty: "Sports Nutritionist — Muscle Building & Performance",
    credentials: "MS, CSSD",
    rating: 4.8,
    location: "Remote / Video consults",
  },
  {
    name: "Dr. Priya Menon",
    specialty: "Clinical Nutritionist — Diabetes & Metabolic Health",
    credentials: "PhD, RD",
    rating: 4.9,
    location: "Chennai, IN",
  },
  {
    name: "Sarah Whitfield",
    specialty: "Plant-Based Nutrition Coach",
    credentials: "RD",
    rating: 4.7,
    location: "Remote / Video consults",
  },
  {
    name: "Dr. Karthik Subramaniam",
    specialty: "Pediatric Nutritionist",
    credentials: "MD, RD",
    rating: 4.8,
    location: "Chennai, IN",
  },
  {
    name: "Elena Petrova",
    specialty: "Eating Disorder Recovery Specialist",
    credentials: "RD, LCSW",
    rating: 5.0,
    location: "Remote / Video consults",
  },
];

const ARTICLE_TAGS = ["All", ...new Set(ARTICLES.map((a) => a.tag))];

export default function Resources() {
  const [activeTag, setActiveTag] = useState("All");
  const [search, setSearch] = useState("");

  const filteredArticles = ARTICLES.filter((a) => activeTag === "All" || a.tag === activeTag);
  const filteredPros = PROFESSIONALS.filter((p) =>
    `${p.name} ${p.specialty}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900">Resources</h1>
      <p className="text-gray-500 mt-1">Learn the fundamentals, or connect with a nutrition professional.</p>

      {/* Educational articles */}
      <section className="mt-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={18} className="text-primary-600" /> Educational articles
          </h2>
          <div className="flex flex-wrap gap-2">
            {ARTICLE_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                  activeTag === tag
                    ? "bg-primary-600 border-primary-600 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-primary-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => (
            <div key={article.title} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-primary-200 transition">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-primary-600">{article.tag}</span>
              <h3 className="font-bold text-gray-800 mt-1.5">{article.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{article.summary}</p>
              <p className="text-xs text-gray-400 mt-3">{article.readMins} min read</p>
            </div>
          ))}
        </div>
      </section>

      {/* Professional directory */}
      <section className="mt-12">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="font-bold text-gray-800">Find a nutrition professional</h2>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={15} />
            <input
              type="text"
              placeholder="Search by name or specialty"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPros.map((pro) => (
            <div key={pro.name} className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">{pro.name}</h3>
                <span className="flex items-center gap-1 text-xs font-semibold text-accent-500">
                  <Star size={13} fill="currentColor" /> {pro.rating}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{pro.specialty}</p>
              <p className="text-xs text-gray-400 mt-1">{pro.credentials}</p>
              <p className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                <MapPin size={13} /> {pro.location}
              </p>
              <button className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-primary-600 border border-primary-200 rounded-lg py-2 hover:bg-primary-50 transition">
                View profile <ExternalLink size={13} />
              </button>
            </div>
          ))}
          {filteredPros.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full text-center py-8">No professionals match your search.</p>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Directory listings are for demonstration purposes. Always verify credentials directly with a provider.
        </p>
      </section>
    </div>
  );
}
