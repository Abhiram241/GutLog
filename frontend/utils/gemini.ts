import { AIReviewResult, FoodItem, MacroResult, MedItem } from "@/types";

const GEMINI_MODEL = "gemini-2.5-flash";

const parseJsonFromText = (text: string) => {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const matched = cleaned.match(/\{[\s\S]*\}/);
    if (!matched) {
      throw new Error("Could not parse AI response.");
    }
    return JSON.parse(matched[0]);
  }
};

const callGemini = async (apiKey: string, prompt: string) => {
  if (!apiKey.trim()) {
    throw new Error("Please add Gemini API key in Settings first.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey.trim()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Gemini request failed.");
  }

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned empty output.");
  }
  return text;
};

export const generateMacros = async (
  apiKey: string,
  city: "Hyderabad" | "Bengaluru",
  mealName: string,
  items: FoodItem[]
) => {
  const foods = items
    .map(
      (item) =>
        `${item.name} (${item.quantity}${item.unit}, outside_food=${item.isOutsideFood ? "yes" : "no"})`
    )
    .join(", ");

  const prompt = `You are a nutrition estimator for Indian food.
City context: ${city}.
Meal: ${mealName}.
Foods: ${foods || "No items"}.
Estimate total macros for the whole meal.
Return ONLY strict JSON with numeric values:
{"calories": 0, "protein": 0, "carbs": 0, "fat": 0}
Do not include markdown or extra text.`;

  const raw = await callGemini(apiKey, prompt);
  const parsed = parseJsonFromText(raw);

  return {
    calories: Number(parsed.calories ?? 0),
    protein: Number(parsed.protein ?? 0),
    carbs: Number(parsed.carbs ?? 0),
    fat: Number(parsed.fat ?? 0),
  } as MacroResult;
};

export const generateReview = async (
  apiKey: string,
  city: "Hyderabad" | "Bengaluru",
  dateKey: string,
  foods: FoodItem[],
  meds: MedItem[]
) => {
  const foodString = foods.map((item) => `${item.name} (${item.quantity}${item.unit})`).join(", ");
  const medsString = meds.map((med) => `${med.name} ${med.dosage}`).join(", ");

  const prompt = `You are a careful wellness assistant for Crohn's diary users.
Date: ${dateKey}
City context: ${city}
Foods eaten: ${foodString || "none"}
Meds/supplements taken: ${medsString || "none"}

Give a simple daily review and mention known/possible food-medication interactions in a non-alarming tone.
Return ONLY strict JSON:
{
  "summary": "string",
  "cautionLevel": "low|medium|high",
  "potentialReactions": ["string"],
  "positivePairs": ["string"],
  "advice": ["string"]
}
No markdown, no additional keys.`;

  const raw = await callGemini(apiKey, prompt);
  const parsed = parseJsonFromText(raw);

  const cautionRaw = String(parsed.cautionLevel ?? "medium").toLowerCase();
  const cautionLevel: AIReviewResult["cautionLevel"] =
    cautionRaw === "low" || cautionRaw === "high" ? cautionRaw : "medium";

  return {
    summary: String(parsed.summary ?? "Review generated."),
    cautionLevel,
    potentialReactions: Array.isArray(parsed.potentialReactions)
      ? parsed.potentialReactions.map(String)
      : [],
    positivePairs: Array.isArray(parsed.positivePairs) ? parsed.positivePairs.map(String) : [],
    advice: Array.isArray(parsed.advice) ? parsed.advice.map(String) : [],
  } as AIReviewResult;
};
