'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, Zap } from 'lucide-react'

const QUICK_TABS = ['REORDER', 'FOOD IN 15 MINS']

const CHIPS = [
  { label: 'Filter',   icon: <SlidersHorizontal className="w-3 h-3" />, chevron: false },
  { label: 'Sort by',  icon: null,                                        chevron: true  },
  { label: '99 Store', icon: null,                                        chevron: false, highlight: true },
  { label: 'Bolt',     icon: <Zap className="w-3 h-3 fill-current" />,   chevron: false, highlight: true },
  { label: 'Veg only', icon: null,                                        chevron: false },
  { label: 'Ratings',  icon: null,                                        chevron: false },
]

export default function FilterTabs() {
  const [activeTab, setActiveTab] = useState('REORDER')

  return (
    <div className="bg-white border-b border-gray-100">
      {/* REORDER / FOOD IN 15 MINS toggle */}
      <div className="flex border-b border-gray-100">
        {QUICK_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[12px] font-bold tracking-wide relative transition-colors ${
              activeTab === tab ? 'text-[#FC8019]' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="qTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FC8019]" />
            )}
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto hide-scrollbar">
        {CHIPS.map(chip => (
          <button
            key={chip.label}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-semibold whitespace-nowrap transition-colors ${
              chip.highlight
                ? 'border-orange-200 text-[#FC8019] bg-orange-50'
                : 'border-gray-200 text-gray-700 bg-white'
            }`}
          >
            {chip.icon}
            {chip.label}
            {chip.chevron && <ChevronDown className="w-3 h-3" />}
          </button>
        ))}
      </div>
    </div>
  )
}
