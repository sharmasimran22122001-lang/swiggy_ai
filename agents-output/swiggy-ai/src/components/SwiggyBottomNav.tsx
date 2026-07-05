'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Home, Zap, ShoppingBag, Leaf, RotateCcw } from 'lucide-react'

const TABS = [
  { id: 'food', icon: Home, label: 'Food', badge: null },
  { id: 'bolt', icon: Zap, label: 'Bolt', badge: '15 MIN' },
  { id: '99store', icon: ShoppingBag, label: '99 store', badge: null },
  { id: 'eatright', icon: Leaf, label: 'EatRight', badge: 'NEW' },
  { id: 'reorder', icon: RotateCcw, label: 'Reorder', badge: null },
]

export default function SwiggyBottomNav() {
  const [active, setActive] = useState('food')

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex w-full">
        {TABS.map(({ id, icon: Icon, label, badge }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className="flex-1 flex flex-col items-center justify-center pt-2 pb-3 relative min-w-0"
          >
            {active === id && (
              <motion.div
                layoutId="bottomNav"
                className="absolute top-0 left-2 right-2 h-0.5 bg-[#FC8019] rounded-full"
              />
            )}
            <div className="relative">
              <Icon className={`w-5 h-5 ${active === id ? 'text-[#FC8019]' : 'text-gray-400'}`} />
              {badge && (
                <span className={`absolute -top-2.5 -right-4 text-white text-[8px] font-black px-1 py-0.5 rounded leading-none whitespace-nowrap ${badge === 'NEW' ? 'bg-green-500' : 'bg-[#FC8019]'}`}>
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-semibold mt-1 ${active === id ? 'text-[#FC8019]' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
