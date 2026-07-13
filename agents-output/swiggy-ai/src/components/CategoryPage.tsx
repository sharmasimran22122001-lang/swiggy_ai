'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { RestaurantInfo } from './RestaurantPage'
import FoodImg from './FoodImg'
import { assignVenuePhotos } from '@/lib/foodPhotos'
import { ratingShade } from './CardBadges'

// ─── Cuisine → visual ─────────────────────────────────────────────────────────

const KEYWORD_VISUALS: Array<{ keys: string[]; emoji: string; gradA: string; gradB: string }> = [
  { keys: ['biryani', 'hyderabadi', 'andhra'],   emoji: '🍚', gradA: '#7a5a2a', gradB: '#9a7040' },
  { keys: ['pizza', 'italiano', 'pasta'],         emoji: '🍕', gradA: '#8a5030', gradB: '#a06020' },
  { keys: ['burger', 'grill', 'smash'],           emoji: '🍔', gradA: '#7a4a28', gradB: '#8a6030' },
  { keys: ['dosa', 'idli', 'south', 'udupi'],     emoji: '🥘', gradA: '#3a6a4a', gradB: '#2a5a50' },
  { keys: ['chinese', 'noodle', 'wok', 'dragon'], emoji: '🥡', gradA: '#6a3838', gradB: '#583040' },
  { keys: ['cake', 'dessert', 'sweet', 'ice'],    emoji: '🍰', gradA: '#6a4a7a', gradB: '#7a4a68' },
  { keys: ['chai', 'coffee', 'cafe', 'brew'],     emoji: '☕', gradA: '#3a5a58', gradB: '#2a4a3a' },
  { keys: ['punjab', 'dhaba', 'tandoor', 'north', 'mughal'], emoji: '🍛', gradA: '#8a5030', gradB: '#7a3838' },
  { keys: ['kebab', 'seekh', 'barbeque', 'bbq'],  emoji: '🍢', gradA: '#5a4070', gradB: '#404070' },
  { keys: ['sandwich', 'bakery', 'sub'],          emoji: '🥪', gradA: '#3a5068', gradB: '#385870' },
  { keys: ['roll', 'wrap', 'frankie'],            emoji: '🌯', gradA: '#2a5a40', gradB: '#386050' },
  { keys: ['thali', 'meal', 'tiffin'],            emoji: '🍱', gradA: '#8a6020', gradB: '#9a6828' },
  { keys: ['momos', 'dimsim', 'tibetan'],         emoji: '🥟', gradA: '#4a4a78', gradB: '#584878' },
  { keys: ['seafood', 'fish', 'prawn', 'crab'],   emoji: '🦐', gradA: '#2a5a68', gradB: '#2a6070' },
  { keys: ['continental', 'salad', 'healthy'],    emoji: '🥗', gradA: '#384878', gradB: '#584878' },
]

const FALLBACK_POOL = [
  { emoji: '🍽️', gradA: '#4a5060', gradB: '#585e68' },
  { emoji: '🥘', gradA: '#384878', gradB: '#584878' },
  { emoji: '🍜', gradA: '#3a5a58', gradB: '#2a4a3a' },
  { emoji: '🍖', gradA: '#7a5a30', gradB: '#6a4828' },
  { emoji: '🫕', gradA: '#2a5a38', gradB: '#224a30' },
  { emoji: '🧆', gradA: '#3a5068', gradB: '#386070' },
]

export function getRestaurantVisual(name: string, idx: number) {
  const n = name.toLowerCase()
  for (const v of KEYWORD_VISUALS) {
    if (v.keys.some(k => n.includes(k))) return v
  }
  return FALLBACK_POOL[idx % FALLBACK_POOL.length]
}

// ─── Category context bar text ────────────────────────────────────────────────

function contextBarText(category: string, context?: string) {
  if (context) return context
  const map: Record<string, string> = {
    'Biryani': '🍚 Best biryani joints near you',
    'Pizza': '🍕 Top-rated pizza spots',
    'Burgers': '🍔 Smash, grill & more',
    'North Indian': '🍛 Dal makhani, butter chicken & more',
    'South Indian': '🥘 Dosa, idli & filter coffee',
    'Chinese': '🥡 Wok-tossed & delivered hot',
    'Chai & Snacks': '☕ Tea & snacks for the moment',
    'Samosa': '🥟 Crispy & piping hot',
    'Pakoda': '🫓 Monsoon essential',
    'Momos': '🥟 Steamed or fried, always good',
    'Noodles': '🍜 Slurp-worthy noodle spots',
    'Hot Soup': '🍲 Warm your soul',
  }
  // No invented headers for list titles like "Places you'll love" — keep it clean
  return map[category] ?? ''
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  category: string
  context?: string           // optional override headline (used by banner explore)
  restaurants: RestaurantInfo[]
  onBack: () => void
  onRestaurantSelect: (info: RestaurantInfo) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CategoryPage({ category, context, restaurants, onBack, onRestaurantSelect }: Props) {
  const [sortBy, setSortBy] = useState<'rating' | 'delivery'>('rating')

  const sorted = [...restaurants].sort((a, b) =>
    sortBy === 'rating'
      ? b.rating - a.rating
      : a.delivery_min - b.delivery_min
  )
  const venuePhotos = assignVenuePhotos(sorted.map(r => r.name))

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      style={{ minHeight: '100dvh', background: '#f4f4f4' }}
    >
      {/* Sub-header */}
      <div className="bg-white flex items-center gap-3" style={{ padding: '13px 15px', borderBottom: '1px solid #ebebeb' }}>
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, border: '1.5px solid #e0e0e0', borderRadius: 7 }}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#3d4152" strokeWidth="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>{category}</p>
          <p style={{ fontSize: 11, color: '#93959f', marginTop: 1 }}>{restaurants.length} restaurants</p>
        </div>
      </div>

      {/* Context bar — only when there is a real line to show */}
      {contextBarText(category, context) && (
        <div
          className="bg-white"
          style={{ padding: '10px 15px 11px', borderBottom: '1px solid #ebebeb' }}
        >
          <p style={{ fontSize: 12, fontWeight: 600, color: '#3d4152' }}>{contextBarText(category, context)}</p>
        </div>
      )}

      {/* Sort chips */}
      <div className="flex gap-2 bg-white" style={{ padding: '8px 15px 10px', borderBottom: '1px solid #ebebeb' }}>
        {(['rating', 'delivery'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className="px-3 py-1 rounded-full text-[11px] font-bold"
            style={{
              border: `1.5px solid ${sortBy === s ? '#FC8019' : '#e0e0e0'}`,
              color: sortBy === s ? '#FC8019' : '#686b78',
              background: sortBy === s ? 'rgba(252,128,25,0.06)' : '#fff',
            }}
          >
            {s === 'rating' ? '★ Top Rated' : '⚡ Fastest'}
          </button>
        ))}
      </div>

      {/* Restaurant list */}
      <div className="flex flex-col" style={{ gap: 1 }}>
        {sorted.map((r, i) => {
          const vis = getRestaurantVisual(r.name, i)
          return (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onRestaurantSelect(r)}
              className="bg-white flex items-center gap-3 cursor-pointer active:bg-gray-50"
              style={{ padding: '12px 15px', borderBottom: '1px solid #f0f0f0' }}
            >
              {/* 64×64 venue photo — unique within this list */}
              <div className="rounded-[10px] overflow-hidden flex-shrink-0" style={{ width: 64, height: 64 }}>
                <FoodImg name={r.name} kind="venue" src={venuePhotos[r.name]} emoji={vis.emoji} gradA={vis.gradA} gradB={vis.gradB} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 13, fontWeight: 700, color: '#3d4152' }} className="truncate">{r.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded"
                    style={{ background: ratingShade(r.rating), fontSize: 10, fontWeight: 700, color: '#fff' }}
                  >
                    ★ {r.rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#93959f' }}>{r.delivery_min}–{r.delivery_min + 5} min</span>
                </div>
              </div>

              {/* Chevron */}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bdbdbd" strokeWidth="2.5" className="flex-shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.div>
          )
        })}

        {sorted.length === 0 && (
          <div className="text-center py-16">
            <p style={{ fontSize: 32 }}>🍽️</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152', marginTop: 8 }}>No restaurants found</p>
            <p style={{ fontSize: 12, color: '#93959f', marginTop: 4 }}>Try a different category</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
