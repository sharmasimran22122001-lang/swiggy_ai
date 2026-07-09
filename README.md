# 🍛 Swiggy AI — Three kinds of eaters. Three homepages.

**A live, deployed product concept: a food-delivery homepage that an LLM assembles differently for each person — by reading how they actually order.**

<p>
  <a href="https://swiggy-ai-one.vercel.app"><strong>▶️ Open the live demo</strong></a> ·
  <a href="https://sharmasimran22122001-lang.github.io/swiggy_ai/"><strong>📖 Read the case study</strong></a>
</p>

> Personal concept project by **Simran Sharma** — not affiliated with Swiggy.
> Contact: sharmasimran22122001@gmail.com

---

## The idea

Three people open the same food app. One orders the same biryani every Friday. One explores a single trusted restaurant's whole menu. One never orders from the same place twice. They are completely different customers — so this product gives each of them a **different homepage**, generated live by AI from their own order history.

## How it works

```
Order history ──► Behaviour scoring ──► Persona (Loyalist / Explorer / Variety Seeker)
                        │
Restaurant DB ──► RAG retrieval (top-15 real candidates, city + diet filtered)
                        │
                        ▼
        Gemini 2.5 Flash ──► Complete homepage as strict JSON ──► Verified & cached
```

- **Persona engine** — three transparent behaviour scores (repeat / variety / explore) computed with plain arithmetic; the dominant one picks the homepage strategy. No black box.
- **RAG grounding** — the LLM can only recommend from ~15 retrieved real restaurants (8,680 in the database, 86,800 menu items, 9 Indian cities). Hallucinated restaurants are structurally impossible.
- **Trending agent** — a second, search-grounded Gemini agent finds what's viral across India, then verifies every trending dish is actually orderable in the user's city.
- **Graceful degradation** — model waterfall with retries; if quota is exhausted, the user's last AI homepage is served; a non-AI fallback exists as the final layer. Visitors never see an error.
- **Product craft** — live search with recently-searched memory, draggable segmented nav, multi-restaurant cart, real food photography, spring-physics micro-interactions.

## Stack

`Next.js 16` · `TypeScript` · `Supabase (Postgres)` · `Gemini 2.5 Flash` · `Google Search grounding` · `Framer Motion` · `Vercel`

## Repository layout

| Path | What it is |
|---|---|
| `agents-output/swiggy-ai/` | The Next.js application (deployed to Vercel) |
| `agents-input/` | Project blueprint, data pipeline prototypes, dataset |
| `agents/` | Design & architecture working notes |

## Run it locally

```bash
cd agents-output/swiggy-ai
npm install
# create .env.local with:
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#   SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY
npm run dev
```

## Honesty note

The restaurant base (names, cities, ratings, cuisines, delivery times) comes from a real public dataset; dish menus and user order histories are synthesised on top of it. This is a scoped demonstration of the approach — at platform scale it runs on real order data.
