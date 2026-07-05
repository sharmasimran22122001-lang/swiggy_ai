'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { TrendMatch } from '@/types'
import FoodImage from './FoodImage'

function buildFallback(city: string): TrendMatch[] {
  return [
    { trending_name: 'Chicken Biryani',  cuisine: 'Biryani',      why_trending: 'Most ordered this week',  search_signal: 'high',   dish: 'Chicken Biryani',  veg: false, price: 220, restaurant: `${city} Biryani House`, area: city, rating: 4.4, delivery_min: 28 },
    { trending_name: 'Masala Dosa',      cuisine: 'South Indian', why_trending: 'Breakfast favourite',     search_signal: 'high',   dish: 'Masala Dosa',      veg: true,  price: 90,  restaurant: `Udupi ${city}`,         area: city, rating: 4.2, delivery_min: 22 },
    { trending_name: 'Butter Chicken',   cuisine: 'North Indian', why_trending: 'Weekend comfort pick',    search_signal: 'medium', dish: 'Butter Chicken',   veg: false, price: 310, restaurant: 'Punjab Da Dhaba',        area: city, rating: 4.5, delivery_min: 35 },
    { trending_name: 'Veg Fried Rice',   cuisine: 'Chinese',      why_trending: 'Office lunch staple',     search_signal: 'medium', dish: 'Veg Fried Rice',   veg: true,  price: 190, restaurant: `Dragon Wok ${city}`,    area: city, rating: 4.1, delivery_min: 30 },
    { trending_name: 'Margherita Pizza', cuisine: 'Pizza',        why_trending: 'Trending on weekends',    search_signal: 'high',   dish: 'Margherita Pizza', veg: true,  price: 280, restaurant: 'Slice Republic',         area: city, rating: 4.3, delivery_min: 40 },
    { trending_name: 'Paneer Tikka',     cuisine: 'North Indian', why_trending: 'Snack time hit',          search_signal: 'medium', dish: 'Paneer Tikka',     veg: true,  price: 250, restaurant: 'Tandoor Trail',          area: city, rating: 4.4, delivery_min: 32 },
  ]
}

interface Props {
  city: string
  onDishSelect?: (dish: string, cuisine: string, whyTrending: string, searchSignal: string, restaurants: TrendMatch[]) => void
  onSeeAll?: (items: TrendMatch[]) => void
}

export default function TrendingNearYou({ city, onDishSelect, onSeeAll }: Props) {
  const [items, setItems] = useState<TrendMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!city) return
    setLoading(true)
    fetch(`/api/trending/available?city=${encodeURIComponent(city)}`)
      .then(r => r.json())
      .then(data => {
        const live = data.items ?? []
        setItems(live.length >= 2 ? live : buildFallback(city))
      })
      .catch(() => setItems(buildFallback(city)))
      .finally(() => setLoading(false))
  }, [city])

  if (loading) return <Skeleton />

  // One card per unique trending dish — show the best-rated match as the card
  const unique: TrendMatch[] = Array.from(
    items.reduce((map, item) => {
      const existing = map.get(item.trending_name)
      if (!existing || item.rating > existing.rating) map.set(item.trending_name, item)
      return map
    }, new Map<string, TrendMatch>()).values()
  ).slice(0, 8)

  function handleCardClick(item: TrendMatch) {
    // Pass ALL restaurants that serve this trending dish (not just the best one)
    const allForDish = items.filter(i => i.trending_name === item.trending_name)
    onDishSelect?.(item.trending_name, item.cuisine, item.why_trending, item.search_signal, allForDish)
  }

  return (
    <div className="bg-white" style={{ paddingBottom: 14 }}>
      {/* Section head */}
      <div style={{ padding: '14px 15px 8px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>🔥 Trending Near You</h2>
        <p style={{ fontSize: 10, color: '#93959f', marginTop: 2 }}>What {city} is ordering right now</p>
      </div>

      {/* Dish cards */}
      <div className="flex overflow-x-auto" style={{ gap: 10, padding: '0 15px 4px', scrollbarWidth: 'none' }}>
        {unique.map((item, i) => (
          <motion.div
            key={item.trending_name}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform rounded-[12px] overflow-hidden"
            style={{ width: 130, border: '1px solid #e0e0e0', background: '#fff' }}
            onClick={() => handleCardClick(item)}
          >
            {/* Real food photo */}
            <div className="relative" style={{ height: 90 }}>
              <FoodImage
                dishName={item.dish}
                width={260}
                height={180}
                fallbackIndex={i}
                style={{ width: '100%', height: 90 }}
              />

              {/* Gradient overlay at bottom */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)',
              }} />

              {/* Rank badge */}
              <div
                className="absolute"
                style={{
                  top: 6, left: 6,
                  background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                  color: '#fff', fontSize: 8.5, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 8,
                }}
              >
                #{i + 1} Trending
              </div>

              {/* High signal pulse dot */}
              {item.search_signal === 'high' && (
                <div
                  className="absolute rounded-full animate-pulse"
                  style={{ top: 7, right: 7, width: 7, height: 7, background: '#ef4444' }}
                />
              )}

              {/* Dish name on photo */}
              <p style={{
                position: 'absolute', bottom: 6, left: 8, right: 8,
                fontSize: 11, fontWeight: 700, color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.dish}
              </p>
            </div>

            {/* Info row */}
            <div style={{ padding: '7px 8px 9px' }}>
              <p style={{ fontSize: 10, color: '#686b78', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.why_trending}
              </p>
              <div className="flex items-center justify-between" style={{ marginTop: 5 }}>
                <div className="flex items-center" style={{ gap: 4 }}>
                  <span style={{ background: '#3d9b6e', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>
                    ★ {item.rating?.toFixed(1) ?? '4.2'}
                  </span>
                  <span style={{ fontSize: 9.5, color: '#93959f' }}>{item.delivery_min}m</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#FC8019' }}>₹{item.price}</span>
              </div>
              <p style={{ fontSize: 9.5, fontWeight: 600, color: '#FC8019', marginTop: 5, textAlign: 'center', letterSpacing: '0.02em' }}>
                View restaurants →
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dashed CTA */}
      <div
        className="flex items-center justify-between cursor-pointer active:opacity-70"
        style={{ margin: '10px 15px 0', padding: '8px 14px', border: '1.5px dashed #bdbdbd', borderRadius: 10 }}
        onClick={() => onSeeAll?.(items)}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#686b78' }}>Explore all trending in {city}</span>
        <span style={{ fontSize: 13, color: '#FC8019', fontWeight: 700 }}>→</span>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="bg-white" style={{ paddingBottom: 14 }}>
      <div style={{ padding: '14px 15px 8px' }}>
        <div className="rounded animate-pulse" style={{ height: 14, width: 160, background: '#f0f0f0', marginBottom: 5 }} />
        <div className="rounded animate-pulse" style={{ height: 10, width: 200, background: '#f0f0f0' }} />
      </div>
      <div className="flex" style={{ gap: 10, padding: '0 15px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-shrink-0 rounded-[12px] animate-pulse" style={{ width: 130, height: 160, background: '#f0f0f0' }} />
        ))}
      </div>
    </div>
  )
}
