"""
============================================================================
SWIGGY AI-HOMEPAGE  —  FULL PIPELINE  (steps 3 -> 6)
============================================================================
Flow:  score the user  ->  retrieve real local restaurants (RAG)
       ->  build the prompt encoding our persona homepage rules
       ->  send to Gemini  ->  receive structured homepage JSON  ->  print

HOW TO RUN (on your machine):
  1) pip install google-generativeai
  2) set your key (do NOT paste it in code):
        Mac/Linux:  export GEMINI_API_KEY="your_key_here"
        Windows:    setx GEMINI_API_KEY "your_key_here"   (then reopen terminal)
  3) python pipeline.py u01        (u01=Meera 2A, u02=Arjun 2B, u03=Neha 2C, u04=Rahul blend)

If no key is set, the script still runs everything EXCEPT the Gemini call,
and prints the exact prompt that WOULD be sent — so you can see it working.
============================================================================
"""
import json, os, sys, random
from collections import Counter, defaultdict
from datetime import datetime

DATA = os.path.dirname(os.path.abspath(__file__))
def load(name):
    # look in same dir, else /mnt/user-data/outputs
    for base in (DATA, "/mnt/user-data/outputs"):
        p = os.path.join(base, name)
        if os.path.exists(p):
            return json.load(open(p))
    raise FileNotFoundError(name)

RESTAURANTS = load("restaurants_with_menus.json")
USERS = load("synthetic_users.json")

# ---------------------------------------------------------------------------
# STEP 3 — SCORING (count the orders -> 3 behaviour scores + profile fields)
# ---------------------------------------------------------------------------
def score_user(u):
    o = u["orders"]
    n = len(o)
    # repeat: fraction of orders repeating a (restaurant,dish) already seen
    seen, rep = set(), 0
    for x in o:
        k = (x["restaurant"], x["dish"])
        if k in seen: rep += 1
        seen.add(k)
    repeat = rep / n
    # exploration: distinct restaurants / total (capped)
    distinct = len(set(x["restaurant"] for x in o))
    explore = min(distinct / n, 1.0)
    # variety-at-place: among repeat-visited restaurants, distinct dishes / visits
    byr = defaultdict(list)
    for x in o: byr[x["restaurant"]].append(x["dish"])
    ratios = [len(set(v))/len(v) for v in byr.values() if len(v) >= 2]
    variety = sum(ratios)/len(ratios) if ratios else 0.0
    tot = repeat + variety + explore or 1
    scores = {"repeat": round(repeat/tot,2), "restaurant_loyal_variety": round(variety/tot,2),
              "exploration": round(explore/tot,2)}
    label = max([("2A_loyalist","repeat"),("2B_restaurant_loyal_explorer","restaurant_loyal_variety"),
                 ("2C_variety_seeker","exploration")], key=lambda t: scores[t[1]])[0]
    # favourite restaurant (+ tiebreak by recency) and usual dish
    rc = Counter(x["restaurant"] for x in o); top = max(rc.values())
    tied = [r for r,c in rc.items() if c==top]
    fav = tied[0] if len(tied)==1 else min(tied, key=lambda r: min(x["days_ago"] for x in o if x["restaurant"]==r))
    dishc = Counter(x["dish"] for x in o if x["restaurant"]==fav)
    usual = dishc.most_common(1)[0][0]
    aov = round(sum(x["price"] for x in o)/n)
    veg_frac = sum(1 for x in o if x["veg"])/n
    tend = "veg-only" if veg_frac==1 else ("veg-leaning" if veg_frac>=.7 else ("mostly non-veg" if veg_frac<=.1 else "mixed"))
    dishes_at_fav = sorted(set(x["dish"] for x in o if x["restaurant"]==fav))
    return {
        "user_id": u.get("user_id"), "name": u["name"], "label": label,
        "behavior_scores": scores, "total_orders": n, "distinct_restaurants": distinct,
        "favourite_restaurant": fav, "usual_dish": usual, "dishes_already_tried_at_fav": dishes_at_fav,
        "top_cuisines": [c for c,_ in Counter(x["cuisine"] for x in o).most_common(3)],
        "diet": {"inferred": tend, "declared_hard_constraint": u.get("declared_diet","none")},
        "avg_order_value": aov, "price_band": "low" if aov<200 else ("mid" if aov<450 else "high"),
        "city": u["city"], "area": u["area"],
    }

# ---------------------------------------------------------------------------
# MOOD TAGGING (cuisine -> mood) for the context banner
# ---------------------------------------------------------------------------
MOOD_MAP = {
    "spicy":      {"Andhra","Hyderabadi","Biryani","Thai","Chettinad","Mughlai","Tandoor","Kebabs","Seafood"},
    "cold_sweet": {"Ice Cream","Desserts","Beverages","Bakery","Sweets"},
    "comforting": {"North Indian","Home Food","South Indian","Thalis","Punjabi","Bengali","Combo"},
}
def slot_now(now=None):
    now = now or datetime.now(); h = now.hour
    part = ("breakfast" if 5<=h<11 else "lunch" if 11<=h<15 else "snacks" if 15<=h<18
            else "dinner" if 18<=h<23 else "late_night")
    return {"part": part, "weekend": now.weekday()>=5, "hour": h}

def pick_mood(slot, season="summer"):
    # season + slot -> which mood to promote on the banner
    if season=="summer" and slot["part"] in ("lunch","snacks"): return "cold_sweet"
    if slot["part"] in ("dinner","late_night"): return "comforting" if season=="winter" else "spicy"
    if slot["part"]=="breakfast": return "comforting"
    return "spicy"

# ---------------------------------------------------------------------------
# STEP 4 — RETRIEVAL (RAG): narrow 8,680 -> ~15 real, relevant candidates
# ---------------------------------------------------------------------------
SLOT_CUISINE = {
    "breakfast":{"South Indian","Bakery","Beverages","Healthy Food"},
    "lunch":{"North Indian","South Indian","Biryani","Thalis","Chinese","Healthy Food","Combo"},
    "snacks":{"Fast Food","Snacks","Beverages","Desserts","Bakery","Ice Cream"},
    "dinner":{"North Indian","Chinese","Biryani","Mughlai","Tandoor","Italian","Pizzas","Continental"},
    "late_night":{"Fast Food","Pizzas","Chinese","Biryani","Desserts"},
}
def retrieve(prof, slot, limit=15):
    hard_veg = prof["diet"]["declared_hard_constraint"] in ("pure-veg","jain","vegan")
    sc = SLOT_CUISINE.get(slot["part"], set())
    fav_cuis = set(prof["top_cuisines"])
    out = []
    for r in RESTAURANTS:
        if r["city"] != prof["city"]: continue
        if hard_veg and not any(d["veg"] for d in r["menu"]): continue
        s = r["avg_rating"]*2 + min(r["total_ratings"],1000)/1000
        if r["area"]==prof["area"]: s += 3
        if sc & set(r["cuisines"]): s += 2
        if fav_cuis & set(r["cuisines"]): s += 2
        s -= r["delivery_time_min"]/60
        out.append((s, r))
    out.sort(key=lambda x: x[0], reverse=True)
    top = [r for _,r in out[:limit]]
    if hard_veg:
        top = [{**r, "menu":[d for d in r["menu"] if d["veg"]]} for r in top]
    return top

# ---------------------------------------------------------------------------
# STEP 5 — THE PROMPT  (encodes our agreed homepage rules per persona)
# ---------------------------------------------------------------------------
RULES = """
You arrange a personalised Swiggy homepage body. Output ONLY valid JSON, no prose.

GLOBAL RULES (all users):
- Use ONLY restaurants/dishes from CANDIDATES. Never invent any.
- Diet hard constraint is absolute: if veg-only, never include a non-veg dish.
- "slot" tunes CONTENTS (breakfast/lunch/dinner items) but not which blocks appear.
- Every block item must include a short human "reason".

PERSONA HERO LOGIC (block 1 depends on the label):
- 2A_loyalist HERO = "More from {favourite_restaurant}": popular dishes AT their
  favourite restaurant, EXCLUDING dishes in dishes_already_tried_at_fav. Goal: deepen trust.
- 2B_restaurant_loyal_explorer HERO = "Top-rated places matching your taste": new
  restaurants whose cuisines match top_cuisines (taste-anchored exploration toward new places).
- 2C_variety_seeker HERO = "Discovery — trending now": popular restaurants for novelty;
  preference is only a minor factor, lead with discovery beyond their usual taste.

BLOCK 2 (all personas) = "Top-rated for this slot": best candidates fitting the
  current slot + the user's preferred cuisines.
BLOCK 3 = light discovery (2A: quick picks nearby; 2B: explore new; 2C: more like places you enjoyed).

CONDITIONAL: include a "budget_99_store" block ONLY if price_band == "low".

MOOD BANNER (all users): one banner promoting the given mood as a craving entry point.

Return JSON shape:
{"hero":{"title":..., "items":[{"name":..., "restaurant":..., "reason":...}]},
 "slot_top_rated":{"title":..., "items":[...]},
 "discovery":{"title":..., "items":[...]},
 "mood_banner":{"mood":..., "title":..., "items":[...]},
 "budget_99_store": null OR {"title":..., "items":[...]}}
"""

def slim(r):  # compact a restaurant for the prompt (keep it small + cheap)
    return {"name": r["name"], "area": r["area"], "cuisines": r["cuisines"],
            "rating": r["avg_rating"], "delivery_min": r["delivery_time_min"],
            "menu": [{"dish":d["dish"],"veg":d["veg"],"price":d["price"]} for d in r["menu"]]}

def build_prompt(prof, slot, mood, candidates):
    ctx = {"profile": prof, "slot": slot, "mood": mood,
           "candidates": [slim(r) for r in candidates]}
    return RULES + "\n\nCONTEXT:\n" + json.dumps(ctx, ensure_ascii=False)

# ---------------------------------------------------------------------------
# STEP 6 — CALL GEMINI
# ---------------------------------------------------------------------------
def call_gemini(prompt):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return None
    import google.generativeai as genai
    genai.configure(api_key=key)
    model = genai.GenerativeModel("gemini-2.5-flash")  # free-tier friendly
    resp = model.generate_content(prompt)
    txt = resp.text.strip().replace("```json","").replace("```","").strip()
    return json.loads(txt)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    uid = sys.argv[1] if len(sys.argv) > 1 else "u01"
    u = dict(USERS[uid]); u["user_id"] = uid
    prof = score_user(u)
    slot = slot_now(datetime(2026,6,26,13,10))   # simulate Tue 1:10pm lunch; use slot_now() for live
    mood = pick_mood(slot, season="summer")
    cands = retrieve(prof, slot)

    print("="*70)
    print(f"USER {uid}: {prof['name']}  ->  label={prof['label']}")
    print(f"scores={prof['behavior_scores']}  fav={prof['favourite_restaurant']}  band={prof['price_band']}")
    print(f"slot={slot['part']}  mood_banner={mood}  candidates_retrieved={len(cands)}")
    print("="*70)

    prompt = build_prompt(prof, slot, mood, cands)
    home = call_gemini(prompt)

    if home is None:
        print("\n[No GEMINI_API_KEY set — showing the PROMPT that would be sent]\n")
        print(prompt[:1500] + "\n... [truncated] ...")
        print("\nSet your key and re-run to get the actual generated homepage.")
    else:
        print("\n--- GENERATED HOMEPAGE (from Gemini) ---\n")
        print(json.dumps(home, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
