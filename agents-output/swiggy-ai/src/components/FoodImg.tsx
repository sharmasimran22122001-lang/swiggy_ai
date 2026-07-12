'use client'
import { useState } from 'react'
import { getFoodPhoto, getVenuePhoto } from '@/lib/foodPhotos'

interface Props {
  name: string
  extra?: string           // extra keyword context (e.g. cuisine) for photo matching
  kind?: 'dish' | 'venue'  // venue = restaurant identity → interior/storefront photo
  src?: string             // explicit photo (used by rows that pre-assign unique venue photos)
  emoji?: string           // fallback emoji if the photo fails to load
  gradA?: string
  gradB?: string
  style?: React.CSSProperties
  className?: string
}

/** Real photo that fills its parent, with a gradient+emoji fallback on load error. */
export default function FoodImg({ name, extra, kind = 'dish', src: srcOverride, emoji = '🍽️', gradA = '#4a5060', gradB = '#585e68', style, className = '' }: Props) {
  const [failed, setFailed] = useState(false)
  const src = srcOverride ?? (kind === 'venue' ? getVenuePhoto(name) : getFoodPhoto(name, extra))

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ width: '100%', height: '100%', background: `linear-gradient(145deg, ${gradA}, ${gradB})`, fontSize: 26, ...style }}
      >
        {emoji}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={className}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  )
}
