'use client'

// Unified on-photo badge system (feedback round 1, improvement 4):
// every discovery card carries its rating and delivery ETA on the photo itself.

export function etaRange(min?: number): string {
  const m = min ?? 30
  return `${m}–${m + 5} min`
}

/** Cap any AI-written blurb at n words — subtexts must be readable at a glance. */
export function fewWords(text: string | undefined, n = 4): string {
  if (!text) return ''
  const words = text.replace(/[.!]+$/, '').split(/\s+/)
  return words.length <= n ? words.join(' ') : words.slice(0, n).join(' ') + '…'
}

// Upfront cards only show ratings ≥ 4.0 — the badge colour deepens with quality:
// lightest green at ★4.0 → darkest green at ★5.0. White text stays readable on all steps.
export const MIN_UPFRONT_RATING = 4.0

export function ratingShade(rating: number): string {
  if (rating >= 4.9) return '#0d5c3c'   // ★5.0 — darkest
  if (rating >= 4.7) return '#1b7048'
  if (rating >= 4.5) return '#2a8656'   // mid
  if (rating >= 4.3) return '#3d9b6e'
  return '#55ab80'                      // ★4.0–4.2 — lightest
}

export function StarOnPhoto({ rating, top = 4, left = 4, bottom }: { rating?: number; top?: number; left?: number; bottom?: number }) {
  if (!rating) return null
  return (
    <span style={{
      position: 'absolute', ...(bottom !== undefined ? { bottom } : { top }), left, zIndex: 5,
      background: ratingShade(rating), color: '#fff',
      fontSize: 8.5, fontWeight: 800, padding: '2px 6px', borderRadius: 999,
      lineHeight: 1.4, letterSpacing: '0.01em',
    }}>
      ★ {rating.toFixed(1)}
    </span>
  )
}

export function EtaOnPhoto({ min, bottom = 4, left = 4, right }: { min?: number; bottom?: number; left?: number; right?: number }) {
  return (
    <span style={{
      position: 'absolute', bottom, ...(right !== undefined ? { right } : { left }), zIndex: 5,
      background: 'rgba(24,24,28,0.62)', color: '#fff', backdropFilter: 'blur(3px)',
      fontSize: 7.5, fontWeight: 800, padding: '2px 6px', borderRadius: 999,
      lineHeight: 1.4, whiteSpace: 'nowrap',
    }}>
      {etaRange(min)}
    </span>
  )
}

export function TrendingBadge({ top = 4, left = 4 }: { top?: number; left?: number }) {
  return (
    <span style={{
      position: 'absolute', top, left, zIndex: 5,
      background: 'linear-gradient(120deg, #ff5d3a, #e8321e)', color: '#fff',
      fontSize: 7.5, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
      lineHeight: 1.4, whiteSpace: 'nowrap', letterSpacing: '0.02em',
    }}>
      🔥 Trending
    </span>
  )
}
