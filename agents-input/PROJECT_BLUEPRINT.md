# Swiggy AI-Homepage — Project Blueprint

A reimagining of the Swiggy homepage where an LLM personalizes the page per user,
grounded in real restaurant data via RAG. This document captures every decision,
formula, rule, and the full data → RAG → LLM flow agreed during design.

---

## 1. The goal and the core thesis

**Goal:** increase profit by replacing Swiggy's rule/ML-driven homepage with an
LLM-driven one that personalizes what each user sees, so users explore and order more.

**Core thesis (one line):** *Keep the homepage skeleton identical for everyone;
change only the logic of the blocks. The top "hero" block carries the
personalization and differs by user type.*

This mirrors how Swiggy itself works — it already serves different homepage
**layouts to different user cohorts** and is moving toward model-ranked **dynamic
slots**. Our version uses an LLM as that ranking/assembly brain.

**Two original ideas, and where they landed:**
- *Idea 1 — LLM-personalized homepage* → became the whole project.
- *Idea 2 — "personal waiter" (same restaurant, different dish)* → survives as the
  **2A loyalist hero block** ("more from a restaurant you love"), not the whole project.

---

## 2. Why we target the returning user (profit-based)

We chose the target by profit contribution, not by interest. Estimated split:

| Persona | Profit share |
|---|---|
| New user | 0% |
| **Returning regular** | **80%** |
| Lapsed / dormant | 5% |
| Dietary-constrained | 10% |
| Budget / offer-driven | 5% |

Decision: **build for the returning regular first** — it drives 80% of profit.
The returning regular is then split into **sub-personas** (below), because that
80% hides very different behaviors that each need a different homepage.

---

## 3. The persona model

Real users are **never purely one type** — everyone is a blend. So we do **not**
hard-classify users into boxes. Instead each user gets **three behavior scores**
(three "dials"). The dominant dial gives a convenient label; the page is weighted
by all three.

**The three archetypes (labels for the dominant dial):**

- **2A — Loyalist.** Orders the *same dish* from the *same restaurant* repeatedly.
  High repeat. Goal for them: deepen trust, gently expand to new dishes at their
  favourite restaurant.
- **2B — Restaurant-loyal explorer.** Loyal to a few restaurants but varies the
  dish. Goal: **taste-anchored exploration** — push them toward *new restaurants
  that match their taste/vibe*.
- **2C — Variety-seeker.** Loyal to the platform, not any restaurant. Orders from
  many different places. Goal: **discovery beyond their taste** — trending/popular,
  preference is only a minor factor.

**Key distinction between 2B and 2C** (this was debated and settled):
it is **not** "restaurant vs dish." It is the *basis* of the recommendation:
- **2B = exploration anchored to their existing taste** (similar-vibe new places).
- **2C = discovery beyond their taste** (trending/popular regardless of preference).

**Product north star:** migrate users up the ladder **2A → 2B → 2C** (toward more
exploration), because exploration drives incremental orders and profit.

**Time-slot is NOT a persona.** It is a *context layer* (the "when") applied to all
personas. The persona sets the *strategy*; the slot tunes the *contents*.

**Blends are handled naturally.** A user who reorders biryani daily AND tries many
new places is e.g. repeat 0.55 / variety 0.07 / exploration 0.38 — labeled 2A but
with a real exploration tail, so their page leads with reorder yet gives discovery
real space.

---

## 4. The formulas (exact logic)

All scores come from **counting the order history** (a list of rows:
dish, restaurant, veg flag, price, days_ago). No AI in this step — pure arithmetic.

**Repeat score** = (orders that repeat a (restaurant, dish) pair already seen) ÷ (total orders).
High = creature of habit.

**Exploration score** = min( distinct_restaurants ÷ total_orders , 1.0 ).
High = orders from many different places.

**Variety-at-place score** = among restaurants visited ≥2 times,
average of (distinct dishes ÷ visits) per restaurant.
High = loyal to a place but adventurous with its menu.

**Normalization:** the three are scaled to sum to ~1.0 so they're comparable.
The largest becomes the persona label (2A/2B/2C).

**Reliability caveat:** scores need a **minimum order count** (~8–10) to be
trustworthy; tiny histories give valid-but-unreliable scores.

---

## 5. Other classification rules

**Diet (veg / non-veg / Jain / vegan):** two layers.
- *Declared (reliable):* if the user sets a hard rule (e.g. "pure-veg mode"), that
  rule is **absolute** and always wins.
- *Inferred (from orders):* all-veg history → "veg-leaning/only"; mixed → "non-veg-inclusive."
- **Jain and Vegan CANNOT be inferred** from order data (a Jain/vegan order looks
  like a veg order). They are only known if the user **declares** them. Never guess
  these — guessing wrong (e.g. paneer to a vegan) is a real harm.

**Favourite restaurant** = the restaurant with the most orders.
*Tie-break order:* (1) most recently ordered wins, (2) else higher total spend,
(3) else show both.

**Usual dish** = within the favourite restaurant, the most-ordered dish.
Same recency tie-break; show both if still tied.

**Distinct restaurants** = count of unique restaurant names in the whole history.

**Price band** = avg order value → low (<₹200) / mid (₹200–449) / high (≥₹450).

---

## 6. The data

**Source dataset (Kaggle, real):** `swiggy.csv` — **8,680 restaurants**, columns:
ID, Area, City, Restaurant, Price (for two), Avg ratings, Total ratings,
Food type (cuisines), Delivery time. **Restaurant-level only — no dish data.**
Cities: Kolkata, Mumbai, Chennai, Pune, Hyderabad, Bangalore, Ahmedabad, Delhi, Surat.

**Generated menu layer (`restaurants_with_menus.json`):** because the data is
restaurant-level, we synthesized **~10 dishes per restaurant** from its cuisines.
Each dish has: name, veg flag, price (scaled to the restaurant's price band).
This gives the dish-level data the "same restaurant, different dish" feature needs.

**Mood-tag layer (for the banner):** cuisine → mood mapping:
- *spicy* ← Andhra, Hyderabadi, Biryani, Thai, Mughlai, Tandoor, Kebabs, Seafood…
- *cold/sweet* ← Ice Cream, Desserts, Beverages, Bakery, Sweets
- *comforting* ← North Indian, Home Food, South Indian, Thalis, Punjabi, Bengali

**Synthetic users (`synthetic_users.json`):** order histories built **on top of
real restaurants** from the dataset, so every reference resolves to real data:
- u01 Meera — clean 2A loyalist
- u02 Arjun — 2B restaurant-loyal explorer
- u03 Neha — 2C variety-seeker
- u04 Rahul — blend (heavy repeat + real exploration)

**What is real vs simulated (state this honestly in any writeup):**
- *Real:* the 8,680 restaurants, areas, cities, ratings, cuisines, delivery times.
- *Simulated:* dish menus (from cuisine), mood tags (from cuisine), user order
  histories, and "slot popularity" (proxied by ratings, since slot-level order
  volume isn't in the dataset).

---

## 7. The homepage structure (final)

**SHARED — identical for all users (never personalized):**
1. Top nav: address + Food / Instamart / Dineout bar
2. Search icon + Veg toggle
3. **Cuisine categories** (the shrunk "What's on your mind" carousel → broad
   categories like American, Italian, Chinese, Indian, Desserts) — *contents
   persona-tuned (e.g. 2C sees cuisines they haven't tried), block shared*
4. **Mood banner** (see below)
5. **Banner** (promotional / sponsored)
6. **More on Swiggy** (cross-vertical nav)
7. **Filters**
8. Bottom nav: Home, Search, Cart, **History/Reorder**, Account
   *(reorder lives here for everyone — it is NOT a homepage-body block)*

**PERSONALIZED BODY — 3 hero blocks (logic flips by persona):**

*2A Loyalist*
1. **HERO — "More from {favourite restaurant}":** popular dishes at their #1
   restaurant, **excluding dishes they already order**. Goal: deepen trust, expand
   beyond the usual dish.
2. **Top-rated for this slot:** best candidates fitting current slot + preferred cuisines.
3. **Quick picks nearby.**

*2B Restaurant-loyal explorer*
1. **HERO — "Top-rated places matching your taste":** new restaurants whose cuisines
   match the user's top cuisines (taste-anchored exploration toward new places).
2. **Top-rated for this slot.**
3. **Explore something new (light).**

*2C Variety-seeker*
1. **HERO — "Discovery / trending now":** popular restaurants for novelty;
   preference is only a minor factor.
2. **Popular for this slot** (ranked by slot-popularity proxy).
3. **More like places you enjoyed.**

**CONDITIONAL block:**
- **₹99 store** — rendered **only if price_band == "low"** (avg order value < ₹200).
  Skipped for everyone else.

**MOOD BANNER (all users):** a craving entry point (spicy / cold / sweet /
comforting) chosen by **season + meal-slot (+ weather if available)**. Fills the gap
where users open the app wanting a *sensation* ("something spicy/cold") but have no
entry point except search.

**Slot logic (all personas):** the slot tunes *contents*, not *which blocks appear*.
If a user only ever orders lunch but opens at breakfast, slot **overrides history**
and shows the best *breakfast* options.

---

## 8. How it works end-to-end (data → RAG → LLM)

```
ORDER HISTORY                                  RESTAURANT DATASET (8,680, real)
     |                                                   |
     v                                                   |
[STEP 3] SCORE THE USER  (pure arithmetic)               |
  repeat / variety / exploration scores                  |
  favourite restaurant, usual dish, diet, price band     |
     |                                                   |
     |                                                   v
     |                       [STEP 4] RETRIEVAL  =  the "R" in RAG
     |                       filter 8,680 -> ~15 real candidates by:
     |                         - same city/area (serviceability proxy)
     |                         - diet hard rule (veg users: veg-only menus)
     |                         - rank by rating, popularity, slot-fit,
     |                           preferred cuisine, delivery speed
     |                                                   |
     v                                                   v
[STEP 5] BUILD THE PROMPT  =  profile + slot + mood + the ~15 real candidates
         + the persona homepage RULES (section 7 encoded as instructions)
                                  |
                                  v
[STEP 6] SEND TO LLM (Gemini)  -> reasons & ranks, picks ONLY from candidates,
         respects diet as absolute, weights blocks by behavior scores
                                  |
                                  v
         STRUCTURED HOMEPAGE JSON  (hero / slot_top_rated / discovery /
         mood_banner / budget_99_store) — each item carries a "reason"
                                  |
                                  v
         RENDER as the homepage  (later step)
                                  |
                                  v
         COMPARE vs the "dumb" baseline (just reorder last order) = proof it's better
```

---

## 9. Why RAG and why an LLM (justification)

**Three possible designs:**
- *Rules only (no LLM):* fast and cheap, but rigid — can't reason flexibly or
  explain itself in natural language. Fine for basic apps; doesn't show the idea.
- *LLM alone (no RAG):* the model has **no knowledge of your restaurants** and will
  **invent** plausible-but-fake restaurants/dishes (hallucination). Fatal for a food
  app — you can't show a restaurant the user can't order from.
- *LLM + RAG (chosen):* RAG fetches **real, serviceable** restaurants first and feeds
  them in, so the LLM **chooses from facts** and explains its choices. Grounded *and* smart.

**So:** the **LLM** supplies judgment + natural-language reasons; **RAG** supplies the
real data that stops hallucination. Each alone fails; together they work.

**Key clarifications:**
- The LLM is **rented via an API** (Google Gemini free tier here) — **no training, no
  fine-tuning**. You steer it with the *prompt* (instructions), not by retraining.
  (Swiggy fine-tunes its own model because of 50M+ item scale; a project doesn't need to.)
- **RAG is not a product you download.** It is a *pattern you code*: (your filtering
  code over the menu file) + (pasting the results into the prompt).

---

## 10. The files

| File | What it is |
|---|---|
| `swiggy.csv` | The real Kaggle dataset (8,680 restaurants) |
| `restaurants_with_menus.json` | Dataset + generated 10-dish menus (the RAG candidate pool) |
| `synthetic_users.json` | 4 demo users anchored to real restaurants |
| `pipeline.py` | Full pipeline: score → retrieve → prompt → Gemini → homepage JSON |
| `rebuild_users.py` | Regenerates the synthetic users on real restaurants |

**How to run** (once Python + `google-generativeai` are installed and the
`GEMINI_API_KEY` is set):
```
python pipeline.py u01     # Meera  2A loyalist
python pipeline.py u02     # Arjun  2B explorer
python pipeline.py u03     # Neha   2C variety-seeker
python pipeline.py u04     # Rahul  blend
```
Without a key set, the script prints the exact prompt it *would* send (so the rest
of the pipeline is verifiable offline).

---

## 11. Next steps

1. **Run the brain:** get `pipeline.py` producing a real homepage from Gemini.
2. **Build the baseline:** generate the "dumb" reorder-only homepage for the same
   user, to compare side by side (this is the project's proof).
3. **Visual mockup (recommended over a full app):** render the JSON as a webpage that
   looks like a Swiggy homepage — convincing demo without building a real app.
4. **(Only if shipping a real app):** Flutter frontend + backend + database — a
   large, separate effort; decide later, only if the goal truly requires it.

---

## 12. Honesty checklist (for the writeup)

- Menus, mood tags, user histories, and slot-popularity are **simulated**; the
  restaurant base data is **real**. Say so.
- Deep personalization at Swiggy's true scale needs real order data we don't have;
  this is a **scoped demonstration** of the approach.
- The LLM is a **pre-trained model used via API**, not trained by us; fine-tuning is
  a future-at-scale step, not part of this project.
