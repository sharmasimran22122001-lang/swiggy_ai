'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, X } from 'lucide-react'
import FoodImg from './FoodImg'
import type { RestaurantInfo } from './RestaurantPage'

interface SearchResult {
  name: string
  area: string
  city: string
  rating: number
  delivery_min: number
  cuisines: string[]
  matched_dish: string | null
}

interface Props {
  city?: string
  onBack: () => void
  onRestaurantSelect: (info: RestaurantInfo) => void
}

const POPULAR = ['Biryani', 'Pizza', 'Burger', 'Dosa', 'Momos', 'Chai', 'Ice Cream', 'Paneer']

export default function SearchPage({ city, onBack, onRestaurantSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Debounced live search
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setResults([]); setSearched(false); return }
    setSearching(true)
    const t = setTimeout(() => {
      const params = new URLSearchParams({ q })
      if (city) params.set('city', city)
      fetch(`/api/search?${params}`)
        .then(r => r.json())
        .then(data => { setResults(data.results ?? []); setSearched(true) })
        .catch(() => { setResults([]); setSearched(true) })
        .finally(() => setSearching(false))
    }, 350)
    return () => clearTimeout(t)
  }, [query, city])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ minHeight: '100dvh', background: '#fff' }}
    >
      {/* Search header */}
      <div className="sticky top-0 z-20 bg-white flex items-center gap-2" style={{ padding: '14px 15px 10px', borderBottom: '1px solid #ebebeb' }}>
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, border: '1.5px solid #e0e0e0', borderRadius: 7 }}
          aria-label="Back"
        >
          <ArrowLeft size={16} color="#3d4152" />
        </button>
        <div className="flex-1 flex items-center gap-2 rounded-xl px-3" style={{ background: '#f4f4f4', height: 40 }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: '#FC8019' }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={`Search restaurants & dishes${city ? ` in ${city}` : ''}`}
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{ fontSize: 13.5, color: '#3d4152' }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="flex-shrink-0">
              <X size={15} color="#93959f" />
            </button>
          )}
        </div>
      </div>

      {/* Popular chips (empty state) */}
      {query.trim().length < 2 && (
        <div style={{ padding: '18px 15px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93959f', marginBottom: 10 }}>
            Popular searches
          </p>
          <div className="flex flex-wrap" style={{ gap: 8 }}>
            {POPULAR.map(p => (
              <button
                key={p}
                onClick={() => setQuery(p)}
                className="active:scale-95 transition-transform"
                style={{ fontSize: 12, fontWeight: 600, color: '#3d4152', border: '1px solid #e0e0e0', borderRadius: 18, padding: '7px 14px', background: '#fff' }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Searching shimmer */}
      {searching && (
        <div style={{ padding: '14px 15px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse" style={{ padding: '10px 0' }}>
              <div className="rounded-[10px]" style={{ width: 58, height: 58, background: '#f0f0f0' }} />
              <div className="flex-1">
                <div className="rounded" style={{ height: 12, width: '55%', background: '#f0f0f0', marginBottom: 8 }} />
                <div className="rounded" style={{ height: 10, width: '35%', background: '#f0f0f0' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!searching && results.length > 0 && (
        <div>
          <p style={{ padding: '12px 15px 4px', fontSize: 11, color: '#93959f' }}>
            {results.length} result{results.length === 1 ? '' : 's'} for “{query.trim()}”
          </p>
          {results.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              onClick={() => onRestaurantSelect({
                name: r.name,
                area: r.area,
                cuisines: r.cuisines,
                rating: r.rating,
                delivery_min: r.delivery_min,
              })}
              className="flex items-center gap-3 cursor-pointer active:bg-gray-50"
              style={{ padding: '11px 15px', borderBottom: '1px solid #f0f0f0' }}
            >
              <div className="rounded-[10px] overflow-hidden flex-shrink-0" style={{ width: 58, height: 58 }}>
                <FoodImg name={r.matched_dish ?? r.name} extra={r.cuisines.join(' ')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate" style={{ fontSize: 13, fontWeight: 700, color: '#3d4152' }}>{r.name}</p>
                {r.matched_dish && (
                  <p className="truncate" style={{ fontSize: 10.5, color: '#FC8019', fontWeight: 600, marginTop: 1 }}>
                    has “{r.matched_dish}”
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 3 }}>
                  <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded" style={{ background: '#3d9b6e', fontSize: 9.5, fontWeight: 700, color: '#fff' }}>
                    ★ {r.rating?.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10.5, color: '#93959f' }}>{r.delivery_min} min</span>
                  {r.area && <span style={{ fontSize: 10.5, color: '#93959f' }}>· {r.area}</span>}
                </div>
              </div>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#bdbdbd" strokeWidth="2.5" className="flex-shrink-0">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </motion.div>
          ))}
        </div>
      )}

      {/* No results */}
      {!searching && searched && results.length === 0 && query.trim().length >= 2 && (
        <div className="text-center" style={{ padding: '56px 24px' }}>
          <p style={{ fontSize: 34 }}>🔍</p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152', marginTop: 10 }}>No matches for “{query.trim()}”</p>
          <p style={{ fontSize: 12, color: '#93959f', marginTop: 4 }}>Try a dish name like “biryani” or a restaurant name</p>
        </div>
      )}
    </motion.div>
  )
}
