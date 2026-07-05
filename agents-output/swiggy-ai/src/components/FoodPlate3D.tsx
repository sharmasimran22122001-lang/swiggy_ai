'use client'
import { motion } from 'framer-motion'

interface Props {
  emoji: string
  gradA: string
  gradB: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  float?: boolean
  className?: string
}

// Size configs: [container px, plate px, emoji px, shadow blur]
const SIZES = {
  sm:  { container: 72,  plate: 50,  emoji: 26, blur: 16 },
  md:  { container: 94,  plate: 62,  emoji: 32, blur: 20 },
  lg:  { container: 120, plate: 80,  emoji: 42, blur: 28 },
  xl:  { container: 150, plate: 100, emoji: 54, blur: 36 },
}

export default function FoodPlate3D({ emoji, gradA, gradB, size = 'md', float = false, className = '' }: Props) {
  const s = SIZES[size]

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{
        width: s.container,
        height: s.container,
        background: `linear-gradient(145deg, ${gradA}, ${gradB})`,
        borderRadius: size === 'xl' ? 24 : size === 'lg' ? 18 : 12,
      }}
    >
      {/* Background shimmer blobs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.22) 0%, transparent 55%)',
      }} />
      <div style={{
        position: 'absolute', width: s.container * 0.6, height: s.container * 0.6,
        borderRadius: '50%', bottom: -s.container * 0.2, right: -s.container * 0.15,
        background: 'rgba(255,255,255,0.09)', pointerEvents: 'none',
      }} />

      {/* 3D plate */}
      <motion.div
        animate={float ? { y: [0, -4, 0] } : {}}
        transition={float ? { duration: 2.8, repeat: Infinity, ease: 'easeInOut' } : {}}
        style={{
          width: s.plate,
          height: s.plate,
          borderRadius: '50%',
          // Layered shadows for depth
          boxShadow: [
            `0 ${s.blur * 0.8}px ${s.blur * 1.8}px rgba(0,0,0,0.38)`,
            `0 ${s.blur * 0.3}px ${s.blur * 0.6}px rgba(0,0,0,0.22)`,
            `inset 0 2px 5px rgba(255,255,255,0.95)`,
            `inset 0 -3px 7px rgba(0,0,0,0.12)`,
          ].join(', '),
          // Frosted white plate
          background: 'radial-gradient(circle at 38% 32%, #ffffff 0%, #f5f5f5 50%, #ebebeb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          // Subtle 3D tilt
          transform: 'perspective(220px) rotateX(7deg) rotateY(-4deg)',
        }}
      >
        {/* Glossy highlight arc */}
        <div style={{
          position: 'absolute',
          top: '8%', left: '12%',
          width: '55%', height: '44%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 40% 40%, rgba(255,255,255,0.85) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Emoji */}
        <span style={{ fontSize: s.emoji, lineHeight: 1, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }}>
          {emoji}
        </span>
      </motion.div>
    </div>
  )
}
