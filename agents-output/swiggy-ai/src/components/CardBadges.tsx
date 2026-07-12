'use client'

// Unified on-photo badge system (feedback round 1, improvement 4):
// every discovery card carries its rating and delivery ETA on the photo itself.

export function etaRange(min?: number): string {
  const m = min ?? 30
  return `${m}–${m + 5} min`
}

export function StarOnPhoto({ rating, top = 4, left = 4, bottom }: { rating?: number; top?: number; left?: number; bottom?: number }) {
  if (!rating) return null
  return (
    <span style={{
      position: 'absolute', ...(bottom !== undefined ? { bottom } : { top }), left, zIndex: 5,
      background: 'rgba(22,110,72,0.92)', color: '#fff',
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
