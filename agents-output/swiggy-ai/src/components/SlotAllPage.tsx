'use client'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import FoodImg from './FoodImg'

// Full food-item list for a meal slot — opened by "View all" on the 2C hero.
// Tapping any item opens its category's restaurant list.

interface Props {
  title: string
  categories: string[]
  onBack: () => void
  onCategorySelect: (category: string) => void
}

export default function SlotAllPage({ title, categories, onBack, onCategorySelect }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.22 }}
      style={{ minHeight: '100dvh', background: '#fff' }}
    >
      {/* Header */}
      <div className="bg-white flex items-center gap-3 sticky top-0 z-20" style={{ padding: '13px 15px', borderBottom: '1px solid #ebebeb' }}>
        <button
          onClick={onBack}
          className="flex items-center justify-center flex-shrink-0"
          style={{ width: 30, height: 30, border: '1.5px solid #e0e0e0', borderRadius: 7 }}
          aria-label="Back"
        >
          <ArrowLeft size={16} color="#3d4152" />
        </button>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>{title}</p>
          <p style={{ fontSize: 11, color: '#93959f', marginTop: 1 }}>{categories.length} cravings to pick from</p>
        </div>
      </div>

      {/* Grid of food items */}
      <div className="grid grid-cols-3" style={{ gap: 12, padding: '16px 15px 40px' }}>
        {categories.map((cat, i) => (
          <motion.button
            key={cat}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.4) }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategorySelect(cat)}
            className="flex flex-col items-center"
            style={{ gap: 6 }}
          >
            <div className="rounded-[14px] overflow-hidden w-full relative" style={{ aspectRatio: '1' }}>
              <FoodImg name={cat} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.18), transparent 40%)' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 650, color: '#3d4152', textAlign: 'center' }}>{cat}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
