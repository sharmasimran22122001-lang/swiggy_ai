import { motion } from 'framer-motion'
import type { MoodType, HomepageItem } from '@/types'

const MOOD_CONFIG: Record<MoodType, { bg: string; emoji: string; label: string; chipBg: string }> = {
  spicy: { bg: 'from-red-600 to-orange-500', emoji: '🌶️', label: 'Spicy Cravings', chipBg: 'bg-red-700/40' },
  cold_sweet: { bg: 'from-blue-500 to-cyan-400', emoji: '🍦', label: 'Cool & Sweet', chipBg: 'bg-blue-700/40' },
  comforting: { bg: 'from-amber-600 to-yellow-500', emoji: '🫕', label: 'Comfort Food', chipBg: 'bg-amber-700/40' },
}

interface Props {
  mood: MoodType
  title: string
  items: HomepageItem[]
}

export default function SwiggyMoodBanner({ mood, title, items }: Props) {
  const cfg = MOOD_CONFIG[mood]

  return (
    <div className={`mx-3 my-3 rounded-3xl bg-gradient-to-r ${cfg.bg} overflow-hidden`}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{cfg.emoji}</span>
          <div>
            <p className="text-white/80 text-[11px] font-semibold uppercase tracking-wide">{cfg.label}</p>
            <h3 className="text-white font-black text-base leading-tight">{title}</h3>
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto hide-scrollbar pb-1">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`shrink-0 ${cfg.chipBg} backdrop-blur rounded-2xl p-3 w-40 cursor-pointer active:scale-95 transition-transform`}
            >
              <p className="font-bold text-white text-sm leading-tight truncate">{item.restaurant || item.name}</p>
              <p className="text-white/70 text-xs truncate mt-0.5">{item.name}</p>
              <div className="flex items-center gap-2 mt-2">
                {item.rating && (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">★ {item.rating.toFixed(1)}</span>
                )}
                {item.delivery_min && (
                  <span className="text-white/70 text-[10px]">{item.delivery_min}m</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
