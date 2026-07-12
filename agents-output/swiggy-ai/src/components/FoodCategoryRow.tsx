'use client'
import { motion } from 'framer-motion'
import FoodImg from './FoodImg'
import { useDragScroll } from '@/hooks/useDragScroll'

const EMOJI_MAP: Record<string, string> = {
  'Biryani': '🍛', 'North Indian': '🫓', 'South Indian': '🥘', 'Chinese': '🥡',
  'Pizza': '🍕', 'Burgers': '🍔', 'Desserts': '🍰', 'Beverages': '🧃',
  'Healthy': '🥗', 'Chai & Snacks': '☕', 'Hot Soup': '🍲', 'Pakoda': '🫓',
  'Samosa': '🥟', 'Noodles': '🍜', 'Maggi': '🍜', 'Momos': '🥟',
  'Rolls': '🌯', 'Sandwich': '🥪', 'Coffee': '☕', 'Tea': '🍵',
  'Ice Cream': '🍦', 'Cake': '🎂', 'Pasta': '🍝', 'Thali': '🍱',
  'Dosa': '🥞', 'Idli': '🍙', 'Salad': '🥗', 'Seafood': '🦐',
  'Chicken': '🍗', 'Snacks': '🍟', 'Mughlai': '🍖', 'Continental': '🥘',
  'Mexican': '🌮', 'Comfort Food': '🫕', 'Street Food': '🌯',
  'Fast Food': '🍟', 'Bakery': '🥐', 'Pav Bhaji': '🍛', 'Paratha': '🥙',
  'Kebabs': '🍢', 'Breakfast': '🍳',
}

function getEmoji(label: string): string {
  if (EMOJI_MAP[label]) return EMOJI_MAP[label]
  const key = Object.keys(EMOJI_MAP).find(k => label.toLowerCase().includes(k.toLowerCase()))
  return key ? EMOJI_MAP[key] : '🍽️'
}

interface Props {
  categories: string[]
  seasonTag?: string
  locationTag?: string
  onCategorySelect?: (category: string) => void
}

export default function FoodCategoryRow({ categories, onCategorySelect }: Props) {
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <div style={{ paddingTop: 2 }}>
      <div className="flex items-baseline justify-between px-[15px]" style={{ padding: '14px 15px 9px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>
          What&apos;s on your mind?
        </h2>
      </div>

      <div className="flex gap-[9px] overflow-x-auto pb-3" {...drag} style={{ padding: '0 15px 13px', scrollbarWidth: 'none', ...drag.style }}>
        {categories.slice(0, 7).map((label, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => onCategorySelect?.(label)}
            className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer"
            style={{ width: 58 }}
          >
            <div
              className="rounded-full overflow-hidden"
              style={{ width: 54, height: 54, border: '1.5px solid #e0e0e0' }}
            >
              <FoodImg name={label} emoji={getEmoji(label)} gradA="#8a6838" gradB="#6a5028" style={{ fontSize: 24 }} />
            </div>
            <span className="text-center leading-tight" style={{ fontSize: 10, fontWeight: 600, color: '#686b78' }}>
              {label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
