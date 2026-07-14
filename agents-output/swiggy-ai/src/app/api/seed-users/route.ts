import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const NEW_USERS = [
  { id: 'u05', name: 'Priya Nair',    city: 'Mumbai',    area: 'Bandra West',  declared_diet: 'none' },
  { id: 'u06', name: 'Vikram Bose',   city: 'Delhi',     area: 'Connaught Place', declared_diet: 'none' },
  { id: 'u07', name: 'Kavitha Rajan', city: 'Chennai',   area: 'T Nagar',      declared_diet: 'none' },
  { id: 'u08', name: 'Sanjay Reddy',  city: 'Hyderabad', area: 'Banjara Hills', declared_diet: 'none' },
  { id: 'u09', name: 'Ananya Das',    city: 'Kolkata',   area: 'Park Street',  declared_diet: 'none' },
]

// Orders that shape each user's persona for the Gemini profiler
// 2A Loyalist  — repeats same restaurant + same dish heavily
// 2B Explorer  — loyal to 2-3 restaurants, tries different dishes each time
// 2C Variety   — different restaurant every order, wide cuisine spread

const NEW_ORDERS = [
  // ── u05 Priya Nair · Mumbai · 2B Explorer ──────────────────────────────────
  // Primary loyalty: Mumbai Bites (354801), secondary: Home Plate (355224)
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'Chicken Burger',  veg:false, price:180, cuisine:'Fast Food',   days_ago:1  },
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'Veg Wrap',        veg:true,  price:150, cuisine:'Fast Food',   days_ago:4  },
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'Peri Peri Fries', veg:true,  price:100, cuisine:'Fast Food',   days_ago:8  },
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'Chicken Nuggets', veg:false, price:190, cuisine:'Fast Food',   days_ago:11 },
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'French Fries',    veg:true,  price:100, cuisine:'Fast Food',   days_ago:15 },
  { user_id:'u05', restaurant_id:354801, restaurant_name:'Mumbai Bites',  dish:'Chicken Wrap',    veg:false, price:200, cuisine:'Fast Food',   days_ago:18 },
  { user_id:'u05', restaurant_id:355224, restaurant_name:'Home Plate',    dish:'Butter Chicken',  veg:false, price:280, cuisine:'North Indian',days_ago:6  },
  { user_id:'u05', restaurant_id:355224, restaurant_name:'Home Plate',    dish:'Dal Makhani',     veg:true,  price:210, cuisine:'North Indian',days_ago:13 },
  { user_id:'u05', restaurant_id:355224, restaurant_name:'Home Plate',    dish:'Paneer Tikka',    veg:true,  price:260, cuisine:'North Indian',days_ago:20 },
  { user_id:'u05', restaurant_id:355224, restaurant_name:'Home Plate',    dish:'Tandoori Chicken',veg:false, price:320, cuisine:'North Indian',days_ago:25 },
  { user_id:'u05', restaurant_id:355443, restaurant_name:'Chinese Culture', dish:'Chicken Manchurian',veg:false,price:210,cuisine:'Chinese',  days_ago:10 },
  { user_id:'u05', restaurant_id:355443, restaurant_name:'Chinese Culture', dish:'Veg Fried Rice', veg:true, price:150,cuisine:'Chinese',     days_ago:22 },

  // ── u06 Vikram Bose · Delhi · 2C Variety Seeker ────────────────────────────
  // One visit per restaurant → explore=1.0 wins; variety=0 (no restaurant visited ≥2 times)
  { user_id:'u06', restaurant_id:354264, restaurant_name:'The Waffle Co',        dish:'Waffle',              veg:true,  price:200, cuisine:'Desserts',    days_ago:1  },
  { user_id:'u06', restaurant_id:354629, restaurant_name:'Box8 - Desi Meals',    dish:'Dal Makhani',          veg:true,  price:190, cuisine:'North Indian',days_ago:3  },
  { user_id:'u06', restaurant_id:354630, restaurant_name:'Itminaan Biryani',     dish:'Mutton Biryani',       veg:false, price:340, cuisine:'Biryani',     days_ago:5  },
  { user_id:'u06', restaurant_id:354631, restaurant_name:'Mealful Rolls',        dish:'Chicken Wrap',         veg:false, price:180, cuisine:'Fast Food',   days_ago:7  },
  { user_id:'u06', restaurant_id:354632, restaurant_name:'Leancrust Pizza',      dish:'Margherita Pizza',     veg:true,  price:220, cuisine:'Pizza',       days_ago:9  },
  { user_id:'u06', restaurant_id:355867, restaurant_name:'Wonder Bao',           dish:'Chilli Chicken',       veg:false, price:230, cuisine:'Chinese',     days_ago:11 },
  { user_id:'u06', restaurant_id:354803, restaurant_name:'Biryani Blues',        dish:'Chicken Dum Biryani',  veg:false, price:270, cuisine:'Biryani',     days_ago:13 },
  { user_id:'u06', restaurant_id:354870, restaurant_name:'Wow! Momo',            dish:'Tandoori Momo',        veg:true,  price:170, cuisine:'Street Food', days_ago:16 },
  { user_id:'u06', restaurant_id:354956, restaurant_name:'Burger Singh',         dish:'Big Singh Burger',     veg:false, price:250, cuisine:'Fast Food',   days_ago:19 },
  { user_id:'u06', restaurant_id:355012, restaurant_name:'Moti Mahal Delux',     dish:'Butter Chicken',       veg:false, price:320, cuisine:'North Indian',days_ago:21 },
  { user_id:'u06', restaurant_id:355234, restaurant_name:'Haldiram\'s',          dish:'Aloo Tikki',           veg:true,  price:80,  cuisine:'Street Food', days_ago:24 },
  { user_id:'u06', restaurant_id:355456, restaurant_name:'The Good Bowl',        dish:'Thai Green Curry',     veg:true,  price:290, cuisine:'Thai',        days_ago:27 },

  // ── u07 Kavitha Rajan · Chennai · 2A Loyalist ──────────────────────────────
  // Almost exclusively orders Chicken Biryani from Ss Hyderabad Biryani
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:1  },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:4  },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:7  },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:10 },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:13 },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Mutton Biryani',   veg:false, price:300, cuisine:'Biryani',     days_ago:17 },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:20 },
  { user_id:'u07', restaurant_id:355835, restaurant_name:'Ss Hyderabad Biryani', dish:'Chicken Biryani',  veg:false, price:220, cuisine:'Biryani',     days_ago:23 },
  { user_id:'u07', restaurant_id:354877, restaurant_name:'Dr Bubbles',           dish:'Cold Coffee',      veg:true,  price:130, cuisine:'Beverages',   days_ago:9  },
  { user_id:'u07', restaurant_id:354877, restaurant_name:'Dr Bubbles',           dish:'Cold Coffee',      veg:true,  price:130, cuisine:'Beverages',   days_ago:26 },

  // ── u08 Sanjay Reddy · Hyderabad · 2B Explorer ─────────────────────────────
  // Loyal to Shahi Zaiqa + Udupi Dosa House, tries different dishes
  { user_id:'u08', restaurant_id:354536, restaurant_name:'Shahi Zaiqa',          dish:'Chicken Biryani',  veg:false, price:260, cuisine:'Biryani',     days_ago:2  },
  { user_id:'u08', restaurant_id:354536, restaurant_name:'Shahi Zaiqa',          dish:'Mutton Rogan Josh',veg:false, price:380, cuisine:'North Indian',days_ago:6  },
  { user_id:'u08', restaurant_id:354536, restaurant_name:'Shahi Zaiqa',          dish:'Butter Chicken',   veg:false, price:280, cuisine:'North Indian',days_ago:10 },
  { user_id:'u08', restaurant_id:354536, restaurant_name:'Shahi Zaiqa',          dish:'Seekh Kebab',      veg:false, price:290, cuisine:'North Indian',days_ago:14 },
  { user_id:'u08', restaurant_id:354536, restaurant_name:'Shahi Zaiqa',          dish:'Dal Makhani',      veg:true,  price:210, cuisine:'North Indian',days_ago:18 },
  { user_id:'u08', restaurant_id:354672, restaurant_name:'Udupi Dosa House',     dish:'Masala Dosa',      veg:true,  price:120, cuisine:'South Indian',days_ago:4  },
  { user_id:'u08', restaurant_id:354672, restaurant_name:'Udupi Dosa House',     dish:'Medu Vada',        veg:true,  price:90,  cuisine:'South Indian',days_ago:8  },
  { user_id:'u08', restaurant_id:354672, restaurant_name:'Udupi Dosa House',     dish:'Idli Sambar',      veg:true,  price:80,  cuisine:'South Indian',days_ago:12 },
  { user_id:'u08', restaurant_id:354672, restaurant_name:'Udupi Dosa House',     dish:'Uttapam',          veg:true,  price:120, cuisine:'South Indian',days_ago:16 },
  { user_id:'u08', restaurant_id:354818, restaurant_name:'Saira Home Made Food', dish:'Chicken Curry',    veg:false, price:200, cuisine:'Home Food',   days_ago:22 },
  { user_id:'u08', restaurant_id:354818, restaurant_name:'Saira Home Made Food', dish:'Palak Paneer',     veg:true,  price:230, cuisine:'Home Food',   days_ago:28 },

  // ── u09 Ananya Das · Kolkata · 2C Variety Seeker ───────────────────────────
  // One visit per restaurant → explore=1.0 wins; variety=0 (no restaurant visited ≥2 times)
  { user_id:'u09', restaurant_id:356297, restaurant_name:'Momo Raja',            dish:'Chicken Momos',        veg:false, price:120, cuisine:'Street Food', days_ago:1  },
  { user_id:'u09', restaurant_id:355133, restaurant_name:'Blue Tokai Coffee',    dish:'Cold Coffee',           veg:true,  price:150, cuisine:'Cafe',        days_ago:3  },
  { user_id:'u09', restaurant_id:356481, restaurant_name:'Zalt',                 dish:'Chicken Burger',        veg:false, price:200, cuisine:'Fast Food',   days_ago:5  },
  { user_id:'u09', restaurant_id:357341, restaurant_name:'King\'s Tea Cafe',     dish:'Masala Chai',           veg:true,  price:50,  cuisine:'Beverages',   days_ago:7  },
  { user_id:'u09', restaurant_id:365297, restaurant_name:'Roastery Coffee House',dish:'Hot Chocolate',         veg:true,  price:180, cuisine:'Cafe',        days_ago:9  },
  { user_id:'u09', restaurant_id:355057, restaurant_name:'Octa',                 dish:'Chicken Pizza',         veg:false, price:320, cuisine:'Pizza',       days_ago:11 },
  { user_id:'u09', restaurant_id:356892, restaurant_name:'Peter Cat',            dish:'Chelo Kebab',           veg:false, price:450, cuisine:'Continental', days_ago:13 },
  { user_id:'u09', restaurant_id:357023, restaurant_name:'Arsalan',              dish:'Mutton Biryani',        veg:false, price:350, cuisine:'Biryani',     days_ago:16 },
  { user_id:'u09', restaurant_id:355812, restaurant_name:'Tung Fong',            dish:'Prawn Fried Rice',      veg:false, price:280, cuisine:'Chinese',     days_ago:19 },
  { user_id:'u09', restaurant_id:356101, restaurant_name:'Flurys',               dish:'Pastry Platter',        veg:true,  price:220, cuisine:'Bakery',      days_ago:21 },
  { user_id:'u09', restaurant_id:355678, restaurant_name:'Street on My Plate',   dish:'Puchka',                veg:true,  price:40,  cuisine:'Street Food', days_ago:24 },
  { user_id:'u09', restaurant_id:357455, restaurant_name:'Chaitown',             dish:'Adrak Chai',            veg:true,  price:60,  cuisine:'Beverages',   days_ago:27 },
]

export async function GET(req: NextRequest) {
  if (req.headers.get('x-seed-secret') !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const demoIds = NEW_USERS.map(u => u.id)

    // Upsert users
    const { error: userErr } = await supabaseAdmin
      .from('users')
      .upsert(NEW_USERS.map(u => ({ id: u.id, name: u.name, city: u.city, area: u.area, declared_diet: u.declared_diet })), { onConflict: 'id' })
    if (userErr) throw new Error(`Users upsert failed: ${userErr.message}`)

    // Delete existing orders for these demo users then reinsert with corrected history
    const { error: delErr } = await supabaseAdmin.from('orders').delete().in('user_id', demoIds)
    if (delErr) throw new Error(`Orders delete failed: ${delErr.message}`)

    const { error: ordErr } = await supabaseAdmin.from('orders').insert(NEW_ORDERS)
    if (ordErr) throw new Error(`Orders insert failed: ${ordErr.message}`)

    // Flush homepage cache so next login regenerates with correct persona
    await supabaseAdmin.from('homepage_cache').delete().in('user_id', demoIds)

    return NextResponse.json({
      message: 'Done',
      users_seeded: NEW_USERS.length,
      orders_seeded: NEW_ORDERS.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
