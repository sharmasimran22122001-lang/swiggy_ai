'use client'
import { motion } from 'framer-motion'
import type { TrendMatch } from '@/types'
import type { RestaurantInfo } from './RestaurantPage'
import FoodImage from './FoodImage'
import { getRestaurantVisual } from './CategoryPage'
import { ratingShade } from './CardBadges'

interface Props {
  dish: string
  cuisine: string
  whyTrending: string
  searchSignal: string
  restaurants: TrendMatch[]
  onBack: () => void
  onRestaurantSelect: (info: RestaurantInfo) => void
}

export default function DishPage({ dish, cuisine, whyTrending, searchSignal, restaurants, onBack, onRestaurantSelect }: Props) {
  // Sort by rating descending
  const sorted = [...restaurants].sort((a, b) => b.rating - a.rating)
  const isHighSignal = searchSignal === 'high'

  return (
    <div className="min-h-dvh" style={{ background: '#f4f4f4' }}>

      {/* ── Hero image ── */}
      <div className="relative" style={{ height: 240 }}>
        <FoodImage
          dishName={dish}
          width={600}
          height={400}
          className="w-full h-full"
          style={{ height: 240 }}
        />

        {/* Dark gradient overlay for text readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.38) 55%, rgba(0,0,0,0.15) 100%)',
        }} />

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute flex items-center justify-center rounded-full"
          style={{
            top: 14, left: 14, width: 36, height: 36, zIndex: 10,
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>

        {/* Trending badge */}
        {isHighSignal && (
          <div
            className="absolute flex items-center gap-1"
            style={{
              top: 16, right: 14,
              background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(6px)',
              color: '#fff', fontSize: 10, fontWeight: 700,
              padding: '4px 9px', borderRadius: 20,
            }}
          >
            <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            Trending Now
          </div>
        )}

        {/* Dish name + meta on image */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 16px 18px' }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {cuisine}
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            {dish}
          </h1>
        </div>
      </div>

      {/* ── Why trending strip ── */}
      <div
        style={{
          background: '#fff',
          padding: '10px 16px 11px',
          borderBottom: '1px solid #ebebeb',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>🔥</span>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152' }}>{whyTrending}</p>
          <p style={{ fontSize: 10, color: '#93959f', marginTop: 1 }}>India trending · {cuisine} cuisine</p>
        </div>
      </div>

      {/* ── Restaurant list ── */}
      <div style={{ background: '#fff', marginTop: 8 }}>
        <div style={{ padding: '13px 16px 8px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>
            Available at {sorted.length} restaurant{sorted.length !== 1 ? 's' : ''}
          </h2>
          <p style={{ fontSize: 11, color: '#93959f', marginTop: 2 }}>Sorted by rating — best first</p>
        </div>

        {sorted.map((r, i) => {
          const vis = getRestaurantVisual(r.restaurant, i)
          return (
            <motion.div
              key={`${r.restaurant}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onRestaurantSelect({
                name: r.restaurant,
                area: r.area,
                cuisines: [r.cuisine],
                rating: r.rating,
                delivery_min: r.delivery_min,
              })}
              className="flex items-center gap-3 cursor-pointer active:bg-gray-50"
              style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', position: 'relative' }}
            >
              {/* Restaurant thumbnail with real food image */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <FoodImage
                  dishName={r.dish}
                  width={130}
                  height={130}
                  fallbackIndex={i}
                  style={{ width: 68, height: 68, borderRadius: 12, overflow: 'hidden' }}
                />
                {/* Rank badge */}
                <div
                  style={{
                    position: 'absolute', top: -4, left: -4,
                    width: 20, height: 20, borderRadius: '50%',
                    background: i === 0 ? '#FC8019' : '#3d4152',
                    color: '#fff', fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  }}
                >
                  #{i + 1}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.restaurant}
                </p>
                <p style={{ fontSize: 11, color: '#686b78', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.dish} · ₹{r.price}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: ratingShade(r.rating),
                      color: '#fff', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 4,
                    }}
                  >
                    ★ {r.rating.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#93959f' }}>· {r.delivery_min} min</span>
                  {r.area && <span style={{ fontSize: 10.5, color: '#93959f' }}>· {r.area}</span>}
                  {r.rating >= 4.3 && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#FC8019', background: 'rgba(252,128,25,0.1)', padding: '1px 6px', borderRadius: 20 }}>
                      Top Pick
                    </span>
                  )}
                </div>
              </div>

              {/* Chevron */}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bdbdbd" strokeWidth="2.5" style={{ flexShrink: 0 }}>
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
