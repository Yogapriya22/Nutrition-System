# NutriAssist — Nutrition Assistant App (MERN Stack)

A personalized nutrition guidance app: meal logging, dietary tracking,
personalized calorie/macro targets, recipes + grocery lists, and
educational resources — built with MongoDB, Express, React, and Node.

> This app supports healthier everyday choices. It does not replace
> professional medical or dietary advice.

## Tech stack

- **Frontend:** React (Vite) + Tailwind CSS + React Router + Axios + Recharts
- **Backend:** Node.js + Express
- **Database:** MongoDB (via Mongoose)
- **Auth:** JWT + bcrypt password hashing

## Folder structure

```
nutrition-assistant/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── pages/       # Landing, Login, Register, Dashboard,
│       │                # MealLogPage, ProfileSettings, Recommendations,
│       │                # Recipes, Resources
│       ├── components/  # Navbar, ProtectedRoute
│       ├── context/      # AuthContext (global login state)
│       └── utils/        # api.js (axios instance)
└── server/          # Express backend
    ├── config/       # db.js (MongoDB connection)
    ├── models/       # User, Food, MealLog, Recipe
    ├── controllers/  # authController, foodController, mealLogController, recipeController
    ├── routes/       # authRoutes, foodRoutes, mealLogRoutes, recipeRoutes
    ├── middleware/   # authMiddleware (JWT protect)
    ├── utils/        # nutritionCalc.js (BMR/TDEE/macro math)
    └── seed/         # seedFoods.js, seedRecipes.js
```

## Setup

### 1. Backend

```bash
cd server
npm install
cp .env.example .env    # then fill in MONGO_URI and JWT_SECRET
npm run seed             # loads the starter food database
npm run seed:recipes     # loads the starter recipe database
npm run dev               # starts on http://localhost:5000
```

You'll need a MongoDB connection. Easiest free option: create a cluster on
[MongoDB Atlas](https://www.mongodb.com/atlas) and paste its connection
string into `MONGO_URI`. (Or run MongoDB locally if you have it installed.)

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env    # defaults to http://localhost:5000/api, adjust if needed
npm run dev               # starts on http://localhost:5173
```

Open `http://localhost:5173` — register an account, then:
1. Go to **Profile** and fill in age, gender, height, weight, activity level and goal.
2. Go to **Targets** (Recommendations) to calculate your BMR/TDEE and save your
   daily calorie & macro goals.
3. Log meals from **Meal Log** — your **Dashboard** will show today's progress
   against your targets plus a 7-day calorie chart.
4. Browse **Recipes**, select a few, and generate a combined grocery list.
5. Check **Resources** for articles and a nutrition professional directory.

## Feature roadmap (built in phases)

| Phase | Feature | Status |
|---|---|---|
| 0 | Project setup (folder structure, boilerplate) | ✅ Done |
| 1 | Auth (register/login/JWT) + health profile | ✅ Done |
| 2 | Food database + meal logging (CRUD) | ✅ Done |
| 3 | Calorie/nutrient tracking dashboard with charts | ✅ Done |
| 4 | Personalized recommendations (BMR/TDEE calculator, calorie/macro targets) | ✅ Done |
| 5 | Recipe suggestions + auto-generated grocery list | ✅ Done |
| 6 | Educational resources + nutrition professional directory | ✅ Done |
| 7 | Polish, responsive QA, deployment (Render/Vercel + Atlas) | ⏳ Next |

## What's implemented right now

- **Auth & profile:** register/login with JWT + bcrypt, a dedicated
  `/profile` page for the health profile (age, gender, height, weight,
  activity level, goal, dietary restrictions).
- **Meal logging:** search a seeded food database, log meals per date/meal
  type, see running totals, delete entries.
- **Dashboard:** today's calories/protein/carbs/fat vs. your saved targets
  (progress bars), a 7-day calorie bar chart with a goal reference line,
  and quick links to the rest of the app. Prompts you to complete your
  profile / calculate targets if either is missing.
- **Recommendations:** BMR (Mifflin-St Jeor) + TDEE calculator with a live
  client-side preview, goal-adjusted daily calorie target, and a macro
  breakdown pie chart. "Save as my daily targets" persists the numbers to
  your profile (the backend also recalculates targets automatically
  whenever you edit your profile).
- **Recipes:** browse seeded recipes filterable by meal type, personalized
  by your goal; select multiple recipes (with adjustable servings) and
  generate a combined, de-duplicated grocery list.
- **Resources:** educational articles (filterable by topic) and a
  searchable nutrition-professional directory.
- Responsive navbar with a mobile menu; consistent design system across
  all pages.

## Next step

Phase 7: production polish — loading/error states pass, mobile QA across
all new pages, and deployment (Render/Vercel for the app + MongoDB Atlas).
