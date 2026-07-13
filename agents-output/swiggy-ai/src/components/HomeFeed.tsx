'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FoodCategoryRow from './FoodCategoryRow'
import PromoBanner from './PromoBanner'
import MoreOnSwiggy from './MoreOnSwiggy'
import TrendingNearYou from './TrendingNearYou'
import FoodImg from './FoodImg'
import { assignVenuePhotos } from '@/lib/foodPhotos'
import { getRestaurantVisual } from './CategoryPage'
import { StarOnPhoto, EtaOnPhoto, MIN_UPFRONT_RATING } from './CardBadges'
import { useDragScroll } from '@/hooks/useDragScroll'
import { useCart } from '@/contexts/CartContext'
import type { HomepageJSON, UserProfile, MoodType, HomepageItem } from '@/types'
import type { RestaurantInfo } from './RestaurantPage'

// ─── Helpers ────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: 8, background: '#f4f4f4', borderTop: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0' }} />
}

function StarBadge({ rating }: { rating?: number }) {
  if (!rating) return null
  return (
    <span
      className="flex items-center"
      style={{ background: '#3d9b6e', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4, gap: 2 }}
    >
      ★ {rating.toFixed(1)}
    </span>
  )
}

function atLeastThree<T>(arr: T[]): T[] {
  if (arr.length === 0) return arr
  const out = [...arr]
  while (out.length < 3) out.push(...arr.slice(0, 3 - out.length))
  return out
}

// ── Item selection (feedback round 2) ─────────────────────────────────────────
// Rules: a restaurant row never repeats a restaurant; dish rows never repeat a
// dish; and no restaurant appears in both the hero and Top Rated at once.

function dedupeBy<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>()
  return arr.filter(t => {
    const k = key(t).toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

// Upfront quality gate: discovery cards only carry ratings ≥ 4.0. Lower-rated
// dishes still exist INSIDE a restaurant's own menu page — just never upfront.
function goodOnly(items: HomepageItem[]): HomepageItem[] {
  return items.filter(i => (i.rating ?? MIN_UPFRONT_RATING) >= MIN_UPFRONT_RATING)
}

// 2A hero: dishes at the favourite restaurant only — never padded with other
// restaurants' dishes (the AI is asked for 8; a short row beats a wrong row).
function heroDishes(homepage: HomepageJSON): HomepageItem[] {
  return goodOnly(dedupeBy(homepage.hero.items ?? [], i => i.name)).slice(0, 8)
}

// 2B hero: RESTAURANTS. One card per restaurant, padded from the page's other
// sections when the AI returned fewer than 8 — always deduped by restaurant.
function heroRestaurants(homepage: HomepageJSON): HomepageItem[] {
  const pools = [
    homepage.hero.items,
    homepage.discovery.items,
    homepage.slot_top_rated.items,
    homepage.mood_banner.items,
  ].flatMap(p => p ?? [])
  return goodOnly(dedupeBy(pools, i => i.restaurant)).slice(0, 8)
}

// Top Rated: 8 restaurants that do NOT already appear in the hero.
function topRatedItems(homepage: HomepageJSON, excludeRestaurants: Set<string>): HomepageItem[] {
  const pools = [
    homepage.slot_top_rated.items,
    homepage.discovery.items,
    homepage.mood_banner.items,
    homepage.hero.items,
  ].flatMap(p => p ?? [])
  const unique = goodOnly(dedupeBy(pools, i => i.restaurant))
  const excluded = new Set([...excludeRestaurants].map(r => r.toLowerCase()))
  const fresh = unique.filter(i => !excluded.has(i.restaurant.toLowerCase()))
  // Prefer non-repeating; relax only if there genuinely isn't enough data
  return (fresh.length >= 4 ? fresh : unique).slice(0, 8)
}

// What's on your mind: 8 categories with enforced variety — never one cuisine
// dominating (e.g. a dessert-lover still sees 8 different worlds to explore).
const MIND_BUCKETS: string[][] = [
  ['dessert', 'cake', 'ice cream', 'sweet', 'pastry', 'kulfi', 'falooda'],
  ['pizza', 'italian', 'pasta'],
  ['biryani', 'hyderabadi'],
  ['chinese', 'noodle', 'momos', 'manchurian'],
  ['south indian', 'dosa', 'idli', 'vada'],
  ['north indian', 'punjabi', 'thali', 'paratha'],
  ['burger', 'fast food', 'fries', 'sandwich', 'rolls', 'wrap'],
  ['chai', 'coffee', 'beverage', 'juice', 'shake', 'tea'],
]
const MIND_DEFAULTS = ['Biryani', 'Pizza', 'South Indian', 'Chinese', 'Burgers', 'Rolls', 'North Indian', 'Desserts']

function diverseMind(aiCategories: string[]): string[] {
  const bucketOf = (c: string) => MIND_BUCKETS.findIndex(b => b.some(k => c.toLowerCase().includes(k)))
  const bucketCount = new Map<number, number>()
  const out: string[] = []
  for (const c of dedupeBy([...(aiCategories ?? []), ...MIND_DEFAULTS], x => x)) {
    const b = bucketOf(c)
    const n = bucketCount.get(b) ?? 0
    if (b !== -1 && n >= 2) continue // max 2 per cuisine bucket
    bucketCount.set(b, n + 1)
    out.push(c)
    if (out.length === 8) break
  }
  return out
}

// Section header with a consistent "View all →" at top-right (feedback #1)
function SectionHead({ title, eyebrow, onViewAll, pad = '14px 15px 8px' }: {
  title: React.ReactNode; eyebrow?: string; onViewAll?: () => void; pad?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: pad, gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <p style={{ fontSize: 9.5, fontWeight: 700, color: '#FC8019', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>{eyebrow}</p>}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>{title}</h2>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="active:opacity-70 flex-shrink-0"
          style={{ fontSize: 11, fontWeight: 700, color: '#FC8019', whiteSpace: 'nowrap', paddingBottom: 1 }}
        >View all →</button>
      )}
    </div>
  )
}

function toRestaurantInfo(item: HomepageItem, profile: UserProfile): RestaurantInfo {
  return {
    name: item.restaurant,
    area: profile.area ?? '',
    cuisines: profile.top_cuisines?.slice(0, 2) ?? [],
    rating: item.rating ?? 4.2,
    delivery_min: item.delivery_min ?? 30,
  }
}

// ─── Glassmorphism hero wrapper ───────────────────────────────────────────────

function GlassHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden bg-white" style={{ paddingBottom: 14 }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(252,128,25,0.07) 0%, rgba(255,210,100,0.1) 55%, rgba(252,128,25,0.05) 100%)' }}
      />
      <motion.div
        animate={{ x: [0, 14, -6, 0], y: [0, -12, 6, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute pointer-events-none rounded-full"
        style={{ width: 130, height: 130, top: -40, right: -28, background: 'rgba(252,128,25,0.13)', filter: 'blur(22px)' }}
      />
      <motion.div
        animate={{ x: [0, -10, 7, 0], y: [0, 10, -8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
        className="absolute pointer-events-none rounded-full"
        style={{ width: 88, height: 88, bottom: 20, left: -20, background: 'rgba(255,180,50,0.16)', filter: 'blur(18px)' }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ─── Home-page toast ──────────────────────────────────────────────────────────

function HomeToast({ dish, restaurant, onViewCart }: { dish: string; restaurant: string; onViewCart?: () => void }) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      transition={{ type: 'spring', damping: 22 }}
      className="fixed left-3 right-3 flex items-center justify-between rounded-[12px] px-4 py-3"
      style={{ bottom: 72, background: '#3d4152', zIndex: 80, boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span style={{ fontSize: 13, color: '#3d9b6e' }}>✓</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }} className="truncate">
          {dish} · {restaurant}
        </span>
      </div>
      <button onClick={onViewCart} style={{ fontSize: 11, fontWeight: 700, color: '#FC8019', flexShrink: 0, marginLeft: 8 }}>
        View Cart →
      </button>
    </motion.div>
  )
}

// ─── Spring Add Button ───────────────────────────────────────────────────────

function SpringAddButton({ onAdd, size = 26, fontSize = 18, bottom = 5, right = 5 }: {
  onAdd: () => void
  size?: number
  fontSize?: number
  bottom?: number
  right?: number
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    onAdd()
    const btn = btnRef.current
    const ring = ringRef.current
    if (btn) { btn.classList.remove('cart-spring'); void btn.offsetWidth; btn.classList.add('cart-spring') }
    if (ring) { ring.classList.remove('cart-ring');  void ring.offsetWidth;  ring.classList.add('cart-ring') }
  }

  return (
    <div style={{ position: 'absolute', bottom, right, width: size, height: size, zIndex: 10 }}>
      <button
        ref={btnRef}
        onClick={handleClick}
        style={{
          width: '100%', height: '100%',
          background: '#FC8019', border: 'none', borderRadius: '50%',
          color: '#fff', fontSize, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 6px rgba(252,128,25,0.4)',
          lineHeight: 1, transformOrigin: 'center',
        }}
        aria-label="Add to cart"
      >+</button>
      <span ref={ringRef} style={{ position: 'absolute', inset: -3, borderRadius: '50%', pointerEvents: 'none' }} />
    </div>
  )
}

// ─── 2A Loyalist Hero ────────────────────────────────────────────────────────

function LoyalistHero({ items, homepage, profile, onRestaurantSelect, onAdd }: {
  items: HomepageItem[]; homepage: HomepageJSON; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
}) {
  const restName = profile.favourite_restaurant || homepage.hero.title || 'your go-to spot'
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <GlassHero>
      <div style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(252,128,25,0.1)' }}>
        <SectionHead
          eyebrow="Your usual"
          title={`Order more from ${restName}`}
          onViewAll={() => items[0] && onRestaurantSelect?.(toRestaurantInfo(items[0], profile))}
          pad="14px 15px 10px"
        />
      </div>

      <div className="row-fade-wrap">
        <div className="flex overflow-x-auto" {...drag} style={{ gap: 10, padding: '12px 15px 6px', scrollbarWidth: 'none', ...drag.style }}>
          {items.map((item, i) => {
            const vis = getRestaurantVisual(item.restaurant, i)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform"
                style={{ width: 94 }}
                onClick={() => onRestaurantSelect?.(toRestaurantInfo(item, profile))}
              >
                <div className="relative rounded-[12px] overflow-hidden" style={{ width: 94, height: 94 }}>
                  <FoodImg name={item.name} extra={item.restaurant} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
                  <StarOnPhoto rating={item.rating} />
                  <EtaOnPhoto min={item.delivery_min} />
                  <SpringAddButton onAdd={() => onAdd?.(item)} size={26} fontSize={18} bottom={5} right={5} />
                </div>
                <p className="mt-1.5 leading-tight" style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                {item.price && <p style={{ fontSize: 11, fontWeight: 700, color: '#FC8019', marginTop: 1 }}>₹{item.price}</p>}
              </motion.div>
            )
          })}
        </div>
      </div>
    </GlassHero>
  )
}

// ─── 2B Explorer Hero ────────────────────────────────────────────────────────

function ExplorerHero({ items, profile, onRestaurantSelect, onAdd, onViewAllList }: {
  items: HomepageItem[]; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
  onViewAllList?: (title: string, list: RestaurantInfo[]) => void
}) {
  const drag = useDragScroll<HTMLDivElement>()
  const venuePhotos = assignVenuePhotos(items.map(i => i.restaurant))

  return (
    <GlassHero>
      <div style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(252,128,25,0.1)' }}>
        <SectionHead
          title="Places you'll actually love"
          onViewAll={() => onViewAllList?.("Places you'll love", items.map(i => toRestaurantInfo(i, profile)))}
          pad="14px 15px 10px"
        />
      </div>

      <div className="row-fade-wrap">
        <div className="flex overflow-x-auto" {...drag} style={{ gap: 10, padding: '12px 15px 6px', scrollbarWidth: 'none', ...drag.style }}>
          {items.map((item, i) => {
            const vis = getRestaurantVisual(item.restaurant, i)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.06, 0.36) }}
                className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform rounded-[12px] overflow-hidden"
                style={{ width: 128, border: '1px solid #e0e0e0', background: 'rgba(255,255,255,0.88)' }}
                onClick={() => onRestaurantSelect?.(toRestaurantInfo(item, profile))}
              >
                <div className="relative" style={{ height: 88 }}>
                  {/* Restaurant card → venue photo, unique within this row.
                      No + button: a restaurant can't be added to the cart. */}
                  <FoodImg name={item.restaurant} kind="venue" src={venuePhotos[item.restaurant]} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
                  <StarOnPhoto rating={item.rating} />
                  <EtaOnPhoto min={item.delivery_min} />
                </div>
                <div style={{ padding: '8px 8px 9px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.restaurant}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </GlassHero>
  )
}

// ─── 2C Variety Hero ─────────────────────────────────────────────────────────

type MealPart = 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'late_night'

function getMealSlot(hour: number): { part: MealPart; label: string; title: string; categories: string[] } {
  if (hour >= 6 && hour < 11)  return { part: 'breakfast',  label: '🌅 Breakfast time', title: 'Start your morning right',      categories: ['Idli', 'Dosa', 'Paratha', 'Breakfast', 'Chai & Snacks', 'Bakery', 'Poha', 'Sandwich'] }
  if (hour >= 11 && hour < 15) return { part: 'lunch',      label: '☀️ Lunchtime',       title: 'What are you having for lunch?', categories: ['Biryani', 'Thali', 'South Indian', 'North Indian', 'Chinese', 'Rolls', 'Pizza', 'Burgers'] }
  if (hour >= 15 && hour < 19) return { part: 'snacks',     label: '🍵 Snack time',       title: 'The 4 PM craving is real',       categories: ['Chai & Snacks', 'Samosa', 'Pakoda', 'Momos', 'Noodles', 'Burgers', 'Sandwich', 'Rolls'] }
  if (hour >= 19 && hour < 23) return { part: 'dinner',     label: '🌙 Dinner time',       title: "What's for dinner tonight?",     categories: ['Biryani', 'Pizza', 'North Indian', 'Chinese', 'Mughlai', 'Kebabs', 'Thali', 'Rolls'] }
  return                               { part: 'late_night', label: '🌙 Late night',        title: 'Midnight hunger sorted',         categories: ['Pizza', 'Burgers', 'Fast Food', 'Noodles', 'Rolls', 'Snacks', 'Momos', 'Ice Cream'] }
}

// Full craving list per slot — powers the 2C hero's "View all" page (~20 items)
export const SLOT_ALL: Record<MealPart, string[]> = {
  breakfast:  ['Idli', 'Dosa', 'Vada', 'Upma', 'Poha', 'Paratha', 'Uttapam', 'Omelette', 'Pancakes', 'Waffles', 'Sandwich', 'Croissant', 'Bakery', 'Filter Coffee', 'Chai', 'Juice', 'Smoothie', 'Fruit Bowl', 'Thepla', 'Puri Bhaji'],
  lunch:      ['Biryani', 'Thali', 'North Indian', 'South Indian', 'Chinese', 'Rolls', 'Pizza', 'Burgers', 'Dal Makhani', 'Paneer', 'Fried Rice', 'Noodles', 'Kebabs', 'Fish Curry', 'Salad', 'Sandwich', 'Pasta', 'Paratha', 'Curd Rice', 'Juice'],
  snacks:     ['Chai', 'Samosa', 'Pakoda', 'Momos', 'Chaat', 'Vada Pav', 'Sandwich', 'Fries', 'Burgers', 'Rolls', 'Maggi', 'Noodles', 'Waffles', 'Cake', 'Coffee', 'Milkshake', 'Ice Cream', 'Pav Bhaji', 'Kebabs', 'Pizza'],
  dinner:     ['Biryani', 'Pizza', 'North Indian', 'Chinese', 'Mughlai', 'Kebabs', 'Thali', 'Rolls', 'Paneer', 'Dal Makhani', 'Butter Chicken', 'Noodles', 'Fried Rice', 'Pasta', 'Burgers', 'Momos', 'Fish Curry', 'Salad', 'Desserts', 'Ice Cream'],
  late_night: ['Pizza', 'Burgers', 'Momos', 'Noodles', 'Fried Rice', 'Rolls', 'Maggi', 'Fries', 'Sandwich', 'Pasta', 'Fried Chicken', 'Biryani', 'Kebabs', 'Ice Cream', 'Milkshake', 'Brownie', 'Desserts', 'Waffles', 'Chai', 'Coffee'],
}

const MEAL_EMOJI: Record<string, string> = {
  'Biryani': '🍛', 'Idli': '🍙', 'Dosa': '🥞', 'Paratha': '🥙', 'Breakfast': '🍳',
  'Chai & Snacks': '☕', 'Bakery': '🥐', 'Thali': '🍱', 'South Indian': '🥘', 'North Indian': '🫓',
  'Chinese': '🥡', 'Rolls': '🌯', 'Samosa': '🥟', 'Pakoda': '🫓', 'Momos': '🥟',
  'Noodles': '🍜', 'Burgers': '🍔', 'Pizza': '🍕', 'Mughlai': '🍖', 'Kebabs': '🍢',
  'Fast Food': '🍟', 'Snacks': '🍟', 'Poha': '🍚', 'Sandwich': '🥪', 'Ice Cream': '🍦',
}

const MEAL_GRADS: Record<string, { a: string; b: string }> = {
  'Biryani':       { a: '#6a5028', b: '#8a6838' },
  'Idli':          { a: '#384868', b: '#4a5e7a' },
  'Dosa':          { a: '#5a4820', b: '#7a6030' },
  'Paratha':       { a: '#6a3a20', b: '#8a5030' },
  'Breakfast':     { a: '#7a6a40', b: '#8a7848' },
  'Chai & Snacks': { a: '#5a3818', b: '#7a5028' },
  'Bakery':        { a: '#7a6a40', b: '#8a7848' },
  'Thali':         { a: '#2a5038', b: '#3a5a40' },
  'South Indian':  { a: '#6a3a20', b: '#8a5830' },
  'North Indian':  { a: '#683838', b: '#7a4848' },
  'Chinese':       { a: '#683838', b: '#7a4040' },
  'Rolls':         { a: '#384868', b: '#3a5078' },
  'Samosa':        { a: '#6a5028', b: '#8a6838' },
  'Pakoda':        { a: '#5a4820', b: '#7a5828' },
  'Momos':         { a: '#3a4068', b: '#484878' },
  'Noodles':       { a: '#683838', b: '#7a4848' },
  'Burgers':       { a: '#6a3a20', b: '#8a5030' },
  'Pizza':         { a: '#683838', b: '#7a4040' },
  'Mughlai':       { a: '#6a5028', b: '#7a5830' },
  'Kebabs':        { a: '#683838', b: '#7a4848' },
  'Fast Food':     { a: '#6a3a20', b: '#8a5030' },
  'Snacks':        { a: '#5a4820', b: '#7a6030' },
  'Poha':          { a: '#6a5028', b: '#8a6838' },
  'Sandwich':      { a: '#3a5068', b: '#385870' },
  'Ice Cream':     { a: '#4a4a78', b: '#584878' },
}

function VarietyHero({ profile: _profile, onCategorySelect, onSlotViewAll }: {
  profile: UserProfile
  onCategorySelect?: (category: string) => void
  onSlotViewAll?: (title: string, categories: string[]) => void
}) {
  const hour = new Date().getHours()
  const slot = getMealSlot(hour)
  const categories = slot.categories.slice(0, 8)
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <GlassHero>
      <div style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(252,128,25,0.1)' }}>
        <div style={{ padding: '14px 15px 0' }}>
          <div className="inline-flex items-center" style={{ background: 'rgba(244,244,244,0.9)', border: '1px solid #e0e0e0', borderRadius: 20, padding: '3px 10px' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#686b78' }}>{slot.label}</span>
          </div>
        </div>
        <SectionHead title={slot.title} onViewAll={() => onSlotViewAll?.(slot.title, SLOT_ALL[slot.part])} pad="6px 15px 10px" />
      </div>

      <div className="row-fade-wrap">
        <div className="flex overflow-x-auto" {...drag} style={{ gap: 10, padding: '12px 15px 6px', scrollbarWidth: 'none', ...drag.style }}>
          {categories.map((cat, i) => (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}
              className="flex-shrink-0 cursor-pointer flex flex-col items-center"
              style={{ width: 94 }}
              onClick={() => onCategorySelect?.(cat)}
            >
              <div className="relative rounded-[12px] overflow-hidden" style={{ width: 94, height: 94 }}>
                {/* No + icon: a category isn't a cart item, and no ETA badge either —
                    Pizza comes from many places, so one number would be a lie. */}
                <FoodImg
                  name={cat}
                  emoji={MEAL_EMOJI[cat] ?? '🍽️'}
                  gradA={MEAL_GRADS[cat]?.a ?? '#4a5060'}
                  gradB={MEAL_GRADS[cat]?.b ?? '#585e68'}
                />
              </div>
              <p className="mt-1.5 text-center leading-tight" style={{ fontSize: 11, fontWeight: 700, color: '#3d4152' }}>{cat}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassHero>
  )
}

// ─── Top Rated Near You — with cuisine images ─────────────────────────────────

function TopRatedSection({ items: rawItems, excludeRestaurants, profile, onRestaurantSelect, onAdd, onViewAllList }: {
  items: HomepageItem[]; excludeRestaurants: Set<string>; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
  onViewAllList?: (title: string, list: RestaurantInfo[]) => void
}) {
  // The AI page may not contain 8 unique non-hero restaurants — top up from the
  // real DB (highest-rated in the user's city) so the row always scrolls to 8.
  const [dbExtra, setDbExtra] = useState<HomepageItem[]>([])
  useEffect(() => {
    if (rawItems.length >= 8 || !profile.city) return
    const taken = new Set([
      ...rawItems.map(i => i.restaurant.toLowerCase()),
      ...[...excludeRestaurants].map(r => r.toLowerCase()),
    ])
    fetch(`/api/toprated?city=${encodeURIComponent(profile.city)}`)
      .then(r => r.json())
      .then(d => {
        const fill: HomepageItem[] = (d.restaurants ?? [])
          .filter((r: { name: string; avg_rating: number }) => !taken.has(r.name.toLowerCase()) && r.avg_rating >= MIN_UPFRONT_RATING)
          .slice(0, 8 - rawItems.length)
          .map((r: { name: string; avg_rating: number; delivery_time_min: number }) => ({
            name: r.name, restaurant: r.name, reason: '',
            veg: true, rating: r.avg_rating, delivery_min: r.delivery_time_min,
          }))
        setDbExtra(fill)
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawItems.length, profile.city])

  const items = atLeastThree(dedupeBy([...rawItems, ...dbExtra], i => i.restaurant).slice(0, 8))
  const drag = useDragScroll<HTMLDivElement>()
  const venuePhotos = assignVenuePhotos(items.map(i => i.restaurant))

  return (
    <div className="bg-white" style={{ paddingBottom: 14 }}>
      <SectionHead
        title="Top Rated Near You"
        onViewAll={() => onViewAllList?.('Top rated near you', items.map(i => toRestaurantInfo(i, profile)))}
      />

      <div className="row-fade-wrap">
        <div className="flex overflow-x-auto" {...drag} style={{ gap: 10, padding: '0 15px 4px', scrollbarWidth: 'none', ...drag.style }}>
          {items.map((item: HomepageItem, i: number) => {
            const vis = getRestaurantVisual(item.restaurant, i)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.05, 0.3) }}
                className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform rounded-[12px] overflow-hidden"
                style={{ width: 118, border: '1px solid #e0e0e0' }}
                onClick={() => onRestaurantSelect?.(toRestaurantInfo(item, profile))}
              >
                <div className="relative" style={{ height: 84 }}>
                  {/* Restaurant card → venue photo, unique within this row.
                      No + button: a restaurant can't be added to the cart. */}
                  <FoodImg name={item.restaurant} kind="venue" src={venuePhotos[item.restaurant]} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
                  <StarOnPhoto rating={item.rating} />
                  <EtaOnPhoto min={item.delivery_min} />
                </div>
                <div style={{ padding: '8px 8px 9px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.restaurant}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Fun footer — real-time delivery scooter (feedback round 5) ──────────────
// Waits at the LEFT kerb facing right. After an order, it travels toward the
// house over the real 30-minute delivery window. At ETA it arrives, then resets
// to the left kerb until the next order.

const DELIVERY_MS = 30 * 60 * 1000

function FunFooter({ orderedAt }: { orderedAt: number | null }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20_000) // position creeps forward every 20s
    return () => clearInterval(id)
  }, [])

  const progress = orderedAt ? Math.min(1, (now - orderedAt) / DELIVERY_MS) : null
  const riding = progress !== null && progress < 1
  const leftPct = riding ? 4 + progress! * 80 : 4 // 4% → 84%, house sits past 84%
  const minsLeft = riding ? Math.max(1, Math.ceil((DELIVERY_MS - (now - orderedAt!)) / 60_000)) : 0

  return (
    <div style={{ padding: '14px 0 6px' }}>
      {/* the road */}
      <div style={{ position: 'relative', height: 64, margin: '0 14px' }}>
        {/* destination house */}
        <span style={{ position: 'absolute', right: 2, bottom: 6, fontSize: 24, lineHeight: 1 }}>🏠</span>
        {/* rider + scooter — always faces RIGHT; position = delivery progress */}
        <span
          className="scoot-idle"
          style={{
            position: 'absolute', bottom: 6, fontSize: 26, lineHeight: 1,
            left: `${leftPct}%`,
            transition: 'left 1.2s linear',
          }}
        >
          {riding
            ? <span className="exhaust" style={{ position: 'absolute', left: -14, bottom: 4, fontSize: 11, color: '#bdbdbd' }}>💨</span>
            : <span className="thought" style={{ position: 'absolute', left: 22, top: -18, fontSize: 12 }}>💭🍛</span>}
          <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>🛵</span>
        </span>
        {/* kerb / road line */}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, borderBottom: '2px dashed #e0e0e0' }} />
      </div>
      <p className="text-center" style={{ fontSize: 11.5, fontWeight: 600, color: '#93959f', padding: '8px 20px 6px' }}>
        {riding
          ? `Your order is on its way — arriving in ~${minsLeft} min 🛵💨`
          : 'Your delivery partner is ready. The craving is missing.'}
      </p>
    </div>
  )
}

// ─── HomeFeed ────────────────────────────────────────────────────────────────

interface Props {
  homepage: HomepageJSON
  profile: UserProfile
  detectedCity: string | null
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onCategorySelect?: (category: string) => void
  onViewAllList?: (title: string, list: RestaurantInfo[]) => void
  onBannerExplore?: (theme: string, context: string) => void
  onCartClick?: () => void
  onDishSelect?: (dish: string, cuisine: string, whyTrending: string, searchSignal: string, restaurants: import('@/types').TrendMatch[]) => void
  onSeeAllTrending?: (items: import('@/types').TrendMatch[]) => void
  onSlotViewAll?: (title: string, categories: string[]) => void
  orderedAt?: number | null
}

export default function HomeFeed({
  homepage, profile, detectedCity,
  onRestaurantSelect, onCategorySelect, onViewAllList, onBannerExplore, onCartClick, onDishSelect, onSeeAllTrending, onSlotViewAll,
  orderedAt = null,
}: Props) {
  const [, setSelectedMood] = useState<MoodType>(homepage.mood_banner.mood)
  const { add } = useCart()
  const [toast, setToast] = useState<{ dish: string; restaurant: string } | null>(null)

  function handleAdd(item: HomepageItem) {
    add({
      dish: item.name,
      restaurant: item.restaurant,
      price: item.price ?? 199,
      veg: item.veg ?? true,
      emoji: item.veg ? '🥗' : '🍽️',
    })
    setToast({ dish: item.name, restaurant: item.restaurant })
    setTimeout(() => setToast(null), 2500)
  }

  const is2A = profile.label === '2A_loyalist'
  const is2B = profile.label === '2B_restaurant_loyal_explorer'
  const is2C = profile.label === '2C_variety_seeker'

  // Trending always uses the profile city — this is the city that drives all recommendations,
  // so address bar, trending, and restaurant suggestions all stay consistent for the logged-in user.
  const trendingCity = profile.city ?? detectedCity
  const showTrending = (is2B || is2C) && !!trendingCity

  // Persona-correct item selection with cross-section dedupe (feedback round 2)
  const heroItems = is2B ? heroRestaurants(homepage) : heroDishes(homepage)
  const heroRestaurantSet = is2A
    ? new Set(profile.favourite_restaurant ? [profile.favourite_restaurant] : [])
    : is2B
      ? new Set(heroItems.map(i => i.restaurant))
      : new Set<string>()
  const ratedItems = topRatedItems(homepage, heroRestaurantSet)
  const mindCategories = diverseMind(homepage.whats_on_your_mind ?? [])

  const sharedProps = { onRestaurantSelect, onAdd: handleAdd, onViewAllList }

  const footer = <FunFooter orderedAt={orderedAt} />

  const trendingBlock = showTrending && (
    <>
      <TrendingNearYou city={trendingCity!} onDishSelect={onDishSelect} onSeeAll={onSeeAllTrending} />
      <Divider />
    </>
  )

  const categoryBlock = mindCategories.length > 0 && (
    <>
      <div style={{ background: '#fff' }}>
        <FoodCategoryRow
          categories={mindCategories}
          onCategorySelect={onCategorySelect}
        />
      </div>
      <Divider />
    </>
  )

  const bannerBlock = (
    <div style={{ background: '#fff' }}>
      <PromoBanner
        banner={homepage.mood_banner}
        onMoodSelect={setSelectedMood}
        onExplore={onBannerExplore}
      />
    </div>
  )

  // ── 2A Loyalist ──────────────────────────────────────────────────────────
  if (is2A) {
    return (
      <div style={{ background: '#f4f4f4', paddingBottom: 66 }}>
        <LoyalistHero items={heroItems} homepage={homepage} profile={profile} onRestaurantSelect={onRestaurantSelect} onAdd={handleAdd} />
        <Divider />
        {bannerBlock}
        <Divider />
        <TopRatedSection items={ratedItems} excludeRestaurants={heroRestaurantSet} profile={profile} {...sharedProps} />
        <Divider />
        {categoryBlock}
        <div style={{ background: '#fff' }}><MoreOnSwiggy /></div>
        {footer}
        <ToastLayer toast={toast} onViewCart={onCartClick} />
      </div>
    )
  }

  // ── 2B Explorer ──────────────────────────────────────────────────────────
  if (is2B) {
    return (
      <div style={{ background: '#f4f4f4', paddingBottom: 66 }}>
        <ExplorerHero items={heroItems} profile={profile} {...sharedProps} />
        <Divider />
        {trendingBlock}
        <TopRatedSection items={ratedItems} excludeRestaurants={heroRestaurantSet} profile={profile} {...sharedProps} />
        <Divider />
        {bannerBlock}
        <Divider />
        {categoryBlock}
        <div style={{ background: '#fff' }}><MoreOnSwiggy /></div>
        {footer}
        <ToastLayer toast={toast} onViewCart={onCartClick} />
      </div>
    )
  }

  // ── 2C Variety Seeker ────────────────────────────────────────────────────
  if (is2C) {
    return (
      <div style={{ background: '#f4f4f4', paddingBottom: 66 }}>
        <VarietyHero profile={profile} onCategorySelect={onCategorySelect} onSlotViewAll={onSlotViewAll} />
        <Divider />
        {trendingBlock}
        <TopRatedSection items={ratedItems} excludeRestaurants={heroRestaurantSet} profile={profile} {...sharedProps} />
        <Divider />
        {bannerBlock}
        <Divider />
        {categoryBlock}
        <div style={{ background: '#fff' }}><MoreOnSwiggy /></div>
        {footer}
        <ToastLayer toast={toast} onViewCart={onCartClick} />
      </div>
    )
  }

  return null
}

// ─── Toast layer ──────────────────────────────────────────────────────────────

function ToastLayer({ toast, onViewCart }: { toast: { dish: string; restaurant: string } | null; onViewCart?: () => void }) {
  return (
    <AnimatePresence>
      {toast && (
        <HomeToast
          key={toast.dish + toast.restaurant}
          dish={toast.dish}
          restaurant={toast.restaurant}
          onViewCart={onViewCart}
        />
      )}
    </AnimatePresence>
  )
}
