'use client'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import type { HomepageBlock } from '@/types'

function colorFromName(name: string) {
  const PALETTES = [
    ['#FF6B35','#F7C59F'], ['#1a1a2e','#4a4a8a'], ['#0f4c35','#2a9d5c'],
    ['#4a0e8f','#9b59b6'], ['#c0392b','#e74c3c'], ['#2c3e50','#3498db'],
    ['#d35400','#f39c12'], ['#1abc9c','#16a085'],
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  const [from, to] = PALETTES[Math.abs(h) % PALETTES.length]
  return { from, to }
}

const FOOD_EMOJIS = ['🍛','🍕','🥘','🍔','🥗','🍜','🫕','🍱','🥟','🌮','🍣','🥙']
function emojiFromName(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return FOOD_EMOJIS[Math.abs(h) % FOOD_EMOJIS.length]
}

const FOMO_LABELS = [
  { text: '🔥 Selling fast',       pulse: true  },
  { text: '⚡ 200+ orders today',  pulse: false },
  { text: '🏆 #1 in your area',   pulse: false },
  { text: '⏰ Closes at 11 PM',   pulse: true  },
  { text: '👥 50 people ordering', pulse: false },
  { text: '🌟 All-time favourite', pulse: false },
]

const DISCOUNTS = ['₹125 OFF', '50% OFF', '₹80 OFF', 'FREE DELIVERY', 'BOGO']

interface Props {
  block: HomepageBlock
}

export default function TopRatedFOMO({ block }: Props) {
  return (
    <div className="bg-white py-5 border-b border-gray-100">
      {/* Header */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xl">🏆</span>
              <h2 className="text-base font-black text-gray-900">{block.title}</h2>
            </div>
            <p className="text-xs text-gray-500 ml-7">Don&apos;t miss out — others are ordering right now</p>
          </div>
          <button className="text-xs font-bold text-[#FC8019]">See all →</button>
        </div>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-1">
        {block.items.slice(0, 6).map((item, i) => {
          const name = item.restaurant || item.name
          const { from, to } = colorFromName(name)
          const emoji = emojiFromName(name)
          const fomo = FOMO_LABELS[i % FOMO_LABELS.length]
          const discount = DISCOUNTS[i % DISCOUNTS.length]

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="shrink-0 w-52 rounded-3xl overflow-hidden shadow-md border border-gray-100 active:scale-95 transition-transform cursor-pointer"
            >
              {/* Image area */}
              <div
                className="relative h-36 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <span className="text-6xl select-none">{emoji}</span>

                {/* Live / FOMO badge */}
                <div className={`absolute top-2 left-2 flex items-center gap-1 bg-white/95 rounded-full px-2 py-1 shadow-sm ${fomo.pulse ? 'animate-pulse' : ''}`}>
                  <span className="text-[9px] font-black text-gray-800 whitespace-nowrap">{fomo.text}</span>
                </div>

                {/* Discount */}
                <div className="absolute top-2 right-2 bg-[#FC8019] text-white text-[10px] font-black px-2 py-1 rounded-xl shadow">
                  {discount}
                </div>

                {/* Delivery time */}
                {item.delivery_min && (
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    {item.delivery_min}–{item.delivery_min + 5} min
                  </div>
                )}

                {/* Heart */}
                <button className="absolute bottom-2 left-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm">
                  <Heart className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>

              {/* Info */}
              <div className="bg-white px-3 pt-2 pb-3">
                <h3 className="font-bold text-gray-900 text-sm truncate">{name}</h3>

                <div className="flex items-center gap-1.5 mt-1">
                  {item.rating !== undefined && (
                    <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      ★ {item.rating.toFixed(1)}
                    </span>
                  )}
                  {item.delivery_min && (
                    <span className="text-gray-400 text-[11px]">• {item.delivery_min} mins</span>
                  )}
                </div>

                {/* Progress bar — creates FOMO */}
                <div className="mt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-gray-500">Popularity</span>
                    <span className="text-[10px] font-bold text-[#FC8019]">{75 + (i * 4) % 22}% match</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${75 + (i * 4) % 22}%` }}
                      transition={{ delay: i * 0.07 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      className="h-1.5 rounded-full bg-gradient-to-r from-[#FC8019] to-[#FFB347]"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
