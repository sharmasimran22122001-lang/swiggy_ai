'use client'
import { motion } from 'framer-motion'
import type { TrendMatch } from '@/types'
import FoodImage from './FoodImage'

interface Props {
  city: string
  items: TrendMatch[]
  onBack: () => void
  onDishSelect: (dish: string, cuisine: string, whyTrending: string, searchSignal: string, restaurants: TrendMatch[]) => void
}

export default function TrendingAllPage({ city, items, onBack, onDishSelect }: Props) {
  // One entry per unique dish — best-rated restaurant for each
  const unique: TrendMatch[] = Array.from(
    items.reduce((map, item) => {
      const existing = map.get(item.trending_name)
      if (!existing || item.rating > existing.rating) map.set(item.trending_name, item)
      return map
    }, new Map<string, TrendMatch>()).values()
  )

  function handleTap(item: TrendMatch) {
    const allForDish = items.filter(i => i.trending_name === item.trending_name)
    onDishSelect(item.trending_name, item.cuisine, item.why_trending, item.search_signal, allForDish)
  }

  return (
    <div className="min-h-dvh" style={{ background: '#f4f4f4' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #ebebeb', padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ width: 34, height: 34, borderRadius: '50%', background: '#f4f4f4', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#3d4152" strokeWidth="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <div>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: '#3d4152' }}>🔥 Trending in {city}</h1>
          <p style={{ fontSize: 11, color: '#93959f', marginTop: 1 }}>Dishes popular across India, available near you</p>
        </div>
      </div>

      {/* Dish list */}
      <div style={{ background: '#fff', marginTop: 8 }}>
        {unique.map((item, i) => {
          const count = items.filter(it => it.trending_name === item.trending_name).length
          return (
            <motion.div
              key={item.trending_name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleTap(item)}
              className="flex items-center gap-12 cursor-pointer active:bg-gray-50"
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', gap: 12 }}
            >
              {/* Food photo */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <FoodImage
                  dishName={item.dish}
                  width={140}
                  height={140}
                  fallbackIndex={i}
                  style={{ width: 64, height: 64, borderRadius: 12, overflow: 'hidden' }}
                />
                {item.search_signal === 'high' && (
                  <div className="absolute rounded-full animate-pulse" style={{ top: -3, right: -3, width: 8, height: 8, background: '#ef4444', border: '1.5px solid #fff' }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#3d4152' }}>{item.dish}</p>
                <p style={{ fontSize: 11, color: '#686b78', marginTop: 2 }}>{item.why_trending}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
                  <span style={{ fontSize: 10.5, color: '#93959f' }}>{item.cuisine}</span>
                  <span style={{ fontSize: 10, color: '#d1d5db' }}>·</span>
                  <span style={{ fontSize: 10.5, color: '#FC8019', fontWeight: 600 }}>{count} restaurant{count !== 1 ? 's' : ''} nearby</span>
                </div>
              </div>

              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="2.5" style={{ flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.div>
          )
        })}
      </div>

      <div style={{ height: 32 }} />
    </div>
  )
}
