"""
STEP 4 — RETRIEVAL (the 'R' in RAG)
Given a user's city/area + current slot + diet, filter the 8,680 restaurants
down to a small, real, relevant candidate set to hand the LLM.
NO AI here. Just filtering and ranking your own data so the LLM can't hallucinate.
"""
import json
from datetime import datetime

with open('/mnt/user-data/outputs/restaurants_with_menus.json') as f:
    RESTAURANTS = json.load(f)

# ---- slot is computed from the clock, NOT from the dataset ----
def current_slot(now=None):
    now = now or datetime.now()
    h = now.hour
    weekend = now.weekday() >= 5  # Sat/Sun
    if   5 <= h < 11:  part = "breakfast"
    elif 11 <= h < 15: part = "lunch"
    elif 15 <= h < 18: part = "snacks"
    elif 18 <= h < 23: part = "dinner"
    else:              part = "late_night"
    return {"part": part, "weekend": weekend}

# cuisines that fit each slot (used to gently prefer slot-appropriate places)
SLOT_CUISINE_HINT = {
    "breakfast": {"South Indian","Bakery","Beverages","Healthy Food"},
    "lunch":     {"North Indian","South Indian","Biryani","Thalis","Chinese","Healthy Food","Combo"},
    "snacks":    {"Fast Food","Snacks","Beverages","Desserts","Bakery","Ice Cream"},
    "dinner":    {"North Indian","Chinese","Biryani","Mughlai","Tandoor","Italian","Pizzas","Continental"},
    "late_night":{"Fast Food","Pizzas","Chinese","Biryani","Desserts"},
}

def menu_has_veg_option(rest):
    return any(d["veg"] for d in rest["menu"])

def retrieve(user, slot, limit=15):
    """user needs: city, area, diet hard constraint (none/pure-veg), price band."""
    city = user["location"]["city"]
    area = user["location"].get("area")
    hard_veg = user["diet"]["declared_hard_constraint"] in ("pure-veg","jain","vegan")
    slot_cuisines = SLOT_CUISINE_HINT.get(slot["part"], set())

    pool = []
    for r in RESTAURANTS:
        # 1) serviceability proxy: same city (and prefer same area)
        if r["city"] != city:
            continue
        # 2) diet hard rule: if user is strictly veg, restaurant must have veg options
        if hard_veg and not menu_has_veg_option(r):
            continue
        # 3) score the candidate for relevance
        score = 0.0
        score += r["avg_rating"] * 2                      # quality
        score += min(r["total_ratings"], 1000) / 1000     # popularity (capped)
        if area and r["area"] == area:                    # proximity bonus
            score += 3
        if slot_cuisines & set(r["cuisines"]):            # slot fit
            score += 2
        score -= r["delivery_time_min"] / 60              # faster is better
        pool.append((score, r))

    pool.sort(key=lambda x: x[0], reverse=True)
    top = [r for _, r in pool[:limit]]

    # For strictly-veg users, strip non-veg dishes from the menus we pass on
    if hard_veg:
        cleaned = []
        for r in top:
            r = dict(r)
            r["menu"] = [d for d in r["menu"] if d["veg"]]
            cleaned.append(r)
        top = cleaned
    return top

# ---------- DEMO ----------
if __name__ == "__main__":
    # Example user (a Bangalore loyalist, no hard diet rule)
    user_meera = {
        "user_id":"u01","name":"Meera",
        "location":{"city":"Bangalore","area":"Koramangala"},
        "diet":{"declared_hard_constraint":"none"},
        "price_affinity":{"band":"mid"},
    }
    # Example veg user to show the diet guardrail
    user_priya = {
        "user_id":"u05","name":"Priya",
        "location":{"city":"Pune","area":"Kothrud"},
        "diet":{"declared_hard_constraint":"pure-veg"},
        "price_affinity":{"band":"low"},
    }

    slot = current_slot(datetime(2026,6,26,13,10))  # simulate Tuesday 1:10pm => weekday lunch
    print("COMPUTED SLOT:", slot, "\n")

    res = retrieve(user_meera, slot, limit=5)
    print(f"Top {len(res)} candidates for Meera (Bangalore, lunch):")
    for r in res:
        print(f"  - {r['name']} | {r['area']} | {','.join(r['cuisines'][:3])} | rating {r['avg_rating']} | {r['delivery_time_min']}min | {len(r['menu'])} dishes")

    print()
    res2 = retrieve(user_priya, slot, limit=5)
    print(f"Top {len(res2)} candidates for Priya (Pune, pure-veg) — note menus are veg-only:")
    for r in res2:
        nonveg = [d for d in r["menu"] if not d["veg"]]
        print(f"  - {r['name']} | dishes:{len(r['menu'])} | non-veg leaked: {len(nonveg)} (must be 0)")
