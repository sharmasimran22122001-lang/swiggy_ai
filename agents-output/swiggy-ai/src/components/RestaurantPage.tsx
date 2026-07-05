'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'

// ─── Static restaurant menu database (cuisine-keyed) ────────────────────────

interface MenuItem {
  dish: string
  desc: string
  price: number
  veg: boolean
  tag: string
}

const MENUS: Record<string, MenuItem[]> = {
  'north-indian': [
    { dish: 'Butter Chicken', desc: 'Creamy tomato gravy · Boneless chicken', price: 320, veg: false, tag: 'Bestseller' },
    { dish: 'Dal Makhani', desc: 'Slow cooked overnight · Smoky & rich', price: 180, veg: true, tag: 'Popular' },
    { dish: 'Paneer Tikka', desc: 'Grilled in tandoor · 6 pcs', price: 260, veg: true, tag: '' },
    { dish: 'Garlic Naan', desc: 'Freshly baked · Buttered', price: 55, veg: true, tag: '' },
    { dish: 'Chicken Seekh Kebab', desc: 'Juicy minced chicken · 6 pcs', price: 320, veg: false, tag: '' },
    { dish: 'Veg Thali', desc: 'Dal · Sabzi · Rice · Naan · Salad', price: 220, veg: true, tag: 'Value Meal' },
  ],
  'south-indian': [
    { dish: 'Masala Dosa', desc: 'Crispy · Potato masala filling · With sambar & chutney', price: 110, veg: true, tag: 'Bestseller' },
    { dish: 'Idli Sambar', desc: '3 soft idlis · Fresh sambar & chutneys', price: 90, veg: true, tag: 'Breakfast' },
    { dish: 'Rava Uttapam', desc: 'Loaded with veggies · Soft centre', price: 130, veg: true, tag: '' },
    { dish: 'Medu Vada', desc: 'Crispy lentil fritters · 2 pcs', price: 80, veg: true, tag: 'Popular' },
    { dish: 'Filter Coffee', desc: 'Strong, frothy South Indian style', price: 60, veg: true, tag: '' },
    { dish: 'Chettinad Chicken Curry', desc: 'Aromatic · Freshly ground spices', price: 280, veg: false, tag: '' },
  ],
  'biryani': [
    { dish: 'Chicken Dum Biryani', desc: 'Slow dum cooked · Whole spices · Raita included', price: 230, veg: false, tag: 'Bestseller' },
    { dish: 'Veg Biryani', desc: 'Fragrant basmati rice · Garden veggies', price: 180, veg: true, tag: '' },
    { dish: 'Mutton Biryani', desc: 'Tender mutton pieces · Slow cooked', price: 290, veg: false, tag: 'Chef Special' },
    { dish: 'Egg Biryani', desc: 'Boiled eggs · Seeraga samba rice', price: 180, veg: false, tag: 'Popular' },
    { dish: 'Mutton Korma', desc: 'Rich gravy · Best with naan', price: 350, veg: false, tag: '' },
    { dish: 'Raita', desc: 'Chilled yoghurt with boondi', price: 60, veg: true, tag: '' },
  ],
  'chinese': [
    { dish: 'Kung Pao Chicken', desc: 'Spicy · Wok tossed · Peanuts', price: 340, veg: false, tag: 'Bestseller' },
    { dish: 'Veg Fried Rice', desc: 'Wok tossed with garden veggies', price: 200, veg: true, tag: '' },
    { dish: 'Chicken Noodles', desc: 'Hong Kong style · Thin noodles', price: 260, veg: false, tag: '' },
    { dish: 'Paneer Manchurian', desc: 'Crispy paneer · Schezwan sauce', price: 280, veg: true, tag: 'Popular' },
    { dish: 'Spring Rolls', desc: 'Crispy · 4 pcs with dipping sauce', price: 180, veg: true, tag: '' },
    { dish: 'Chicken Manchow Soup', desc: 'Hot & sour · Crunchy noodles on top', price: 160, veg: false, tag: '' },
  ],
  'pizza': [
    { dish: 'Margherita', desc: 'Classic tomato base · Mozzarella · Basil', price: 280, veg: true, tag: 'Classic' },
    { dish: 'Chicken BBQ', desc: 'Grilled chicken · BBQ sauce · Peppers', price: 380, veg: false, tag: 'Bestseller' },
    { dish: 'Paneer Tikka Pizza', desc: 'Spiced paneer · Bell peppers · Onion', price: 340, veg: true, tag: 'Popular' },
    { dish: 'Garlic Bread', desc: 'Herb butter · 4 slices', price: 120, veg: true, tag: '' },
    { dish: 'Pasta Arrabiata', desc: 'Spicy tomato sauce · Penne', price: 260, veg: true, tag: '' },
    { dish: 'Chicken Peri Peri', desc: 'Fiery peri peri sauce · Olives', price: 420, veg: false, tag: '' },
  ],
  'burgers': [
    { dish: 'Smash Burger', desc: 'Double smashed patty · American cheese', price: 320, veg: false, tag: 'Bestseller' },
    { dish: 'Crispy Chicken Burger', desc: 'Fried chicken · Coleslaw · Sriracha mayo', price: 280, veg: false, tag: 'Popular' },
    { dish: 'Veggie Delight', desc: 'Crispy patty · Fresh veggies · Chipotle', price: 220, veg: true, tag: '' },
    { dish: 'Classic Fries', desc: 'Golden, crispy · With dipping sauce', price: 120, veg: true, tag: '' },
    { dish: 'Chocolate Shake', desc: 'Thick, creamy · Belgian chocolate', price: 160, veg: true, tag: '' },
    { dish: 'Cheese Fries', desc: 'Loaded with cheddar sauce', price: 160, veg: true, tag: '' },
  ],
  'desserts': [
    { dish: 'Nutella Waffle', desc: 'Warm waffle · Nutella · Vanilla ice cream', price: 220, veg: true, tag: 'Bestseller' },
    { dish: 'Molten Lava Cake', desc: 'Warm chocolate · Vanilla scoop', price: 190, veg: true, tag: 'Popular' },
    { dish: 'Cold Stone Sundae', desc: '3 scoops · Choice of toppings', price: 280, veg: true, tag: '' },
    { dish: 'Mango Mousse', desc: 'Light, airy · Fresh alphonso mango', price: 160, veg: true, tag: 'Seasonal' },
    { dish: 'Gulab Jamun', desc: 'Soft, soaked in syrup · 4 pcs', price: 120, veg: true, tag: '' },
    { dish: 'Tiramisu', desc: 'Classic Italian · Ladyfingers · Mascarpone', price: 240, veg: true, tag: '' },
  ],
  'beverages': [
    { dish: 'Masala Chai', desc: 'Strong, spiced · Classic Indian blend', price: 40, veg: true, tag: 'Bestseller' },
    { dish: 'Samosa Combo', desc: '2 samosas + masala chai', price: 80, veg: true, tag: 'Popular' },
    { dish: 'Cold Brew Coffee', desc: '24hr brewed · Smooth & strong', price: 160, veg: true, tag: '' },
    { dish: 'Fresh Lime Soda', desc: 'Refreshing · Sweet or salted', price: 80, veg: true, tag: '' },
    { dish: 'Veg Sandwich', desc: 'Toasted · Fresh veggies · Green chutney', price: 90, veg: true, tag: '' },
    { dish: 'Mango Lassi', desc: 'Thick, sweet · Alphonso mangoes', price: 110, veg: true, tag: '' },
  ],
  'continental': [
    { dish: 'Grilled Chicken Salad', desc: 'Fresh greens · Cherry tomatoes · Vinaigrette', price: 380, veg: false, tag: 'Healthy Pick' },
    { dish: 'Mushroom Risotto', desc: 'Creamy arborio rice · Truffle oil', price: 450, veg: true, tag: 'Chef Special' },
    { dish: 'Bruschetta Platter', desc: 'Toasted bread · 3 varieties', price: 280, veg: true, tag: '' },
    { dish: 'Grilled Sea Bass', desc: 'Lemon butter · Seasonal greens', price: 680, veg: false, tag: '' },
    { dish: 'Chicken Quesadilla', desc: 'Grilled tortilla · Cheese · Jalapeño', price: 340, veg: false, tag: 'Popular' },
    { dish: 'Vegan Buddha Bowl', desc: 'Quinoa · Roasted veggies · Tahini', price: 360, veg: true, tag: 'Healthy' },
  ],
  'default': [
    { dish: 'House Special Thali', desc: "Chef's selection · Complete meal", price: 220, veg: true, tag: 'Popular' },
    { dish: 'Chicken Curry', desc: 'Rich gravy · Best with rice or naan', price: 280, veg: false, tag: 'Bestseller' },
    { dish: 'Paneer Masala', desc: 'Cottage cheese · Spiced gravy', price: 240, veg: true, tag: '' },
    { dish: 'Steamed Rice', desc: 'Long grain basmati', price: 80, veg: true, tag: '' },
    { dish: 'Mixed Veg Sabzi', desc: 'Seasonal vegetables · Home-style', price: 180, veg: true, tag: '' },
    { dish: 'Sweet Lassi', desc: 'Chilled yoghurt drink', price: 90, veg: true, tag: '' },
  ],
}

const DISH_EMOJIS: Record<string, string[]> = {
  'north-indian': ['🍛', '🫙', '🍢', '🫓', '🍖', '🥗'],
  'south-indian': ['🥞', '🍚', '🫔', '🧆', '☕', '🍛'],
  'biryani': ['🍚', '🌿', '🍖', '🥚', '🫕', '🥛'],
  'chinese': ['🍗', '🍳', '🍜', '🧆', '🥟', '🍵'],
  'pizza': ['🍕', '🍗', '🫓', '🧀', '🍝', '🌶️'],
  'burgers': ['🍔', '🍗', '🥗', '🍟', '🥤', '🧀'],
  'desserts': ['🧇', '🎂', '🍨', '🥭', '🍮', '🍰'],
  'beverages': ['🍵', '🥪', '☕', '🍋', '🥪', '🥭'],
  'continental': ['🥗', '🍚', '🥖', '🐟', '🌮', '🥣'],
  'default': ['🍽️', '🍗', '🧀', '🍚', '🥬', '🥛'],
}

const FOOD_EMOJI: Record<string, string> = {
  'north-indian': '🍛', 'south-indian': '🥘', 'biryani': '🍚', 'chinese': '🥡',
  'pizza': '🍕', 'burgers': '🍔', 'desserts': '🍰', 'beverages': '☕',
  'continental': '🥗', 'default': '🍽️',
}

const GRAD_BY_KEY: Record<string, [string, string]> = {
  'north-indian': ['#f06d1e', '#e83e3e'], 'south-indian': ['#16a34a', '#0d9488'],
  'biryani': ['#b45309', '#d97706'], 'chinese': ['#dc2626', '#9f1239'],
  'pizza': ['#ea580c', '#eab308'], 'burgers': ['#92400e', '#d97706'],
  'desserts': ['#9333ea', '#ec4899'], 'beverages': ['#0f766e', '#065f46'],
  'continental': ['#1d4ed8', '#7c3aed'], 'default': ['#374151', '#1f2937'],
}

function getMenuKey(cuisines: string[]): string {
  const s = cuisines.join(' ').toLowerCase()
  if (s.includes('north indian') || s.includes('punjabi') || s.includes('mughlai')) return 'north-indian'
  if (s.includes('south indian') || s.includes('udupi') || s.includes('dosa')) return 'south-indian'
  if (s.includes('biryani') || s.includes('andhra')) return 'biryani'
  if (s.includes('chinese') || s.includes('asian') || s.includes('thai')) return 'chinese'
  if (s.includes('pizza') || s.includes('italian') || s.includes('pasta')) return 'pizza'
  if (s.includes('burger') || s.includes('fast food') || s.includes('american')) return 'burgers'
  if (s.includes('dessert') || s.includes('cake') || s.includes('ice cream')) return 'desserts'
  if (s.includes('beverages') || s.includes('chai') || s.includes('coffee')) return 'beverages'
  if (s.includes('continental') || s.includes('mediterranean') || s.includes('healthy')) return 'continental'
  return 'default'
}

// ─── Public types ─────────────────────────────────────────────────────────────

export interface RestaurantInfo {
  name: string
  area: string
  cuisines: string[]
  rating: number
  delivery_min: number
  price_for_two?: number
}

interface Props {
  restaurant: RestaurantInfo
  onBack: () => void
  onGoToCart: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RestaurantPage({ restaurant, onBack, onGoToCart }: Props) {
  const { add, updateQty, items, totalItems, totalPrice, restaurantName } = useCart()
  const [vegOnly, setVegOnly] = useState(false)
  const [toast, setToast] = useState<{ dish: string; visible: boolean }>({ dish: '', visible: false })

  const menuKey = getMenuKey(restaurant.cuisines)
  const menu = MENUS[menuKey] ?? MENUS['default']
  const visibleMenu = vegOnly ? menu.filter(i => i.veg) : menu
  const headerEmoji = FOOD_EMOJI[menuKey] ?? '🍽️'
  const dishEmojiList = DISH_EMOJIS[menuKey] ?? DISH_EMOJIS['default']
  const [gradA, gradB] = GRAD_BY_KEY[menuKey] ?? ['#374151', '#1f2937']

  const cartBelongsHere = restaurantName === restaurant.name || items.length === 0

  function itemId(dish: string) {
    return `${dish}||${restaurant.name}`
  }
  function itemQty(dish: string) {
    return items.find(i => i.id === itemId(dish))?.qty ?? 0
  }

  function handleAdd(item: MenuItem) {
    add({ dish: item.dish, restaurant: restaurant.name, price: item.price, veg: item.veg, emoji: item.veg ? '🟢' : '🔴' })
    setToast({ dish: item.dish, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col"
      style={{ minHeight: '100dvh', background: '#fff' }}
    >
      {/* Sub-header */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ padding: '13px 15px', borderBottom: '1px solid #ebebeb' }}>
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, border: '1.5px solid #e0e0e0', borderRadius: 7 }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3d4152" strokeWidth="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }} className="truncate">{restaurant.name}</p>
          <p style={{ fontSize: 11, color: '#93959f', marginTop: 1 }}>{restaurant.area}</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', paddingBottom: totalItems > 0 ? 80 : 20 }}>

        {/* Banner */}
        <div
          className="flex items-center justify-center relative flex-shrink-0"
          style={{ height: 136, background: `linear-gradient(135deg, ${gradA}, ${gradB})` }}
        >
          <span style={{ fontSize: 72, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }}>{headerEmoji}</span>
          <div
            className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full"
            style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)' }}
          >
            <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>★ {restaurant.rating.toFixed(1)}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>· {restaurant.delivery_min} min</span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '12px 15px', borderBottom: '1px solid #ebebeb' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#3d4152' }}>{restaurant.name}</p>
          <div className="flex items-center flex-wrap" style={{ gap: 10, marginTop: 6 }}>
            <span style={{ fontSize: 10.5, color: '#686b78' }}>★ {restaurant.rating.toFixed(1)} (200+ ratings)</span>
            <span style={{ fontSize: 10.5, color: '#686b78' }}>· {restaurant.delivery_min}–{restaurant.delivery_min + 5} min</span>
            {restaurant.price_for_two && (
              <span style={{ fontSize: 10.5, color: '#686b78' }}>· ₹{restaurant.price_for_two} for two</span>
            )}
          </div>
          <div className="inline-block mt-2" style={{ padding: '2px 8px', background: '#f4f4f4', borderRadius: 10, fontSize: 10, fontWeight: 600, color: '#686b78' }}>
            {restaurant.cuisines.join(' · ')}
          </div>
        </div>

        {/* Pure Veg toggle */}
        <div className="flex items-center gap-2" style={{ padding: '8px 15px', borderBottom: '1px solid #ebebeb' }}>
          <button
            onClick={() => setVegOnly(v => !v)}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{ border: `1.5px solid ${vegOnly ? '#2e7d32' : '#bdbdbd'}`, fontSize: 10, fontWeight: 700, color: vegOnly ? '#2e7d32' : '#686b78' }}
          >
            <div className="relative rounded-full" style={{ width: 26, height: 13, background: vegOnly ? '#2e7d32' : '#bdbdbd' }}>
              <div
                className="absolute top-0.5 rounded-full bg-white"
                style={{ width: 9, height: 9, left: vegOnly ? 'calc(100% - 11px)' : 2, transition: 'left 0.15s' }}
              />
            </div>
            Pure Veg
          </button>
        </div>

        {/* Section label */}
        <div style={{ padding: '11px 15px 7px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93959f' }}>
          Popular Dishes
        </div>

        {/* Menu rows */}
        {visibleMenu.map((item, i) => {
          const qty = itemQty(item.dish)
          const dEmoji = dishEmojiList[i] ?? (item.veg ? '🥗' : '🍽️')
          return (
            <motion.div
              key={item.dish}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3"
              style={{ padding: '11px 15px', borderBottom: '1px solid #ebebeb' }}
            >
              <div
                className="flex-shrink-0 rounded-[9px] flex items-center justify-center"
                style={{ width: 62, height: 62, background: '#f4f4f4', fontSize: 30 }}
              >
                {dEmoji}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="rounded-full flex-shrink-0" style={{ width: 8, height: 8, background: item.veg ? '#2e7d32' : '#c62828' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#3d4152' }}>{item.dish}</span>
                  {item.tag ? (
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#686b78', background: '#f0f0f0', padding: '1px 6px', borderRadius: 8 }}>
                      {item.tag}
                    </span>
                  ) : null}
                </div>
                <p style={{ fontSize: 10.5, color: '#93959f', marginTop: 2, lineHeight: 1.4 }}>{item.desc}</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: '#3d4152', marginTop: 5 }}>₹{item.price}</p>
              </div>

              {/* Qty stepper */}
              <div className="flex-shrink-0">
                {qty === 0 ? (
                  <button
                    onClick={() => handleAdd(item)}
                    className="flex items-center justify-center"
                    style={{ width: 30, height: 30, border: '1.5px solid #bdbdbd', borderRadius: 7, fontSize: 20, color: '#FC8019', fontWeight: 700 }}
                  >
                    +
                  </button>
                ) : (
                  <div className="flex items-center rounded-[7px] overflow-hidden" style={{ border: '1.5px solid #FC8019', height: 30 }}>
                    <button
                      onClick={() => updateQty(itemId(item.dish), -1)}
                      className="flex items-center justify-center"
                      style={{ width: 28, fontSize: 18, color: '#FC8019', fontWeight: 700 }}
                    >
                      −
                    </button>
                    <span style={{ width: 24, textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#3d4152' }}>
                      {qty}
                    </span>
                    <button
                      onClick={() => handleAdd(item)}
                      className="flex items-center justify-center"
                      style={{ width: 28, fontSize: 18, background: '#FC8019', color: '#fff', fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}

        <div style={{ height: 24 }} />
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {totalItems > 0 && cartBelongsHere && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            className="fixed bottom-0 left-0 right-0"
            style={{ padding: '10px 15px', background: '#fff', borderTop: '1px solid #e0e0e0', zIndex: 60 }}
          >
            <button
              onClick={onGoToCart}
              className="w-full flex items-center justify-between rounded-[12px] px-4 py-3"
              style={{ background: '#FC8019' }}
            >
              <div
                className="flex items-center justify-center rounded-[6px]"
                style={{ width: 24, height: 24, background: 'rgba(255,255,255,0.25)', fontSize: 12, fontWeight: 700, color: '#fff' }}
              >
                {totalItems}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>View Cart</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>₹{totalPrice}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Added-to-cart toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 22 }}
            className="fixed left-3 right-3 flex items-center justify-between rounded-[12px] px-4 py-3"
            style={{ bottom: totalItems > 0 ? 76 : 16, background: '#3d4152', zIndex: 70, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 13, color: '#3d9b6e' }}>✓</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{toast.dish} added</span>
            </div>
            <button onClick={onGoToCart} style={{ fontSize: 11, fontWeight: 700, color: '#FC8019' }}>
              View Cart →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
