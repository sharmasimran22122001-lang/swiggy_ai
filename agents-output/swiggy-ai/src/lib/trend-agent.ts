import { GoogleGenerativeAI } from '@google/generative-ai'
import type { TrendingItem } from '@/types'

// Trending is fetched India-wide, not city-specific.
// The city-level matching happens separately in availability.ts.
const TREND_PROMPT = `
Search the web right now for what food dishes and food items are trending across India.
Look for: viral foods on Instagram/YouTube/Zomato, dishes people are suddenly searching for,
new food categories blowing up nationally, and anything going viral on Indian social media related to food.

CRITICAL rules for each "name":
- ONE specific, orderable dish of 1–3 words — like "Chicken Biryani",
  "Korean Cream Bun", "Masala Dosa", "Kunafa Chocolate".
- NEVER categories, umbrella terms, parentheses, or "e.g." lists
  (bad: "Millet-based dishes (e.g., Millet Dosa)" — good: "Millet Dosa").
- Only items restaurants actually sell on Indian food delivery apps
  (Swiggy/Zomato). NO alcohol, NO cocktails, family-friendly names only.
- Prefer viral dishes that mainstream restaurants serve (biryani styles, momos,
  buns, rolls, dosas, desserts, shakes) over ultra-niche foreign items nobody
  nearby delivers.

Return ONLY valid JSON — no prose, no markdown fences. Exactly 10 items:
{
  "trending": [
    {
      "name": "exact dish or food item name",
      "cuisine": "cuisine type (e.g. Indian, Chinese, Mexican, Korean)",
      "why_trending": "MAX 4 words, punchy — e.g. 'viral on reels', 'monsoon favourite', 'India's most ordered'",
      "search_signal": "high or medium"
    }
  ]
}
`

export async function fetchTrendingFoods(): Promise<TrendingItem[]> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set')

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({
    // 2.5-flash: 2.0-flash free tier was withdrawn; 2.5 supports googleSearch grounding
    model: 'gemini-2.5-flash',
    // googleSearch grounding — type cast needed as SDK types lag behind the API
    tools: [{ googleSearch: {} }] as any,
  })

  const result = await model.generateContent(TREND_PROMPT)
  const text = result.response
    .text()
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  const parsed = JSON.parse(text)
  return (parsed.trending as TrendingItem[]).slice(0, 10)
}
