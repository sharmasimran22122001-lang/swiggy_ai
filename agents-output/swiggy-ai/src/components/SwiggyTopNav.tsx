'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Mic, Bell, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  userName: string
  userArea?: string
  userCity?: string
  onLogout: () => void
  onCartClick?: () => void
  onSearchClick?: () => void
}

const VERTICALS = [
  { label: 'Food',      icon: '🍔', title: '', sub: '' },
  { label: 'Instamart', icon: '⚡', title: 'Instamart is still being cooked 🧑‍🍳', sub: "We're stocking these shelves as we speak. Meanwhile, the food's hot →" },
  { label: 'Dineout',   icon: '🍽️', title: 'Dineout is setting the table 🕯️', sub: "We're reserving you the best seats in town. Until then, dinner delivers →" },
  { label: 'Scenes',    icon: '🎭', title: 'Scenes is behind the curtain ✨', sub: "The show is still in rehearsal. Tonight's menu, however, is live →" },
]

export default function SwiggyTopNav({ userName, userArea, userCity, onLogout, onCartClick, onSearchClick }: Props) {
  const [vegMode, setVegMode] = useState(false)
  const [vegFx, setVegFx] = useState(0)          // increments on each veg-ON to retrigger the celebration
  const [activeIdx, setActiveIdx] = useState(0)
  // While dragging: fractional slot position the pill follows; null when idle
  const [dragPos, setDragPos] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const { totalItems } = useCart()

  const N = VERTICALS.length

  // ── Under-construction sheet for unbuilt verticals (feedback #8) ──────────
  const [blocked, setBlocked] = useState<{ label: string; icon: string; title: string; sub: string } | null>(null)
  const [countdown, setCountdown] = useState(5)
  const returnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  function clearVerticalTimers() {
    if (returnTimer.current) clearTimeout(returnTimer.current)
    if (tickTimer.current) clearInterval(tickTimer.current)
  }

  function backToFood() {
    clearVerticalTimers()
    setBlocked(null)
    setActiveIdx(0)
  }

  function engageVertical(i: number) {
    setActiveIdx(i)
    if (i === 0) { clearVerticalTimers(); setBlocked(null); return }
    const v = VERTICALS[i]
    clearVerticalTimers()
    setBlocked({ label: v.label, icon: v.icon, title: v.title, sub: v.sub })
    setCountdown(5)
    tickTimer.current = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000)
    returnTimer.current = setTimeout(backToFood, 5000)
  }

  useEffect(() => clearVerticalTimers, [])

  // Pointer x → fractional slot index (0 … N-1), pill centred under the pointer
  function slotFromPointer(clientX: number): number {
    const el = trackRef.current
    if (!el) return activeIdx
    const rect = el.getBoundingClientRect()
    const inner = rect.width - 10 // minus 5px padding each side
    const frac = (clientX - rect.left - 5) / inner
    return Math.min(N - 1, Math.max(0, frac * N - 0.5))
  }

  function onTrackPointerDown(e: React.PointerEvent) {
    dragging.current = true
    trackRef.current?.setPointerCapture(e.pointerId)
    // Don't move the pill yet — a plain tap should glide smoothly on release
  }
  function onTrackPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return
    setDragPos(slotFromPointer(e.clientX)) // pill follows the finger
  }
  function onTrackPointerUp(e: React.PointerEvent) {
    if (!dragging.current) return
    dragging.current = false
    engageVertical(Math.round(slotFromPointer(e.clientX)))
    setDragPos(null)
  }

  return (
    <div className="bg-white sticky top-0 z-50 shadow-sm w-full">
      {/* Row 1: Address + icons */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button className="flex items-start gap-1 flex-1 min-w-0">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Home</span>
              <ChevronDown className="w-3 h-3 text-gray-500" />
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">
              {userArea && userCity ? `${userArea}, ${userCity}` : userCity ?? 'Detecting location…'}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <Bell className="w-5 h-5 text-gray-600" />
          <button onClick={onCartClick} className="relative" aria-label="Open cart">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center rounded-full text-white font-bold"
                style={{ width: 15, height: 15, fontSize: 8, background: '#FC8019' }}
              >
                {totalItems > 9 ? '9+' : totalItems}
              </motion.span>
            )}
          </button>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold"
            style={{ color: '#FC8019' }}
          >
            {userName.charAt(0)}
          </button>
        </div>
      </div>

      {/* Row 2: Light-gray track + one glass pill — tap a tab OR drag the pill */}
      <div
        ref={trackRef}
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={onTrackPointerUp}
        style={{
          margin: '0 14px 11px',
          background: '#EAEAEC',
          borderRadius: 14,
          padding: '5px',
          overflow: 'visible',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.09)',
          position: 'relative',
          touchAction: 'none',   // horizontal drag works on touch without scrolling the page
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {/* ── The pill slides between slots on tap, and follows the finger on drag ── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            left: `calc(5px + ${dragPos ?? activeIdx} * ((100% - 10px) / ${N}))`,
            width: `calc((100% - 10px) / ${N})`,
            borderRadius: 11,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)',
            transition: dragPos !== null ? 'none' : 'left 0.38s cubic-bezier(0.3, 1.25, 0.4, 1)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div className="flex items-center w-full">
          {VERTICALS.map(({ label, icon }, i) => {
            const isActive = i === (dragPos !== null ? Math.round(dragPos) : activeIdx)
            return (
              <div
                key={label}
                className="relative flex-1 flex flex-col items-center justify-center"
                style={{ paddingTop: 10, paddingBottom: 10, minWidth: 0, zIndex: 1, pointerEvents: 'none' }}
              >
                <span
                  style={{
                    fontSize: 17,
                    lineHeight: 1,
                    marginBottom: 3,
                    opacity: isActive ? 1 : 0.42,
                    transition: 'opacity 0.25s',
                  }}
                >
                  {icon}
                </span>
                <span
                  className="font-semibold leading-none"
                  style={{
                    fontSize: 11,
                    letterSpacing: '0.005em',
                    color: isActive ? '#3d4152' : '#9ca3af',
                    transition: 'color 0.25s',
                  }}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Row 3: Search + VEG — below the tab strip */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <button
          onClick={onSearchClick}
          className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 min-w-0 text-left active:opacity-70"
          aria-label="Search for restaurants and food"
        >
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400 truncate flex-1">Search for restaurants and food</span>
          <Mic className="w-4 h-4 shrink-0" style={{ color: '#FC8019' }} />
        </button>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold text-gray-600">VEG</span>
          <span className="relative inline-block">
            <button
              onClick={() => setVegMode(v => {
                const next = !v
                if (next) setVegFx(x => x + 1)
                return next
              })}
              className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${vegMode ? 'bg-green-500' : 'bg-gray-300'}`}
              aria-label="Toggle veg-only mode"
            >
              <motion.span
                animate={{ x: vegMode ? 18 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow flex items-center justify-center"
                style={{ fontSize: 9, lineHeight: 1 }}
              >
                {vegMode ? '🌿' : ''}
              </motion.span>
            </button>
            {/* Subtle celebration on turning veg ON: one ripple + three leaves */}
            {vegMode && vegFx > 0 && (
              <span key={vegFx} aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <span className="veg-ripple" />
                <span className="leaf-burst" style={{ '--lx': '-16px', '--ly': '-20px', '--lr': '-50deg' } as React.CSSProperties}>🍃</span>
                <span className="leaf-burst" style={{ '--lx': '16px', '--ly': '-18px', '--lr': '50deg', animationDelay: '0.1s' } as React.CSSProperties}>🍃</span>
              </span>
            )}
          </span>
        </div>
      </div>

      {/* ── Under construction sheet — Instamart / Dineout / Scenes ── */}
      <AnimatePresence>
        {blocked && (
          <>
            <motion.div
              key="uc-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={backToFood}
              className="fixed inset-0"
              style={{ background: 'rgba(20,20,25,0.35)', zIndex: 90 }}
            />
            <motion.div
              key="uc-sheet"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 right-0 bottom-0"
              style={{ background: '#fff', borderRadius: '18px 18px 0 0', zIndex: 91, padding: '22px 20px 26px', textAlign: 'center', boxShadow: '0 -8px 30px rgba(0,0,0,0.18)' }}
            >
              <div style={{ width: 36, height: 4, borderRadius: 4, background: '#e0e0e0', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 38, lineHeight: 1 }}>{blocked.icon}</div>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#3d4152', marginTop: 10 }}>
                {blocked.title}
              </p>
              <p style={{ fontSize: 12.5, color: '#686b78', marginTop: 5 }}>
                {blocked.sub}
              </p>
              <div className="flex items-center justify-center" style={{ gap: 10, marginTop: 16 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#93959f', background: '#f4f4f4', borderRadius: 20, padding: '7px 13px' }}>
                  ⏳ Back to food in {countdown}s
                </span>
                <button
                  onClick={backToFood}
                  style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#FC8019', border: 'none', borderRadius: 20, padding: '8px 18px', cursor: 'pointer' }}
                >
                  Take me back →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
