'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MoodType } from '@/types'
import FoodImg from './FoodImg'

interface BannerData {
  mood: MoodType
  theme: string
  title: string
  items: { name: string; restaurant: string; reason: string; veg?: boolean; price?: number; rating?: number; delivery_min?: number }[]
}

interface Props {
  banner: BannerData
  onMoodSelect?: (mood: MoodType) => void
  onExplore?: (theme: string, context: string) => void
}

interface SlideConfig {
  eyebrow: string
  title: string
  subtitle: string
  emoji: string
  gradA: string
  gradB: string
  accentColor: string
  badgeBg: string
  badgeText: string
}

function getMoodSlide(mood: MoodType, theme: string, title: string): SlideConfig {
  const t = theme.toLowerCase()
  if (t.includes('monsoon') || t.includes('rain'))
    return { eyebrow: '🌧 Monsoon Picks', title: title || 'Hot food for rainy days', subtitle: 'Comfort served to your door', emoji: '🍜', gradA: '#0d4f38', gradB: '#1a7a56', accentColor: '#4ade80', badgeBg: 'rgba(74,222,128,0.18)', badgeText: '#4ade80' }
  if (t.includes('winter'))
    return { eyebrow: '❄️ Winter Warmers', title: title || 'Warm & cosy meals', subtitle: 'Hot bowls on cold nights', emoji: '🫕', gradA: '#1e1b4b', gradB: '#3730a3', accentColor: '#818cf8', badgeBg: 'rgba(129,140,248,0.18)', badgeText: '#818cf8' }
  if (t.includes('summer'))
    return { eyebrow: '☀️ Summer Specials', title: title || 'Beat the heat today', subtitle: 'Chilled treats delivered fast', emoji: '🍦', gradA: '#7c2d12', gradB: '#c2410c', accentColor: '#fb923c', badgeBg: 'rgba(251,146,60,0.18)', badgeText: '#fb923c' }
  if (t.includes('festive') || t.includes('celebrat'))
    return { eyebrow: '🎉 Festive Feast', title: title || 'Celebrate with great food', subtitle: 'Make every moment special', emoji: '🎂', gradA: '#3b0764', gradB: '#7c3aed', accentColor: '#c084fc', badgeBg: 'rgba(192,132,252,0.18)', badgeText: '#c084fc' }
  if (t.includes('night') || t.includes('late'))
    return { eyebrow: '🌙 Late Night', title: title || 'Midnight munchies sorted', subtitle: 'Open and delivering now', emoji: '🍕', gradA: '#0f0f0f', gradB: '#1c1917', accentColor: '#fbbf24', badgeBg: 'rgba(251,191,36,0.18)', badgeText: '#fbbf24' }
  if (mood === 'spicy')
    return { eyebrow: '🌶 Craving Heat?', title: title || 'Turn up the heat tonight', subtitle: 'Fiery dishes that hit different', emoji: '🍛', gradA: '#7f1d1d', gradB: '#b91c1c', accentColor: '#f87171', badgeBg: 'rgba(248,113,113,0.18)', badgeText: '#f87171' }
  if (mood === 'cold_sweet')
    return { eyebrow: '🍦 Cool & Sweet', title: title || 'Chill out with cold treats', subtitle: 'Desserts & cold drinks', emoji: '🍨', gradA: '#0c4a6e', gradB: '#0369a1', accentColor: '#38bdf8', badgeBg: 'rgba(56,189,248,0.18)', badgeText: '#38bdf8' }
  return { eyebrow: '🫕 Comfort Food', title: title || 'Comfort meals, delivered fast', subtitle: 'Your favourites, right here', emoji: '🍲', gradA: '#14532d', gradB: '#166534', accentColor: '#4ade80', badgeBg: 'rgba(74,222,128,0.18)', badgeText: '#4ade80' }
}

const STATIC_SLIDES: SlideConfig[] = [
  {
    eyebrow: '💸 No Fee Days',
    title: 'Zero delivery fee today',
    subtitle: 'Save on every order placed now',
    emoji: '🥗',
    gradA: '#1c1917', gradB: '#292524',
    accentColor: '#fbbf24', badgeBg: 'rgba(251,191,36,0.18)', badgeText: '#fbbf24',
  },
  {
    eyebrow: '🎉 Weekend Special',
    title: 'Up to 60% off top picks',
    subtitle: 'Handpicked deals, only this weekend',
    emoji: '🍔',
    gradA: '#1e1b4b', gradB: '#4c1d95',
    accentColor: '#a78bfa', badgeBg: 'rgba(167,139,250,0.18)', badgeText: '#a78bfa',
  },
  {
    eyebrow: '⚡ Express Delivery',
    title: 'Under 25 min guaranteed',
    subtitle: 'Fastest kitchens near you',
    emoji: '🛵',
    gradA: '#052e16', gradB: '#166534',
    accentColor: '#86efac', badgeBg: 'rgba(134,239,172,0.18)', badgeText: '#86efac',
  },
]

const AUTO_ADVANCE_MS = 4400

export default function PromoBanner({ banner, onExplore }: Props) {
  const [current, setCurrent] = useState(0)
  const [progress, setProgress] = useState(0)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const dynamicSlide = getMoodSlide(banner.mood, banner.theme, banner.title)
  const slides: SlideConfig[] = [dynamicSlide, ...STATIC_SLIDES]
  const total = slides.length

  function startProgress() {
    setProgress(0)
    if (progressRef.current) clearInterval(progressRef.current)
    const step = 100 / (AUTO_ADVANCE_MS / 40)
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setCurrent(c => (c + 1) % total)
          return 0
        }
        return p + step
      })
    }, 40)
  }

  useEffect(() => {
    startProgress()
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, total])

  function goTo(i: number) {
    setCurrent(i)
    setProgress(0)
  }

  const slide = slides[current]

  return (
    <div style={{ padding: '10px 14px 8px' }}>
      {/* ── Main card ── */}
      <div
        style={{
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex',
              height: 172,
              background: `linear-gradient(135deg, ${slide.gradA} 0%, ${slide.gradB} 100%)`,
            }}
          >
            {/* ── Left: text content ── */}
            <div
              style={{
                flex: 1,
                padding: '18px 0 18px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {/* Eyebrow badge */}
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: slide.badgeBg,
                  border: `1px solid ${slide.accentColor}44`,
                  borderRadius: 20,
                  padding: '3px 10px',
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 700, color: slide.accentColor, letterSpacing: '0.03em' }}>
                  {slide.eyebrow}
                </span>
              </div>

              {/* Title */}
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: 16, fontWeight: 800, color: '#fff',
                  lineHeight: 1.25, letterSpacing: '-0.02em',
                  marginBottom: 5,
                  textShadow: '0 1px 8px rgba(0,0,0,0.3)',
                }}>
                  {slide.title}
                </h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 500, lineHeight: 1.4 }}>
                  {slide.subtitle}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => onExplore?.(slide.eyebrow, slide.title)}
                style={{
                  alignSelf: 'flex-start',
                  background: slide.accentColor,
                  color: '#111',
                  fontSize: 11, fontWeight: 800,
                  padding: '7px 14px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  boxShadow: `0 4px 14px ${slide.accentColor}55`,
                }}
              >
                Explore →
              </button>
            </div>

            {/* ── Right: food plate visual ── */}
            <div
              style={{
                width: 140,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {/* Glow behind plate */}
              <div style={{
                position: 'absolute',
                width: 110, height: 110,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${slide.accentColor}35 0%, transparent 70%)`,
                pointerEvents: 'none',
              }} />
              {/* Large decorative circle top-right */}
              <div style={{
                position: 'absolute',
                width: 90, height: 90,
                borderRadius: '50%',
                border: `1.5px solid rgba(255,255,255,0.1)`,
                top: -20, right: -20,
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                width: 50, height: 50,
                borderRadius: '50%',
                border: `1px solid rgba(255,255,255,0.07)`,
                bottom: 10, left: 10,
                pointerEvents: 'none',
              }} />

              <div
                className="rounded-full overflow-hidden"
                style={{ width: 104, height: 104, border: '2.5px solid rgba(255,255,255,0.35)', boxShadow: '0 8px 24px rgba(0,0,0,0.35)' }}
              >
                <FoodImg name={slide.title} extra={slide.eyebrow} emoji={slide.emoji} gradA={slide.gradA} gradB={slide.gradB} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* ── Progress bar ── */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.12)', position: 'relative' }}>
          <motion.div
            style={{
              height: '100%',
              background: slide.accentColor,
              width: `${progress}%`,
              boxShadow: `0 0 6px ${slide.accentColor}`,
            }}
          />
        </div>
      </div>

      {/* ── Dot indicators ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingTop: 8 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 16 : 5,
              height: 5,
              borderRadius: 9999,
              background: i === current ? '#FC8019' : '#d1d5db',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  )
}
