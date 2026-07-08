import { GoogleGenerativeAI } from '@google/generative-ai'
import type { UserProfile, TimeSlot, MoodType, Restaurant, HomepageJSON } from '@/types'

// ─── Prompt rules ────────────────────────────────────────────────────────────

const RULES = `
You arrange a personalised Swiggy homepage body. Output ONLY valid JSON, no prose, no markdown fences.

GLOBAL RULES (all users):
- Use ONLY restaurants from CANDIDATES. Never invent any.
- Diet hard constraint is absolute: if veg-only/jain/vegan, never include a non-veg restaurant.
- Every item must include a short human "reason" (max 12 words, natural language).
- Include rating, delivery_min, veg flag in every item where available.
- All hero/discovery/top-rated items are RESTAURANTS, not individual dishes.

PERSONA HERO LOGIC:

2A_loyalist:
- Identify the single restaurant the user orders from most recurringly (highest order frequency).
- Hero title: "Order more from {favourite_restaurant}"
- Show that restaurant first, then other dishes/items from that same restaurant they haven't tried.
- Goal: reinforce loyalty, gently expand their order within the same trusted restaurant.

2B_restaurant_loyal_explorer:
- Identify the cuisine types the user orders most frequently (top_cuisines).
- Hero title: "Top-rated places matching your taste"
- Recommend restaurants the user has NOT ordered from before, whose cuisine matches top_cuisines.
- Goal: same taste, new restaurants.

2C_variety_seeker:
- Look at the user's order history by meal slot (breakfast/lunch/dinner/snacks).
- For each slot the user HAS ordered before: recommend highly-rated restaurants in those cuisines.
- For slots the user has NEVER ordered before: recommend the highest-rated restaurants for that slot regardless of their cuisine history — quality over personalisation.
- Hero title reflects the current slot: "Best {slot} near you" or similar.
- Always show RESTAURANTS, not individual dishes.

BANNER (all users):
- Gemini picks the banner theme dynamically based on: current season in India, weather signal, time of day, and mood parameter.
- Season guide: Jun–Sep = Monsoon, Oct–Nov = Post-monsoon/festive, Dec–Feb = Winter, Mar–May = Summer.
- Banner should feel timely and specific — e.g. "Monsoon Comfort Food", "Winter Warmers", "Late Night Cravings".
- Return 3 food items inside the banner that match the theme.

TOP RATED (all users):
- Highly-rated restaurants and cafes near the user's location (area match preferred).
- Return 4 items sorted by avg_rating descending.

WHAT'S ON YOUR MIND (all users):
- 6 to 7 items maximum. Food category tiles, not restaurants.
- Pick categories that are seasonal, locally famous in the user's area, or highly rated nearby.
- Examples for Monsoon: Chai & Snacks, Hot Soup, Pakoda, Samosa, Biryani, Maggi.

DISCOVERY (all users):
- 2A: "Quick picks nearby" — fast delivery, high rating.
- 2B: "Explore something new" — different cuisines from top_cuisines.
- 2C: "More places you'd enjoy" — mix of rating and variety.
Return 4 items each.

CONDITIONAL: include "budget_99_store" block ONLY if price_band == "low". Otherwise set to null.

Return EXACTLY this JSON shape:
{
  "hero": {"title": "...", "items": [{"name": "...", "restaurant": "...", "reason": "...", "veg": true/false, "rating": 0.0, "delivery_min": 0}]},
  "slot_top_rated": {"title": "...", "items": [...]},
  "discovery": {"title": "...", "items": [...]},
  "mood_banner": {
    "mood": "spicy|cold_sweet|comforting",
    "theme": "one short banner headline e.g. Monsoon Comfort Food",
    "title": "...",
    "items": [...]
  },
  "whats_on_your_mind": ["category1", "category2", "category3", "category4", "category5", "category6"],
  "budget_99_store": null OR {"title": "...", "items": [...]}
}
`

function slimRestaurant(r: Restaurant) {
  return {
    name: r.name,
    area: r.area,
    cuisines: r.cuisines,
    rating: r.avg_rating,
    delivery_min: r.delivery_time_min,
    menu: r.menu.map(d => ({ dish: d.dish, veg: d.veg, price: d.price })),
  }
}

export function buildPrompt(
  profile: UserProfile,
  slot: TimeSlot,
  mood: MoodType,
  candidates: Restaurant[]
): string {
  return RULES + '\n\nCONTEXT:\n' + JSON.stringify({ profile, slot, mood, candidates: candidates.map(slimRestaurant) })
}

// ─── Model waterfall ──────────────────────────────────────────────────────────
// gemini-2.0-flash / 1.5 family removed: free-tier quota withdrawn by Google (429 limit:0)
// Order: fastest → most available. 503s on lite are handled by the retry loop.

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
]

// ─── Error helpers ────────────────────────────────────────────────────────────

function isRetryable(err: unknown): boolean {
  const msg = String(err).toLowerCase()
  return (
    msg.includes('503') ||
    msg.includes('429') ||
    msg.includes('overloaded') ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('resource_exhausted') ||
    msg.includes('internal') ||
    msg.includes('timeout')
  )
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

// ─── JSON extraction — handles markdown fences and raw JSON ───────────────────

function extractJSON(raw: string): string {
  const trimmed = raw.trim()

  // Strip markdown code block (```json ... ``` or ``` ... ```)
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fenced) return fenced[1].trim()

  // Find the outermost JSON object
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start !== -1 && end > start) return trimmed.slice(start, end + 1)

  return trimmed
}

// ─── Main caller ──────────────────────────────────────────────────────────────

export async function callGemini(prompt: string): Promise<HomepageJSON> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY not set in environment')

  const genAI = new GoogleGenerativeAI(key)
  const RETRIES_PER_MODEL = 3
  let lastErr: unknown

  for (const modelName of MODELS) {
    for (let attempt = 0; attempt < RETRIES_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            // Cap token usage — our JSON rarely exceeds 2k tokens
            maxOutputTokens: 3000,
            temperature: 0.4,
            // 2.5 models "think" by default, eating into maxOutputTokens —
            // disable so the full budget goes to the JSON (cast: SDK types lag)
            thinkingConfig: { thinkingBudget: 0 },
          } as any,
        })

        const result = await model.generateContent(prompt)
        const raw = result.response.text()
        const json = extractJSON(raw)
        return JSON.parse(json) as HomepageJSON

      } catch (err) {
        lastErr = err
        const retryable = isRetryable(err)
        const isLastAttempt = attempt === RETRIES_PER_MODEL - 1

        console.warn(
          `[Gemini] ${modelName} attempt ${attempt + 1}/${RETRIES_PER_MODEL} failed:`,
          String(err).slice(0, 120)
        )

        if (!retryable || isLastAttempt) break

        // Exponential backoff: 1 s → 2 s → 4 s
        await sleep(1000 * Math.pow(2, attempt))
      }
    }
  }

  // All models exhausted — surface clear error
  const msg = lastErr instanceof Error ? lastErr.message : String(lastErr)
  throw new Error(`Gemini unavailable after trying all models. Last error: ${msg}`)
}
