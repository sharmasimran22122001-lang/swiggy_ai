'use client'
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FoodCategoryRow from './FoodCategoryRow'
import PromoBanner from './PromoBanner'
import MoreOnSwiggy from './MoreOnSwiggy'
import TrendingNearYou from './TrendingNearYou'
import FoodImg from './FoodImg'
import { getRestaurantVisual } from './CategoryPage'
import { StarOnPhoto, EtaOnPhoto } from './CardBadges'
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

// Hero rows target 8 items so the scroll never dies halfway (feedback #1).
// The AI is asked for 8; older cached pages get padded from the other sections.
function eightHeroItems(homepage: HomepageJSON): HomepageItem[] {
  const seen = new Set<string>()
  const out: HomepageItem[] = []
  const pools = [
    homepage.hero.items,
    homepage.slot_top_rated.items,
    homepage.discovery.items,
    homepage.mood_banner.items,
  ]
  for (const pool of pools) {
    for (const item of pool ?? []) {
      const key = `${item.restaurant}|${item.name}`
      if (!seen.has(key)) {
        seen.add(key)
        out.push(item)
        if (out.length === 8) return out
      }
    }
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

function LoyalistHero({ homepage, profile, onRestaurantSelect, onAdd }: {
  homepage: HomepageJSON; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
}) {
  const items = atLeastThree(eightHeroItems(homepage))
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

function ExplorerHero({ homepage, profile, onRestaurantSelect, onAdd, onCategorySelect }: {
  homepage: HomepageJSON; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
  onCategorySelect?: (category: string) => void
}) {
  const items = atLeastThree(eightHeroItems(homepage))
  const topCuisines = profile.top_cuisines?.slice(0, 3) ?? []
  const drag = useDragScroll<HTMLDivElement>()

  function handleViewAll() {
    const cuisine = topCuisines[0]
    if (cuisine) onCategorySelect?.(cuisine)
    else if (items[0]) onRestaurantSelect?.(toRestaurantInfo(items[0], profile))
  }

  return (
    <GlassHero>
      <div style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', background: 'rgba(255,255,255,0.72)', borderBottom: '1px solid rgba(252,128,25,0.1)' }}>
        <SectionHead title="Places you'll actually love" onViewAll={handleViewAll} pad="14px 15px 8px" />
        {topCuisines.length > 0 && (
          <div className="flex items-center" style={{ gap: 6, flexWrap: 'wrap', padding: '0 15px 10px' }}>
            <span style={{ fontSize: 10, color: '#93959f', fontWeight: 600 }}>Matched to:</span>
            {topCuisines.map(c => (
              <span key={c} style={{ fontSize: 10, fontWeight: 700, color: '#3d4152', background: 'rgba(244,244,244,0.9)', border: '1px solid #e0e0e0', padding: '2px 8px', borderRadius: 20 }}>{c}</span>
            ))}
          </div>
        )}
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
                  <FoodImg name={item.restaurant} extra={item.name} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
                  <StarOnPhoto rating={item.rating} />
                  <EtaOnPhoto min={item.delivery_min} />
                  <SpringAddButton onAdd={() => onAdd?.(item)} size={26} fontSize={18} bottom={6} right={6} />
                </div>
                <div style={{ padding: '7px 8px 8px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.restaurant}</p>
                  <p style={{ fontSize: 10, color: '#686b78', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  {item.reason && <p style={{ fontSize: 9, fontWeight: 600, color: '#FC8019', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.reason}</p>}
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

function VarietyHero({ profile: _profile, onCategorySelect }: {
  profile: UserProfile
  onCategorySelect?: (category: string) => void
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
        <SectionHead title={slot.title} onViewAll={() => onCategorySelect?.(categories[0])} pad="6px 15px 10px" />
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
                <FoodImg
                  name={cat}
                  emoji={MEAL_EMOJI[cat] ?? '🍽️'}
                  gradA={MEAL_GRADS[cat]?.a ?? '#4a5060'}
                  gradB={MEAL_GRADS[cat]?.b ?? '#585e68'}
                />
                <button
                  onClick={e => { e.stopPropagation(); onCategorySelect?.(cat) }}
                  className="absolute flex items-center justify-center rounded-full active:scale-90 transition-transform"
                  style={{ bottom: 5, right: 5, width: 26, height: 26, background: '#FC8019', color: '#fff', fontSize: 18, fontWeight: 700, boxShadow: '0 2px 6px rgba(252,128,25,0.4)', zIndex: 10 }}
                  aria-label="Explore category"
                >+</button>
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

function TopRatedSection({ block, profile, onRestaurantSelect, onAdd, onCategorySelect }: {
  block: HomepageJSON['slot_top_rated']; profile: UserProfile
  onRestaurantSelect?: (info: RestaurantInfo) => void
  onAdd?: (item: HomepageItem) => void
  onCategorySelect?: (category: string) => void
}) {
  const raw = block.items.slice(0, 8)
  const items = atLeastThree(raw)
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <div className="bg-white" style={{ paddingBottom: 14 }}>
      <SectionHead
        title="Top Rated Near You"
        onViewAll={() => onCategorySelect?.(profile.top_cuisines?.[0] ?? 'Biryani')}
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
                  <FoodImg name={item.restaurant} extra={item.name} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
                  <StarOnPhoto rating={item.rating} />
                  <EtaOnPhoto min={item.delivery_min} />
                  <SpringAddButton onAdd={() => onAdd?.(item)} size={24} fontSize={16} bottom={5} right={5} />
                </div>
                <div style={{ padding: '7px 8px 8px' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.restaurant}</p>
                  <p style={{ fontSize: 10, color: '#686b78', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Fun footer — slot-aware floating food strip + rotating sign-off ─────────

const FUN_LINES: Array<{ text: string; slots?: MealPart[] }> = [
  { text: '🍛 Made with extra masala in India' },
  { text: '🫓 You scrolled this far… that’s basically cardio' },
  { text: '🍕 0 calories were harmed in the making of this page' },
  { text: '🥟 Every momo you didn’t order is a momo someone else enjoyed' },
  { text: '☕ Powered by chai and questionable cravings' },
  { text: '🌅 Rise, shine, and order breakfast', slots: ['breakfast'] },
  { text: '☀️ Lunch is calling. It says hurry.', slots: ['lunch'] },
  { text: '🍵 It’s chai o’clock somewhere. Here, actually.', slots: ['snacks'] },
  { text: '🌙 Dinner decisions are the hardest decisions', slots: ['dinner'] },
  { text: '🌙 Late-night scrolls hit different', slots: ['late_night'] },
]

function FunFooter() {
  const hour = new Date().getHours()
  const slot = getMealSlot(hour)
  const foods = slot.categories.slice(0, 7)
  // Random pick per mount; slot-specific lines only in their window
  const [line] = useState(() => {
    const pool = FUN_LINES.filter(l => !l.slots || l.slots.includes(slot.part))
    return pool[Math.floor(Math.random() * pool.length)].text
  })

  return (
    <div className="text-center" style={{ padding: '20px 0 28px' }}>
      <div className="flex justify-center overflow-x-auto hide-scrollbar" style={{ gap: 12, padding: '0 15px 14px' }}>
        {foods.map((cat, i) => (
          <div key={cat} className="flex-shrink-0 flex flex-col items-center" style={{ gap: 4 }}>
            <div
              className="rounded-full overflow-hidden foot-float"
              style={{ width: 42, height: 42, border: '1.5px solid #ebebeb', animationDelay: `${i * 0.35}s` }}
            >
              <FoodImg name={cat} emoji={MEAL_EMOJI[cat] ?? '🍽️'} gradA={MEAL_GRADS[cat]?.a ?? '#8a6838'} gradB={MEAL_GRADS[cat]?.b ?? '#6a5028'} />
            </div>
            <span style={{ fontSize: 8.5, fontWeight: 600, color: '#93959f' }}>{cat}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: '#93959f' }}>{line}</p>
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
  onBannerExplore?: (theme: string, context: string) => void
  onCartClick?: () => void
  onDishSelect?: (dish: string, cuisine: string, whyTrending: string, searchSignal: string, restaurants: import('@/types').TrendMatch[]) => void
  onSeeAllTrending?: (items: import('@/types').TrendMatch[]) => void
}

export default function HomeFeed({
  homepage, profile, detectedCity,
  onRestaurantSelect, onCategorySelect, onBannerExplore, onCartClick, onDishSelect, onSeeAllTrending,
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

  const seasonTag = homepage.mood_banner?.theme ?? undefined
  const locationTag = profile.area ?? undefined

  const sharedProps = { onRestaurantSelect, onAdd: handleAdd, onCategorySelect }

  const footer = <FunFooter />

  const trendingBlock = showTrending && (
    <>
      <TrendingNearYou city={trendingCity!} onDishSelect={onDishSelect} onSeeAll={onSeeAllTrending} />
      <Divider />
    </>
  )

  const categoryBlock = homepage.whats_on_your_mind?.length > 0 && (
    <>
      <div style={{ background: '#fff' }}>
        <FoodCategoryRow
          categories={homepage.whats_on_your_mind}
          seasonTag={seasonTag}
          locationTag={locationTag}
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
      <div className="pb-28" style={{ background: '#f4f4f4' }}>
        <LoyalistHero homepage={homepage} profile={profile} {...sharedProps} />
        <Divider />
        {bannerBlock}
        <Divider />
        <TopRatedSection block={homepage.slot_top_rated} profile={profile} {...sharedProps} />
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
      <div className="pb-28" style={{ background: '#f4f4f4' }}>
        <ExplorerHero homepage={homepage} profile={profile} {...sharedProps} />
        <Divider />
        {trendingBlock}
        <TopRatedSection block={homepage.slot_top_rated} profile={profile} {...sharedProps} />
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
      <div className="pb-28" style={{ background: '#f4f4f4' }}>
        <VarietyHero profile={profile} onCategorySelect={onCategorySelect} />
        <Divider />
        {trendingBlock}
        <TopRatedSection block={homepage.slot_top_rated} profile={profile} {...sharedProps} />
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
