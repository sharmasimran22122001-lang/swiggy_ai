'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { TrendMatch } from '@/types'
import FoodImage from './FoodImage'
import { StarOnPhoto, EtaOnPhoto, TrendingBadge } from './CardBadges'
import { useDragScroll } from '@/hooks/useDragScroll'

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
  const drag = useDragScroll<HTMLDivElement>()

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
  ).slice(0, 12) // show everything genuinely available in this city (capped for sanity)

  function handleCardClick(item: TrendMatch) {
    // Pass ALL restaurants that serve this trending dish (not just the best one)
    const allForDish = items.filter(i => i.trending_name === item.trending_name)
    onDishSelect?.(item.trending_name, item.cuisine, item.why_trending, item.search_signal, allForDish)
  }

  return (
    <div className="bg-white" style={{ paddingBottom: 14 }}>
      {/* Section head with View all (consistent with every other section) */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '14px 15px 8px', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>🔥 Trending Near You</h2>
          <p style={{ fontSize: 10, color: '#93959f', marginTop: 2 }}>What {city} is ordering right now</p>
        </div>
        <button
          onClick={() => onSeeAll?.(items)}
          className="active:opacity-70 flex-shrink-0"
          style={{ fontSize: 11, fontWeight: 700, color: '#FC8019', whiteSpace: 'nowrap', paddingBottom: 2 }}
        >View all →</button>
      </div>

      {/* Dish cards — same badge system as every other card: ★ + ETA on photo.
          A dish is served by many places: the card carries the BEST-rated
          match's rating/ETA, and the count below is explicit about the rest. */}
      <div className="row-fade-wrap">
        <div className="flex overflow-x-auto" {...drag} style={{ gap: 10, padding: '0 15px 4px', scrollbarWidth: 'none', ...drag.style }}>
          {unique.map((item, i) => (
            <motion.div
              key={item.trending_name}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.36) }}
              className="flex-shrink-0 cursor-pointer active:scale-95 transition-transform rounded-[12px] overflow-hidden"
              style={{ width: 130, border: '1px solid #e0e0e0', background: '#fff' }}
              onClick={() => handleCardClick(item)}
            >
              <div className="relative" style={{ height: 90 }}>
                <FoodImage
                  dishName={item.dish}
                  width={260}
                  height={180}
                  fallbackIndex={i}
                  style={{ width: '100%', height: 90 }}
                />
                {/* Uniform badge — no rank: the list is availability-filtered, ranks would lie */}
                <TrendingBadge top={5} left={5} />
                {item.search_signal === 'high' && (
                  <div
                    className="absolute rounded-full animate-pulse"
                    style={{ top: 7, right: 7, width: 7, height: 7, background: '#ef4444' }}
                  />
                )}
                <StarOnPhoto rating={item.rating ?? 4.2} bottom={5} left={5} />
                <EtaOnPhoto min={item.delivery_min} bottom={5} right={5} />
              </div>

              {/* Info — dish name off the photo, no price on discovery cards */}
              <div style={{ padding: '7px 8px 9px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#3d4152', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.dish}
                </p>
                <p style={{ fontSize: 9.5, color: '#686b78', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.why_trending}
                </p>
                <div className="flex items-center justify-between" style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 9.5, fontWeight: 600, color: '#FC8019', letterSpacing: '0.02em' }}>
                    {(() => { const n = items.filter(x => x.trending_name === item.trending_name).length; return n > 1 ? `At ${n} places` : 'View restaurant' })()}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#FC8019' }}>→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
