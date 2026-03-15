# GutLog — Architecture & Flow Guide

## What is GutLog?

A mobile health-tracking app for people managing Crohn's disease. It lets you log daily meals, medications, water intake, and bowel movements, then uses Google's Gemini AI to analyze your data and flag potential food/medication interactions.

Think of it as a personal gut health diary with an AI assistant built in.

---

## Project Structure

```
GutLog/
├── frontend/          ← React Native app (what runs on your phone)
│   ├── app/
│   │   └── index.tsx  ← Entire app UI lives here (1657 lines, all 5 screens)
│   ├── components/    ← Reusable UI pieces
│   │   ├── BottomNav.tsx      ← Tab bar at the bottom
│   │   ├── MealCard.tsx       ← Card for each meal (breakfast, lunch, etc.)
│   │   ├── WaterBottle.tsx    ← Animated water bottle visualization
│   │   └── ProgressRing.tsx   ← Circular progress for meds
│   ├── utils/
│   │   ├── storage.ts  ← Read/write data to phone storage (AsyncStorage)
│   │   ├── gemini.ts   ← Calls Google Gemini AI API
│   │   └── date.ts     ← Date helper functions
│   ├── types/
│   │   └── index.ts    ← TypeScript data shapes (like Python dataclasses)
│   └── constants/
│       └── theme.ts    ← Colors, spacing, shadows (design system)
│
└── backend/           ← Python FastAPI server (minimal, mostly scaffolding)
    ├── server.py       ← REST API with MongoDB connection
    └── requirements.txt
```

---

## Tech Stack (Plain English)

| Layer         | Technology          | Python Equivalent                 |
| ------------- | ------------------- | --------------------------------- |
| Mobile UI     | React Native + Expo | tkinter / PyQt but for phones     |
| Language      | TypeScript          | Python with type hints            |
| Navigation    | expo-router         | Flask URL routing                 |
| Local storage | AsyncStorage        | shelve / sqlite3 on device        |
| AI calls      | Google Gemini API   | requests.post() to an AI endpoint |
| Backend       | FastAPI             | Flask/FastAPI (same!)             |
| DB            | MongoDB via Motor   | pymongo but async                 |

---

## How Data Flows

```
User taps something
        │
        ▼
  app/index.tsx          ← All screen logic lives here
  (React state)          ← Like Python variables that auto-refresh the UI
        │
        ├──► utils/storage.ts   ── saves/loads from phone's local storage
        │         │
        │         └── AsyncStorage (key-value store, like a dict saved to disk)
        │                Keys: "log_2026-03-15", "crohns_diary_settings_v1"
        │
        └──► utils/gemini.ts    ── calls Gemini AI (only when user requests it)
                  │
                  └── fetch() → https://generativelanguage.googleapis.com
                                 (needs API key from Settings screen)
```

The backend (Python/FastAPI) is NOT connected to the frontend right now. All app data stays on the device. The backend is scaffolding for future features.

---

## The 5 Screens

### 1. Home (Meal Logging)

- Log food items under 5 meal slots: Breakfast, Lunch, Dinner, Snacks, Misc
- Each item has: name, quantity (g or ml), outside food flag
- Tap "Generate Macros" → sends food list to Gemini → gets calories/protein/carbs/fat back
- Shows a daily summary card at the top

### 2. Meds

- Add medications with name, dosage, preferred time
- Daily checklist: mark each med as taken + record the time
- Meds list is persistent (saved separately from daily logs)

### 3. Water

- Visual water bottle that fills up as you log intake
- Quick-add buttons: +250ml, +500ml, +750ml
- Tracks streaks (consecutive days hitting your goal)
- Goal is configurable in Settings

### 4. Stool Log

- Log bowel movements with: consistency, color, satisfaction level, notes
- Correlation view: 7-day timeline showing stool entries alongside foods and meds eaten

### 5. Settings

- Enter your Gemini API key (stored locally, never sent to the backend)
- Choose city (Hyderabad / Bengaluru) — used for Indian food context in AI prompts
- Set daily water goal
- Reset today's log

### Extra Pages (accessible from Home)

- AI Feedback: Sends today's foods + meds to Gemini, returns a caution level (low/medium/high), potential reactions, positive food pairs, and advice
- Suspicious Foods: Mark specific foods as triggers, track patterns over time

---

## Data Models (like Python dataclasses)

```typescript
// A single day's complete log
DayLog {
  meals: {
    breakfast: MealLog,
    lunch: MealLog,
    dinner: MealLog,
    snacks: MealLog,
    misc: MealLog
  },
  waterMl: number,
  stoolEntries: StoolEntry[],
  medsTaken: { [medId]: { taken: bool, timeTaken: string } }
}

// One meal slot
MealLog {
  items: FoodItem[],
  outsideFoodChecked: bool,
  macro: { calories, protein, carbs, fat } | null
}

// One food item
FoodItem { id, name, quantity, unit("g"|"ml"), isOutsideFood, suspicious? }

// One stool entry
StoolEntry { id, date, time, consistency, color, satisfaction, notes }
```

Storage keys on device:

- `log_YYYY-MM-DD` → one DayLog per day
- `crohns_diary_settings_v1` → SettingsData
- `crohns_diary_meds_master_v1` → MedItem[]

---

## AI Integration (Gemini)

Two prompts are sent to Gemini:

**1. Macro Estimation** (per meal)

```
Input:  city + meal name + list of food items with quantities
Output: { calories, protein, carbs, fat }
```

**2. Daily Review** (AI Feedback page)

```
Input:  date + city + all foods eaten today + all meds taken today
Output: {
  summary: string,
  cautionLevel: "low" | "medium" | "high",
  potentialReactions: string[],
  positivePairs: string[],
  advice: string[]
}
```

Both calls go directly from the phone to Google's API. No backend involved.

---

## How to Run

### Prerequisites

- Node.js (v18+) — download from nodejs.org
- Expo Go app on your Android phone (from Play Store)
- OR an Android emulator (Android Studio)

### Frontend (the actual app)

```bash
# 1. Go into the frontend folder
cd GutLog/frontend

# 2. Install dependencies (like pip install -r requirements.txt)
yarn install
# or: npm install

# 3. Start the development server
npx expo start

# 4. Options after it starts:
#    Press 'a' → opens on Android emulator
#    Scan QR code with Expo Go app → runs on your real phone
#    Press 'w' → opens in browser (limited functionality)
```

### Backend (optional, not connected to app yet)

```bash
# 1. Go into backend folder
cd GutLog/backend

# 2. Create a virtual environment (good practice)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create a .env file with your MongoDB connection
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=gutlog" >> .env

# 5. Run the server
uvicorn server:app --reload
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Getting a Gemini API Key (for AI features)

1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. Open the app → Settings tab → paste the key
4. AI features (macro generation, daily review) will now work

---

## Key Concepts for Python Developers

| React Native concept             | Python equivalent                                         |
| -------------------------------- | --------------------------------------------------------- |
| `useState(value)`                | A variable that re-renders the UI when changed            |
| `useEffect(() => {}, [dep])`     | Code that runs when a dependency changes (like a watcher) |
| `AsyncStorage.setItem(key, val)` | `json.dump(val, open(key, 'w'))`                          |
| `fetch(url, {method, body})`     | `requests.post(url, json=body)`                           |
| TypeScript interface             | Python dataclass or TypedDict                             |
| `components/` folder             | Python modules with reusable functions                    |
| `expo start`                     | `python app.py` (starts the dev server)                   |

---

## Current State

- Frontend: Fully functional standalone app. All features work without the backend.
- Backend: Scaffolding only. Has a `/api/status` endpoint for health checks. Not integrated with the frontend.
- AI: Works when you provide a Gemini API key. Uses `gemini-2.5-flash` model.
- Data: 100% local to the device. Nothing is synced to a server.
