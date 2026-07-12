'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, X, Clock, TrendingUp } from 'lucide-react'
import FoodImg from './FoodImg'
import type { RestaurantInfo } from './RestaurantPage'

const RECENT_KEY = 'swiggy_recent_searches'

function loadRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') } catch { return [] }
}
function persistRecent(list: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)) } catch { /* private mode */ }
}

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

// Popular dishes shown as photo tiles in the empty state
const POPULAR = ['Biryani', 'Pizza', 'Burger', 'Momos', 'Dosa', 'Paneer', 'Rolls', 'Ice Cream']

export default function SearchPage({ city, onBack, onRestaurantSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus(); setRecent(loadRecent()) }, [])

  function saveRecent(q: string) {
    const clean = q.trim()
    if (clean.length < 2) return
    const lower = clean.toLowerCase()
    setRecent(prev => {
      const next = [
        clean,
        // drop exact duplicates AND half-typed prefixes ("piz" once "pizza" lands)
        ...prev.filter(r => {
          const rl = r.toLowerCase()
          return rl !== lower && !lower.startsWith(rl)
        }),
      ].slice(0, 8)
      persistRecent(next)
      return next
    })
  }

  function clearRecent() {
    setRecent([])
    persistRecent([])
  }

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
        .then(data => {
          const found = data.results ?? []
          setResults(found)
          setSearched(true)
          // Every real search (one that found something) lands in Recently searched
          if (found.length > 0) saveRecent(q)
        })
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
            onKeyDown={e => { if (e.key === 'Enter') saveRecent(query) }}
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

      {/* Empty state: recently searched + popular photo grid */}
      {query.trim().length < 2 && (
        <div style={{ padding: '18px 15px' }}>

          {/* ── Recently searched ── */}
          {recent.length > 0 && (
            <div style={{ marginBottom: 26 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <Clock size={13} color="#93959f" />
                  <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93959f' }}>
                    Recently searched
                  </p>
                </div>
                <button onClick={clearRecent} style={{ fontSize: 11, fontWeight: 700, color: '#FC8019' }}>
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap" style={{ gap: 8 }}>
                {recent.map(r => (
                  <button
                    key={r}
                    onClick={() => setQuery(r)}
                    className="flex items-center active:scale-95 transition-transform"
                    style={{ gap: 6, fontSize: 12, fontWeight: 600, color: '#3d4152', border: '1px solid #e0e0e0', borderRadius: 18, padding: '7px 13px', background: '#fafafa' }}
                  >
                    <Clock size={11} color="#bdbdbd" />
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Popular right now ── */}
          <div className="flex items-center" style={{ gap: 6, marginBottom: 12 }}>
            <TrendingUp size={13} color="#FC8019" />
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#93959f' }}>
              Popular right now{city ? ` in ${city}` : ''}
            </p>
          </div>
          <div className="grid grid-cols-4" style={{ gap: 10 }}>
            {POPULAR.map((p, i) => (
              <motion.button
                key={p}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.045 }}
                onClick={() => { setQuery(p); saveRecent(p) }}
                className="flex flex-col items-center active:scale-95 transition-transform"
                style={{ gap: 6 }}
              >
                <div className="rounded-[14px] overflow-hidden w-full relative" style={{ aspectRatio: '1' }}>
                  <FoodImg name={p} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.25), transparent 45%)' }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 650, color: '#3d4152' }}>{p}</span>
              </motion.button>
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
              onClick={() => {
                saveRecent(query)
                onRestaurantSelect({
                  name: r.name,
                  area: r.area,
                  cuisines: r.cuisines,
                  rating: r.rating,
                  delivery_min: r.delivery_min,
                })
              }}
              className="flex items-center gap-3 cursor-pointer active:bg-gray-50"
              style={{ padding: '11px 15px', borderBottom: '1px solid #f0f0f0' }}
            >
              <div className="rounded-[10px] overflow-hidden flex-shrink-0" style={{ width: 58, height: 58 }}>
                {/* Result row is a restaurant → venue photo; matched dish stays as text below */}
                <FoodImg name={r.name} kind="venue" />
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
