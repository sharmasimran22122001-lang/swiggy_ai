'use client'
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
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
  { label: 'Food',      icon: '🍔' },
  { label: 'Instamart', icon: '⚡' },
  { label: 'Dineout',   icon: '🍽️' },
  { label: 'Scenes',    icon: '🎭' },
]

export default function SwiggyTopNav({ userName, userArea, userCity, onLogout, onCartClick, onSearchClick }: Props) {
  const [vegMode, setVegMode] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  // While dragging: fractional slot position the pill follows; null when idle
  const [dragPos, setDragPos] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const { totalItems } = useCart()

  const N = VERTICALS.length

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
    setActiveIdx(Math.round(slotFromPointer(e.clientX)))
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
          <button
            onClick={() => setVegMode(v => !v)}
            className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${vegMode ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <motion.span
              animate={{ x: vegMode ? 18 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow block"
            />
          </button>
        </div>
      </div>
    </div>
  )
}
