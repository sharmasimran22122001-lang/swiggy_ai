'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Search, Mic, Bell, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'

interface Props {
  userName: string
  userArea?: string
  userCity?: string
  onLogout: () => void
  onCartClick?: () => void
}

const VERTICALS = [
  { label: 'Food',      icon: '🍔' },
  { label: 'Instamart', icon: '⚡' },
  { label: 'Dineout',   icon: '🍽️' },
  { label: 'Scenes',    icon: '🎭' },
]

export default function SwiggyTopNav({ userName, userArea, userCity, onLogout, onCartClick }: Props) {
  const [vegMode, setVegMode] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const { totalItems } = useCart()

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

      {/* Row 2: Light-gray track + one sliding glass pill */}
      <div
        style={{
          margin: '0 14px 11px',
          background: '#EAEAEC',
          borderRadius: 14,
          padding: '5px',
          overflow: 'visible',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.09)',
          position: 'relative',
        }}
      >
        {/* ── The pill is a single element that slides between tab slots ── */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            left: `calc(5px + ${activeIdx} * ((100% - 10px) / ${VERTICALS.length}))`,
            width: `calc((100% - 10px) / ${VERTICALS.length})`,
            borderRadius: 11,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.13), 0 1px 4px rgba(0,0,0,0.08)',
            transition: 'left 0.38s cubic-bezier(0.3, 1.25, 0.4, 1)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div className="flex items-center w-full">
          {VERTICALS.map(({ label, icon }, i) => {
            const isActive = i === activeIdx
            return (
              <motion.button
                key={label}
                onClick={() => setActiveIdx(i)}
                whileTap={{ scale: 0.96 }}
                className="relative flex-1 flex flex-col items-center justify-center"
                style={{ paddingTop: 10, paddingBottom: 10, minWidth: 0, zIndex: 1 }}
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
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Row 3: Search + VEG — below the tab strip */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5 min-w-0">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400 truncate flex-1">Search for restaurants and food</span>
          <Mic className="w-4 h-4 shrink-0" style={{ color: '#FC8019' }} />
        </div>
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
