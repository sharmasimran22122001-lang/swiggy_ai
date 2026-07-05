import { NextResponse } from 'next/server'
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
  // Different restaurant every single order
  { user_id:'u06', restaurant_id:354264, restaurant_name:'The Waffle Co',        dish:'Waffle',           veg:true,  price:200, cuisine:'Desserts',    days_ago:1  },
  { user_id:'u06', restaurant_id:354629, restaurant_name:'Box8 - Desi Meals',    dish:'Dal Makhani',      veg:true,  price:190, cuisine:'North Indian',days_ago:3  },
  { user_id:'u06', restaurant_id:354630, restaurant_name:'Itminaan Biryani',     dish:'Mutton Biryani',   veg:false, price:340, cuisine:'Biryani',     days_ago:5  },
  { user_id:'u06', restaurant_id:354631, restaurant_name:'Mealful Rolls',        dish:'Chicken Wrap',     veg:false, price:180, cuisine:'Fast Food',   days_ago:7  },
  { user_id:'u06', restaurant_id:354632, restaurant_name:'Leancrust Pizza',      dish:'Margherita Pizza', veg:true,  price:220, cuisine:'Pizza',       days_ago:9  },
  { user_id:'u06', restaurant_id:355867, restaurant_name:'Wonder Bao',           dish:'Chilli Chicken',   veg:false, price:230, cuisine:'Chinese',     days_ago:11 },
  { user_id:'u06', restaurant_id:354264, restaurant_name:'The Waffle Co',        dish:'Cold Coffee',      veg:true,  price:130, cuisine:'Cafe',        days_ago:13 },
  { user_id:'u06', restaurant_id:354630, restaurant_name:'Itminaan Biryani',     dish:'Chicken Biryani',  veg:false, price:250, cuisine:'Biryani',     days_ago:16 },
  { user_id:'u06', restaurant_id:354632, restaurant_name:'Leancrust Pizza',      dish:'Farmhouse Pizza',  veg:true,  price:280, cuisine:'Pizza',       days_ago:19 },
  { user_id:'u06', restaurant_id:354629, restaurant_name:'Box8 - Desi Meals',    dish:'Rajma Chawal',     veg:true,  price:180, cuisine:'North Indian',days_ago:21 },
  { user_id:'u06', restaurant_id:355867, restaurant_name:'Wonder Bao',           dish:'Spring Rolls',     veg:true,  price:140, cuisine:'Chinese',     days_ago:24 },
  { user_id:'u06', restaurant_id:354631, restaurant_name:'Mealful Rolls',        dish:'Veg Roll',         veg:true,  price:120, cuisine:'Fast Food',   days_ago:27 },

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
  { user_id:'u07', restaurant_id:354877, restaurant_name:'Dr Bubbles',           dish:'Mango Shake',      veg:true,  price:140, cuisine:'Beverages',   days_ago:26 },

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
  // Wide variety — different cuisine every time
  { user_id:'u09', restaurant_id:356297, restaurant_name:'Momo Raja',            dish:'Chicken Momos',    veg:false, price:120, cuisine:'Street Food', days_ago:1  },
  { user_id:'u09', restaurant_id:355133, restaurant_name:'Blue Tokai Coffee',    dish:'Cold Coffee',      veg:true,  price:150, cuisine:'Cafe',        days_ago:3  },
  { user_id:'u09', restaurant_id:356481, restaurant_name:'Zalt',                 dish:'Chicken Burger',   veg:false, price:200, cuisine:'Fast Food',   days_ago:5  },
  { user_id:'u09', restaurant_id:357341, restaurant_name:'King\'s Tea Cafe',     dish:'Masala Chai',      veg:true,  price:50,  cuisine:'Beverages',   days_ago:7  },
  { user_id:'u09', restaurant_id:365297, restaurant_name:'Roastery Coffee House',dish:'Hot Chocolate',    veg:true,  price:180, cuisine:'Cafe',        days_ago:9  },
  { user_id:'u09', restaurant_id:355057, restaurant_name:'Octa',                 dish:'Chicken Pizza',    veg:false, price:320, cuisine:'Pizza',       days_ago:11 },
  { user_id:'u09', restaurant_id:356297, restaurant_name:'Momo Raja',            dish:'Veg Momos',        veg:true,  price:100, cuisine:'Street Food', days_ago:13 },
  { user_id:'u09', restaurant_id:355133, restaurant_name:'Blue Tokai Coffee',    dish:'Cheesecake',       veg:true,  price:210, cuisine:'Desserts',    days_ago:15 },
  { user_id:'u09', restaurant_id:356481, restaurant_name:'Zalt',                 dish:'Schezwan Noodles', veg:true,  price:170, cuisine:'Chinese',     days_ago:17 },
  { user_id:'u09', restaurant_id:365297, restaurant_name:'Roastery Coffee House',dish:'Chocolate Brownie',veg:true,  price:160, cuisine:'Desserts',    days_ago:19 },
  { user_id:'u09', restaurant_id:357341, restaurant_name:'King\'s Tea Cafe',     dish:'Iced Tea',         veg:true,  price:80,  cuisine:'Beverages',   days_ago:22 },
  { user_id:'u09', restaurant_id:355057, restaurant_name:'Octa',                 dish:'Pasta Alfredo',    veg:true,  price:220, cuisine:'Italian',     days_ago:25 },
]

export async function GET() {
  try {
    // Insert users (skip if already exist)
    const { data: existingUsers } = await supabaseAdmin.from('users').select('id')
    const existingIds = new Set((existingUsers ?? []).map((u: any) => u.id))
    const usersToInsert = NEW_USERS.filter(u => !existingIds.has(u.id))

    if (usersToInsert.length > 0) {
      const { error } = await supabaseAdmin.from('users').insert(usersToInsert)
      if (error) throw new Error(`Users insert failed: ${error.message}`)
    }

    // Insert orders
    const { data: existingOrders } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .in('user_id', NEW_USERS.map(u => u.id))
    const alreadyHaveOrders = new Set((existingOrders ?? []).map((o: any) => o.user_id))
    const ordersToInsert = NEW_ORDERS.filter(o => !alreadyHaveOrders.has(o.user_id))

    if (ordersToInsert.length > 0) {
      const { error } = await supabaseAdmin.from('orders').insert(ordersToInsert)
      if (error) throw new Error(`Orders insert failed: ${error.message}`)
    }

    return NextResponse.json({
      message: 'Done',
      users_inserted: usersToInsert.length,
      orders_inserted: ordersToInsert.length,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
