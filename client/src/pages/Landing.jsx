import { Link } from "react-router-dom";
import { Apple, LineChart, ClipboardList, Sparkles, ShoppingCart, Users } from "lucide-react";

const features = [
  {
    icon: <ClipboardList className="text-primary-600" size={26} />,
    title: "Meal Logging",
    desc: "Log every meal and snack in seconds using a searchable food database.",
  },
  {
    icon: <LineChart className="text-primary-600" size={26} />,
    title: "Nutrient Tracking",
    desc: "Track calories, macros and micronutrients with clear daily and weekly charts.",
  },
  {
    icon: <Sparkles className="text-primary-600" size={26} />,
    title: "Personalized Recommendations",
    desc: "Get calorie and macro targets tailored to your body, goals, and activity level.",
  },
  {
    icon: <Apple className="text-primary-600" size={26} />,
    title: "Recipe Suggestions",
    desc: "Discover recipes that fit your remaining calories and dietary restrictions.",
  },
  {
    icon: <ShoppingCart className="text-primary-600" size={26} />,
    title: "Grocery Assistance",
    desc: "Auto-generate a shopping list from your planned meals for the week.",
  },
  {
    icon: <Users className="text-primary-600" size={26} />,
    title: "Connect with Professionals",
    desc: "Reach out to registered dietitians for guidance beyond what the app can offer.",
  },
];

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516749396351-ab12ad535d7c?auto=format&fit=crop&w=2000&q=80')" }}
      >
        {/* Overlay: fades the photo into the page background so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/85 to-[#f8faf9]" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 text-center">
          <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            Your everyday nutrition companion
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight max-w-3xl mx-auto">
            Eat smarter with a plan built{" "}
            <span className="text-primary-600">around you</span>
          </h1>
          <p className="text-gray-600 text-lg mt-6 max-w-xl mx-auto">
            Log meals, track nutrients, and get personalized guidance to reach your
            health and fitness goals — all in one place.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-200"
            >
              Start for free
            </Link>
            <Link
              to="/login"
              className="border border-gray-200 bg-white/70 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer strip */}
      <section className="bg-primary-50 border-t border-primary-100">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-primary-800">
            NutriAssist is designed to support healthier everyday choices, but it
            does not replace professional medical or dietary advice. Please
            consult a qualified healthcare provider for personalized care.
          </p>
        </div>
      </section>
    </div>
  );
}