'use client'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import type { HomepageItem } from '@/types'

// Deterministic color from restaurant name so same restaurant always gets same color
function colorFromName(name: string) {
  const PALETTES = [
    { from: '#FF6B35', to: '#F7931E' },   // orange
    { from: '#1a1a2e', to: '#16213e' },   // dark navy
    { from: '#0f4c35', to: '#1a7a50' },   // green
    { from: '#4a0e8f', to: '#7b2cbf' },   // purple
    { from: '#c0392b', to: '#e74c3c' },   // red
    { from: '#2c3e50', to: '#3498db' },   // blue
    { from: '#d35400', to: '#e67e22' },   // dark orange
    { from: '#1abc9c', to: '#16a085' },   // teal
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTES[Math.abs(hash) % PALETTES.length]
}

const FOOD_EMOJIS = ['🍛', '🍕', '🥘', '🍔', '🥗', '🍜', '🫕', '🍱', '🥟', '🌮']
function emojiFromName(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return FOOD_EMOJIS[Math.abs(hash) % FOOD_EMOJIS.length]
}

interface Props {
  item: HomepageItem
  index?: number
  discount?: string
  showReason?: boolean
}

export default function SwiggyRestaurantCard({ item, index = 0, discount, showReason = false }: Props) {
  const name = item.restaurant || item.name
  const colors = colorFromName(name)
  const emoji = emojiFromName(name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
    >
      {/* Food image area */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
      >
        {/* Large food emoji centred */}
        <span className="text-[80px] opacity-90 select-none">{emoji}</span>

        {/* Discount badge — bottom left */}
        {discount && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent pt-6 pb-2 px-3">
            <span className="text-white text-xs font-black">{discount}</span>
          </div>
        )}

        {/* Delivery time — bottom right */}
        {item.delivery_min && (
          <div className="absolute bottom-2 right-2 bg-white rounded-lg px-2 py-1 shadow">
            <span className="text-[11px] font-black text-gray-800">{item.delivery_min}–{item.delivery_min + 5} MINS</span>
          </div>
        )}

        {/* Wishlist */}
        <button className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
          <Heart className="w-4 h-4 text-gray-500" />
        </button>

        {/* Veg / Non-veg dot */}
        {item.veg !== undefined && (
          <div className="absolute top-2 left-2">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${item.veg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${item.veg ? 'bg-green-600' : 'bg-red-600'}`} />
            </div>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="px-3 pt-2.5 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-[15px] leading-tight flex-1">{name}</h3>
          {item.price && (
            <span className="text-sm font-bold text-gray-700 shrink-0">₹{item.price * 2}</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {item.rating !== undefined && (
            <div className="flex items-center gap-0.5 bg-green-600 text-white text-[11px] font-bold px-1.5 py-0.5 rounded">
              <span>★</span>
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
          {item.delivery_min && (
            <>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-gray-500 text-xs">{item.delivery_min}–{item.delivery_min + 5} mins</span>
            </>
          )}
        </div>

        {item.name && item.name !== name && (
          <p className="text-gray-500 text-xs mt-0.5 truncate">{item.name}</p>
        )}

        {showReason && item.reason && (
          <p className="text-[#FC8019] text-[11px] mt-1.5 font-medium leading-snug">{item.reason}</p>
        )}
      </div>
    </motion.div>
  )
}
