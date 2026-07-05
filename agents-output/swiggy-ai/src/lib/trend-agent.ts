import { GoogleGenerativeAI } from '@google/generative-ai'
import type { TrendingItem } from '@/types'

// Trending is fetched India-wide, not city-specific.
// The city-level matching happens separately in availability.ts.
const TREND_PROMPT = `
Search the web right now for what food dishes and food items are trending across India.
Look for: viral foods on Instagram/YouTube/Zomato, dishes people are suddenly searching for,
new food categories blowing up nationally, and anything going viral on Indian social media related to food.

Return ONLY valid JSON — no prose, no markdown fences. Exactly 10 items:
{
  "trending": [
    {
      "name": "exact dish or food item name",
      "cuisine": "cuisine type (e.g. Indian, Chinese, Mexican, Korean)",
      "why_trending": "one sentence — why this is viral or popular right now across India",
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
    model: 'gemini-2.0-flash',
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
