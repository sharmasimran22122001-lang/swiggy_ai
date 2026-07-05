'use client'
import { useState } from 'react'
import { getFoodImageUrl } from '@/lib/foodImages'
import { getRestaurantVisual } from './CategoryPage'

interface Props {
  dishName: string
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
  // fallback index — passed so gradient colour doesn't repeat
  fallbackIndex?: number
}

// Loads a real Unsplash food photo. On error or slow load, shows gradient+emoji fallback.
export default function FoodImage({ dishName, width = 400, height = 300, className = '', style, fallbackIndex = 0 }: Props) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const src = getFoodImageUrl(dishName, width, height)
  const vis = getRestaurantVisual(dishName, fallbackIndex)

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Gradient fallback always in background (visible during load or on error) */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(145deg, ${vis.gradA}, ${vis.gradB})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.min(width, height) * 0.35,
        }}
      >
        {vis.emoji}
      </div>

      {/* Real photo — fades in when loaded */}
      {!failed && (
        <img
          src={src}
          alt={dishName}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}
    </div>
  )
}
