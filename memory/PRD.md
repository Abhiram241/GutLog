# Crohn's Food Diary — Product Requirements Document

## Problem Statement
Build a premium-feel mobile Expo app for Crohn's disease daily tracking with warm pastel UI. The app must support meal logging, medication/supplement tracking, water intake, stool logs with correlation, local persistence, Gemini-powered macro estimation, AI daily review, and suspicious food tracking.

## Architecture
- Frontend: Expo SDK 54 + React Native + TypeScript (single mobile app)
- Storage: AsyncStorage (fully local/offline-first)
- AI Integration: Direct Gemini API calls using user-entered API key stored locally
- Navigation: Custom 5-tab bottom navigation + 2 extra pages accessible from Settings
- Backend: Existing FastAPI service retained but unused per user choice (local-only app)

## User Personas
- Primary: Crohn's patient needing daily gut-health journaling and pattern identification
- Secondary: Health-conscious patient tracking hydration, food triggers, and meds consistency
- Context: India-focused diet context (Hyderabad/Bengaluru food patterns)

## Core Requirements (Static)
1. 5 main tabs: Home, Meds, Water, Stool Log, Settings
2. Home: 5 meal sections + item quantity/unit + outside-food + summaries
3. Meds: persistent master list + daily check-off + progress visualization
4. Water: fill visualization + quick increments + streak logic
5. Stool: entry form + 7-day correlation with food/med data and taco indicator
6. Settings: Gemini key, city, water goal, reset today
7. AI macros: per-meal generation when key exists
8. Extra pages: AI food-med review + suspicious food tracker with consolidated list
9. Local persistence only

## Implemented (2026-03-15)
- Designed and implemented complete warm pastel UI system (theme constants, spacing, shadows)
- Built full mobile app flows in Expo:
  - Home with date switching, summary strip, empty state illustration (BASE64), five meal cards
  - Add food item modal with quantity + unit (g/ml)
  - Outside-food toggle on each meal and stored per food item
  - Per-meal Gemini macro generation (calories/protein/carbs/fat) with inline error handling
  - Meds & Supplements tab with add-med form, daily taken toggle, time capture, and completion ring
  - Water tab with animated bottle fill, quick-add controls, undo action, and streak message
  - Stool tab with Entry + Correlation views and 7-day timeline
  - Taco emoji indicator in correlation row when outside food is present
  - Settings with city selector (default Bengaluru), Gemini key, water goal, reset log
  - Extra page: AI Feedback (food + meds review and potential reaction summary)
  - Extra page: Suspicious Foods (mark old entries and consolidated suspicious list)
- Added local storage utilities for settings, day logs, meds list, and log normalization
- Added Gemini utility module for strict JSON parsing and resilient response handling
- Added reusable UI components: BottomNav, MealCard, WaterBottle, ProgressRing
- Installed required packages:
  - `@react-native-async-storage/async-storage`
  - `react-native-svg`

## Bug Fix Iteration (2026-03-15)
- Fixed crash: `AsyncStorage.default.multiGet is not a function` in `utils/storage.ts`.
- Root fix:
  - Replaced `multiGet` usage with safe per-key reads via `Promise.all` + `getItem`.
  - Added robust safe storage wrappers (`safeGetItem`, `safeSetItem`, `safeGetAllKeys`) with fallback storage handling to prevent startup crashes.
  - Updated package versions to Expo SDK-compatible versions:
    - `@react-native-async-storage/async-storage@2.2.0`
    - `react-native-svg@15.12.1`
- Additional cleanup: removed `setLayoutAnimationEnabledExperimental` call to reduce New Architecture warning noise.
- Post-fix regression checks completed: add meal, add meds, water increment, stool save, suspicious toggle, AI no-key error state.

## UI/UX Iteration (2026-03-15) — GutLogs Branding + Usability Polish
- Pulled latest user repo snapshot from: `https://github.com/Abhiram241/GutLog.git` and aligned requested updates in active workspace.
- Branding updates:
  - Removed Crohn naming from visible app title.
  - Home title updated to **GutLogs**.
  - App config updated: `name`, `slug`, and `scheme` set to GutLogs values.
- Icon updates:
  - Generated new lightning-themed icon assets using ⚡ style and replaced app icon/splash assets.
- Startup experience:
  - Added in-app startup spinner state (`Loading GutLogs...`) to replace immediate static loading feel.
- Keyboard/navigation bug fix:
  - Fixed stool-page keyboard/nav interaction by tracking keyboard visibility and hiding bottom nav while keyboard is open.
  - Added extra stool page padding to improve spacing and usability.
- Status bar visibility:
  - Added explicit `StatusBar` styling for better contrast (light/dark aware) so system status icons remain readable.
- Dark mode:
  - Added manual+system appearance support in Settings (`System`, `Light`, `Dark`).
  - Applied dark mode styling to major containers/cards/nav/modal inputs.
- Macro presentation:
  - Added daily macro summary card near top of Home when generated macros exist.
  - Updated macro labels to full form only (Calories, Protein, Carbohydrates, Fat).
- Add-item modal UX:
  - Moved add-item popup to centered modal layout.
  - Improved keyboard behavior and ensured save action remains visible while typing.
- Water page update:
  - Removed `+750 ml` quick-add option.
- Settings UX:
  - Added dedicated **Save API Key** button directly below Gemini key input.

## Validation Completed
- ESLint passed (`yarn lint`)
- Live preview visual checks completed across key screens using screenshot automation
- Confirmed navigation and extra pages render correctly

## Prioritized Backlog

### P0 (Must-have next)
- Add explicit delete/edit controls for meal items, stool entries, and meds
- Improve input validation UX (inline helper errors for malformed date/time)
- Add optional export/import backup for AsyncStorage data

### P1 (High-value)
- Add historical analytics cards (weekly symptom trend + likely trigger frequency)
- Add meal templates/favorites for faster food entry
- Add smarter city-aware food autocomplete suggestions

### P2 (Enhancements)
- Add richer animations/transitions between pages
- Add small onboarding flow for first-time users
- Add dark mode variant with same calm style language

## Next Tasks
1. Add edit/delete actions and confirmation dialogs for all log entities
2. Add backup/export feature for long-term personal diary retention
3. Improve AI review with stronger guardrails and confidence notes
