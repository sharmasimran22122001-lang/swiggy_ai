import { Sparkles } from 'lucide-react'
import RestaurantCard from './RestaurantCard'
import type { HomepageBlock, PersonaLabel } from '@/types'

interface Props {
  block: HomepageBlock
  label: PersonaLabel
}

const PERSONA_ACCENT: Record<PersonaLabel, { bg: string; text: string; badge: string }> = {
  '2A_loyalist': {
    bg: 'from-orange-500 to-amber-500',
    text: 'Your Favourite Place',
    badge: 'bg-orange-100 text-orange-700',
  },
  '2B_restaurant_loyal_explorer': {
    bg: 'from-purple-500 to-pink-500',
    text: 'Curated For Your Taste',
    badge: 'bg-purple-100 text-purple-700',
  },
  '2C_variety_seeker': {
    bg: 'from-blue-500 to-teal-500',
    text: 'Trending Around You',
    badge: 'bg-blue-100 text-blue-700',
  },
}

export default function HeroBlock({ block, label }: Props) {
  const accent = PERSONA_ACCENT[label]

  return (
    <section className="py-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`flex items-center gap-2 bg-gradient-to-r ${accent.bg} text-white px-3 py-1.5 rounded-full text-xs font-bold shadow`}>
            <Sparkles className="w-3.5 h-3.5" />
            AI Personalised
          </div>
          <h2 className="text-xl font-bold text-gray-900">{block.title}</h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {block.items.slice(0, 6).map((item, i) => (
            <RestaurantCard key={i} item={item} showReason />
          ))}
        </div>
      </div>
    </section>
  )
}
