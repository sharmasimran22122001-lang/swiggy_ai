import type { MoodType } from '@/types'
import type { HomepageItem } from '@/types'

interface Props {
  mood: MoodType
  title: string
  items: HomepageItem[]
}

const MOOD_CONFIG: Record<MoodType, { bg: string; emoji: string; tagline: string }> = {
  spicy: {
    bg: 'from-red-500 via-orange-500 to-amber-400',
    emoji: '🌶️',
    tagline: 'Bring the heat',
  },
  cold_sweet: {
    bg: 'from-blue-400 via-cyan-400 to-teal-300',
    emoji: '🍦',
    tagline: 'Cool down with something sweet',
  },
  comforting: {
    bg: 'from-amber-500 via-yellow-400 to-lime-400',
    emoji: '🫕',
    tagline: 'Warm, hearty, home-style',
  },
}

export default function MoodBanner({ mood, title, items }: Props) {
  const cfg = MOOD_CONFIG[mood]

  return (
    <section className={`py-8 bg-gradient-to-r ${cfg.bg} text-white my-4`}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-4xl">{cfg.emoji}</span>
          <div>
            <p className="text-white/80 text-sm font-medium">{cfg.tagline}</p>
            <h2 className="text-2xl font-extrabold">{title}</h2>
          </div>
        </div>

        <div className="mt-5 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, i) => (
            <div
              key={i}
              className="shrink-0 bg-white/20 backdrop-blur-sm rounded-2xl p-4 w-52 hover:bg-white/30 transition-colors cursor-pointer border border-white/20"
            >
              <div className="text-3xl mb-2">
                {mood === 'spicy' ? '🌶️' : mood === 'cold_sweet' ? '🍦' : '🫕'}
              </div>
              <p className="font-bold text-white text-sm leading-tight truncate">{item.name}</p>
              <p className="text-white/80 text-xs truncate mt-0.5">{item.restaurant}</p>
              <p className="text-white/70 text-[11px] mt-2 leading-snug">{item.reason}</p>
              {item.delivery_min && (
                <p className="text-white/90 text-xs font-semibold mt-2">⏱ {item.delivery_min} min</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
