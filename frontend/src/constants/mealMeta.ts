import { theme } from "./theme";
import { MealType } from "../types";

// ─── Meal metadata used across screens ────────────────────────────────────────
export const mealMeta: {
  key: MealType;
  title: string;
  color: string;
  placeholder: string;
}[] = [
  {
    key: "breakfast",
    title: "Breakfast",
    color: theme.colors.meal.breakfast,
    placeholder: "Ex: 2 idli",
  },
  {
    key: "lunch",
    title: "Lunch",
    color: theme.colors.meal.lunch,
    placeholder: "Ex: dal chawal",
  },
  {
    key: "dinner",
    title: "Dinner",
    color: theme.colors.meal.dinner,
    placeholder: "Ex: veg biryani",
  },
  {
    key: "snacks",
    title: "Snacks",
    color: theme.colors.meal.snacks,
    placeholder: "Ex: upma",
  },
  {
    key: "misc",
    title: "Misc",
    color: theme.colors.meal.misc,
    placeholder: "Ex: probiotic drink",
  },
];

// ─── Stool entry options ───────────────────────────────────────────────────────
export const consistencyOptions = [
  "Watery",
  "Loose",
  "Soft",
  "Normal",
  "Hard",
  "Pellets",
] as const;

export const colorOptions = [
  "Brown",
  "Yellow",
  "Green",
  "Black",
  "Red",
  "Pale/Clay",
] as const;

export const satisfactionOptions = [
  "Complete relief",
  "Partial relief",
  "Urgent",
  "Painful",
  "Incomplete",
] as const;
