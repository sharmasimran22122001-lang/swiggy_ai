// Maps dish names to Unsplash food photo search terms.
// sig parameter makes results deterministic — same dish always returns same photo.

const MAPPINGS: [string[], string, number][] = [
  [['butter chicken', 'murgh makhani'],                    'butter+chicken+curry+indian',     1],
  [['biryani', 'dum biryani', 'hyderabadi biryani', 'chicken 65 biryani'], 'biryani+rice+indian+food', 2],
  [['masala dosa', 'dosa', 'mysore masala dosa', 'rava dosa'], 'dosa+south+indian+breakfast', 3],
  [['idli', 'idly', 'idli sambar'],                        'idli+sambar+south+indian',        4],
  [['medu vada', 'vada', 'vada sambar'],                   'vada+sambar+south+indian',        5],
  [['pizza', 'margherita', 'farmhouse', 'veggie supreme', 'chicken pizza'], 'pizza+italian+food', 6],
  [['burger', 'veg burger', 'chicken burger'],             'burger+fast+food+gourmet',        7],
  [['paneer tikka', 'paneer butter masala', 'shahi paneer', 'palak paneer', 'chilli paneer'], 'paneer+indian+food+curry', 8],
  [['chicken tikka', 'tandoori chicken', 'chicken malai kebab'], 'tandoori+chicken+indian',   9],
  [['seekh kebab', 'galouti kebab', 'tangdi kebab', 'hariyali tikka'], 'kebab+indian+restaurant', 10],
  [['mutton biryani', 'mutton korma', 'mutton rogan josh', 'mutton seekh kebab'], 'mutton+curry+indian', 11],
  [['chicken biryani'],                                    'chicken+biryani+indian',          12],
  [['schezwan noodles', 'veg hakka noodles', 'noodles'],   'noodles+chinese+asian+food',     13],
  [['chicken fried rice', 'veg fried rice', 'fried rice'], 'fried+rice+asian+food',          14],
  [['chicken manchurian', 'veg manchurian', 'chilli chicken'], 'chinese+indian+food',         15],
  [['prawn', 'butter garlic prawns', 'prawn masala', 'prawn biryani'], 'prawn+seafood+curry', 16],
  [['fish curry', 'fish fry', 'fish tikka', 'fish & chips', 'grilled fish'], 'fish+curry+seafood', 17],
  [['crab masala', 'squid fry'],                           'seafood+crab+coastal',            18],
  [['dal makhani', 'dal tadka', 'rajma chawal'],           'dal+makhani+indian+lentils',     19],
  [['chole bhature', 'pav bhaji', 'vada pav'],             'street+food+indian+spicy',       20],
  [['momos', 'chicken momos', 'veg momos'],                'momos+dumplings+street+food',    21],
  [['chicken wrap', 'veg wrap', 'kathi roll', 'egg roll', 'veg roll'], 'roll+wrap+street+food', 22],
  [['masala chai', 'filter coffee', 'cold coffee', 'iced tea'], 'indian+chai+coffee+beverage', 23],
  [['gulab jamun', 'rasmalai', 'kulfi', 'falooda'],        'indian+sweets+dessert',          24],
  [['waffle', 'cheesecake', 'chocolate brownie', 'tiramisu', 'choco lava cake'], 'dessert+cafe+food', 25],
  [['ice cream sundae', 'mango shake', 'oreo shake'],      'ice+cream+milkshake+dessert',    26],
  [['veg thali', 'fish thali', 'chicken thali'],           'indian+thali+meal+plate',        27],
  [['pasta alfredo', 'penne arrabiata', 'pesto pasta', 'mac & cheese'], 'pasta+italian+food', 28],
  [['mushroom risotto', 'mushroom tikka'],                 'mushroom+food+restaurant',       29],
  [['caesar salad', 'bruschetta'],                         'salad+healthy+food',             30],
  [['grilled chicken', 'chicken steak'],                   'grilled+chicken+restaurant',     31],
  [['french fries', 'peri peri fries', 'spring rolls'],   'fries+fast+food+snack',          32],
  [['uttapam', 'pongal', 'curd rice'],                     'south+indian+breakfast+food',    33],
]

export function getFoodImageUrl(dishName: string, width = 400, height = 300): string {
  const lower = dishName.toLowerCase()
  for (const [keywords, searchTerm, sig] of MAPPINGS) {
    if (keywords.some(k => lower.includes(k) || k.includes(lower))) {
      return `https://source.unsplash.com/featured/${width}x${height}/?${searchTerm}&sig=${sig}`
    }
  }
  // Fallback — generic Indian restaurant food photo, seeded by dish name
  const sig = lower.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 40 + 50
  return `https://source.unsplash.com/featured/${width}x${height}/?indian+food+restaurant+dish&sig=${sig}`
}
