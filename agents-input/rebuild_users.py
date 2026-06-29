"""
Rebuild the 3 core synthetic users so their order history uses REAL restaurants
from restaurants_with_menus.json. This makes the whole pipeline work end-to-end:
the 'favourite restaurant' hero can pull a real menu, retrieval finds real neighbours, etc.
"""
import json, random
from collections import Counter, defaultdict
random.seed(7)

R = json.load(open('/mnt/user-data/outputs/restaurants_with_menus.json'))
by_id = {r['id']: r for r in R}
blr = [r for r in R if r['city'] == 'Bangalore']
kora = [r for r in blr if r['area'] == 'Koramangala']

def pick(area_list, n):
    return random.sample(area_list, min(n, len(area_list)))

# ---- helper: make an order row from a real restaurant + one of its real dishes ----
def order(rest, dish=None, days_ago=1):
    d = dish or random.choice(rest['menu'])
    return {"restaurant_id": rest['id'], "restaurant": rest['name'], "area": rest['area'],
            "city": rest['city'], "dish": d['dish'], "veg": d['veg'], "price": d['price'],
            "cuisine": rest['cuisines'][0], "days_ago": days_ago}

# === USER 1: MEERA — pure loyalist (2A) ===
# Orders the SAME dish from ONE restaurant over and over, plus a 2nd favourite.
fav1 = kora[0]                      # her #1 restaurant (real)
fav2 = kora[1] if len(kora) > 1 else blr[1]
usual1 = fav1['menu'][0]           # her usual dish at fav1
usual2 = fav2['menu'][0]
meera_orders = ([order(fav1, usual1, 1 + i*3) for i in range(16)] +
                [order(fav2, usual2, 2 + i*4) for i in range(10)])

# === USER 2: ARJUN — restaurant-loyal explorer (2B) ===
# Loyal to 2 restaurants but tries MANY different dishes at each.
b1, b2 = kora[2], kora[3] if len(kora) > 3 else blr[2]
arjun_orders = ([order(b1, d, 3 + i*4) for i, d in enumerate(b1['menu'][:7])] +
                [order(b2, d, 5 + i*5) for i, d in enumerate(b2['menu'][:6])])

# === USER 3: NEHA — variety-seeker (2C) ===
# Orders once each from MANY different restaurants.
neha_spots = pick(blr, 12)
neha_orders = [order(s, days_ago=2 + i*3) for i, s in enumerate(neha_spots)]

# === USER 4: RAHUL — blend (heavy repeat + real exploration) ===
rfav = kora[0]
rahul_orders = ([order(rfav, rfav['menu'][0], 1 + i*2) for i in range(14)] +
                [order(s, days_ago=2 + i*3) for i, s in enumerate(pick(blr, 8))])

USERS = {
    "u01": {"name": "Meera", "city": "Bangalore", "area": "Koramangala", "declared_diet": "none", "orders": meera_orders},
    "u02": {"name": "Arjun", "city": "Bangalore", "area": "Koramangala", "declared_diet": "none", "orders": arjun_orders},
    "u03": {"name": "Neha",  "city": "Bangalore", "area": "Koramangala", "declared_diet": "none", "orders": neha_orders},
    "u04": {"name": "Rahul", "city": "Bangalore", "area": "Koramangala", "declared_diet": "none", "orders": rahul_orders},
}

json.dump(USERS, open('/mnt/user-data/outputs/synthetic_users.json', 'w'), indent=2)
for uid, u in USERS.items():
    print(f"{uid} {u['name']:7} orders={len(u['orders']):3} distinct_rest={len(set(o['restaurant'] for o in u['orders']))}  fav={Counter(o['restaurant'] for o in u['orders']).most_common(1)[0]}")
