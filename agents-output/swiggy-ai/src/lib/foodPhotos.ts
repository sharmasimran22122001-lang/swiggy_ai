// Real food photography (Unsplash CDN) keyed by dish/cuisine/restaurant keywords.
// All URLs verified reachable. getFoodPhoto is deterministic per name so the
// same dish always shows the same photo.

const U = (id: string) => `https://images.unsplash.com/${id}?w=400&q=60&auto=format&fit=crop`

const PHOTOS = {
  biryani1: U('photo-1563379091339-03b21ab4a4f8'),
  biryani2: U('photo-1589302168068-964664d93dc0'),
  biryani3: U('photo-1633945274405-b6c8069047b0'),
  pizza1: U('photo-1513104890138-7c749659a591'),
  pizza2: U('photo-1565299624946-b28f40a0ae38'),
  burger1: U('photo-1568901346375-23c9450c58cd'),
  burger2: U('photo-1571091718767-18b5b1457add'),
  dosa1: U('photo-1630383249896-424e482df921'),
  dosa2: U('photo-1668236543090-82eba5ee5976'),
  noodles: U('photo-1585032226651-759b368d7246'),
  ramen: U('photo-1569718212165-3a8278d5f624'),
  dimsum: U('photo-1563245372-f21724e3856d'),
  momos: U('photo-1626776876729-bab4369a5a5a'),
  cake: U('photo-1578985545062-69928b1d9587'),
  dessert: U('photo-1551024506-0bccd828d307'),
  coffee1: U('photo-1509042239860-f550ce710b93'),
  coffee2: U('photo-1461023058943-07fcbe16d735'),
  indian: U('photo-1585937421612-70a008356fbe'),
  thali: U('photo-1567188040759-fb8a883dc6d8'),
  paneer: U('photo-1631452180519-c014fe946bc7'),
  kebab: U('photo-1603360946369-dc9bb6258143'),
  samosa: U('photo-1601050690597-df0568f70950'),
  chai: U('photo-1571934811356-5cc061b6821f'),
  icecream: U('photo-1497034825429-c343d7c6a68f'),
  salad: U('photo-1546069901-ba9599a7e63c'),
  bowl: U('photo-1512621776951-a57141f2eefd'),
  pasta: U('photo-1621996346565-e3dbc646d9a9'),
  friedchicken: U('photo-1562967914-608f82629710'),
  sandwich: U('photo-1528735602780-2552fd46c7af'),
  pancakes: U('photo-1567620905732-2d1ec7ab7445'),
  waffle: U('photo-1562376552-0d160a2f238d'),
  juice: U('photo-1600271886742-f049cd451bba'),
  wrap: U('photo-1626700051175-6818013e1d4f'),
  currybowl: U('photo-1631515243349-e0cb75fb8d3a'),
  seafood: U('photo-1559737558-2f5a35f4523b'),
  bread: U('photo-1509440159596-0249088772ff'),
  restaurant1: U('photo-1517248135467-4c7edcad34c4'),
  restaurant2: U('photo-1552566626-52f8b828add9'),
  restaurant3: U('photo-1414235077428-338989a2e8c0'),
}

// Order matters: more specific keywords first.
const KEYWORD_PHOTOS: Array<{ keys: string[]; photos: string[] }> = [
  { keys: ['biryani', 'pulao', 'fried rice', 'rice'],                        photos: [PHOTOS.biryani1, PHOTOS.biryani2, PHOTOS.biryani3] },
  { keys: ['pizza', 'margherita', 'farmhouse'],                              photos: [PHOTOS.pizza1, PHOTOS.pizza2] },
  { keys: ['burger', 'smash'],                                               photos: [PHOTOS.burger1, PHOTOS.burger2] },
  { keys: ['dosa', 'uttapam'],                                               photos: [PHOTOS.dosa1, PHOTOS.dosa2] },
  { keys: ['idli', 'vada', 'south indian', 'udupi', 'tiffin'],               photos: [PHOTOS.dosa2, PHOTOS.dosa1] },
  { keys: ['ramen', 'soup', 'maggi'],                                        photos: [PHOTOS.ramen] },
  { keys: ['noodle', 'chowmein', 'schezwan', 'hakka', 'chinese', 'wok', 'manchurian'], photos: [PHOTOS.noodles, PHOTOS.ramen] },
  { keys: ['momo', 'dumpling', 'wonton', 'dim sum', 'dimsum', 'bao'],        photos: [PHOTOS.momos, PHOTOS.dimsum] },
  { keys: ['cake', 'pastry', 'brownie', 'cheesecake'],                       photos: [PHOTOS.cake, PHOTOS.dessert] },
  { keys: ['dessert', 'sweet', 'rasmalai', 'gulab', 'phirni', 'kunafa'],     photos: [PHOTOS.dessert, PHOTOS.cake] },
  { keys: ['coffee', 'cappuccino', 'latte', 'brew', 'cafe', 'chocolate'],    photos: [PHOTOS.coffee1, PHOTOS.coffee2] },
  { keys: ['chai', 'tea'],                                                   photos: [PHOTOS.chai] },
  { keys: ['ice cream', 'sundae', 'falooda', 'kulfi', 'shake'],              photos: [PHOTOS.icecream] },
  { keys: ['paneer', 'dal', 'makhani', 'kadai', 'korma', 'curry', 'masala', 'butter chicken', 'rajma', 'palak'], photos: [PHOTOS.paneer, PHOTOS.currybowl, PHOTOS.indian] },
  { keys: ['thali', 'meal', 'combo', 'platter', 'home food', 'homely'],      photos: [PHOTOS.thali, PHOTOS.indian] },
  { keys: ['kebab', 'seekh', 'tikka', 'tandoor', 'grill', 'bbq', 'barbeque', 'mughlai'], photos: [PHOTOS.kebab] },
  { keys: ['samosa', 'pakoda', 'tikki', 'chaat', 'puchka', 'street'],        photos: [PHOTOS.samosa] },
  { keys: ['salad', 'healthy', 'caesar'],                                    photos: [PHOTOS.salad, PHOTOS.bowl] },
  { keys: ['pasta', 'alfredo', 'italian'],                                   photos: [PHOTOS.pasta] },
  { keys: ['chicken', 'wings', 'nuggets', 'popcorn', 'kfc'],                 photos: [PHOTOS.friedchicken] },
  { keys: ['sandwich', 'sub', 'toast'],                                      photos: [PHOTOS.sandwich] },
  { keys: ['pancake'],                                                       photos: [PHOTOS.pancakes] },
  { keys: ['waffle'],                                                        photos: [PHOTOS.waffle] },
  { keys: ['juice', 'mojito', 'beverage', 'cold drink', 'soda', 'bubble'],   photos: [PHOTOS.juice] },
  { keys: ['wrap', 'roll', 'frankie', 'shawarma', 'burrito', 'taco'],        photos: [PHOTOS.wrap] },
  { keys: ['fish', 'prawn', 'seafood', 'crab'],                              photos: [PHOTOS.seafood] },
  { keys: ['bread', 'bakery', 'bun', 'croissant', 'pav'],                    photos: [PHOTOS.bread] },
  { keys: ['north indian', 'punjab', 'dhaba', 'hyderabadi', 'andhra', 'bengali', 'indian'], photos: [PHOTOS.indian, PHOTOS.currybowl, PHOTOS.thali] },
]

const FALLBACK_POOL = [
  PHOTOS.indian, PHOTOS.currybowl, PHOTOS.restaurant1, PHOTOS.bowl,
  PHOTOS.restaurant2, PHOTOS.thali, PHOTOS.restaurant3, PHOTOS.noodles,
]

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return Math.abs(h)
}

/** Deterministic real photo for a dish, cuisine, or restaurant name. */
export function getFoodPhoto(name: string, extra = ''): string {
  const n = `${name} ${extra}`.toLowerCase()
  const h = hashName(name)
  for (const entry of KEYWORD_PHOTOS) {
    if (entry.keys.some(k => n.includes(k))) {
      return entry.photos[h % entry.photos.length]
    }
  }
  return FALLBACK_POOL[h % FALLBACK_POOL.length]
}
