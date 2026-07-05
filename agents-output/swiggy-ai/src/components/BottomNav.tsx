'use client'
import { Home, Search, ShoppingCart, Clock, User } from 'lucide-react'

const TABS = [
  { icon: Home, label: 'Home', active: true },
  { icon: Search, label: 'Search', active: false },
  { icon: ShoppingCart, label: 'Cart', active: false },
  { icon: Clock, label: 'Reorder', active: false },
  { icon: User, label: 'Account', active: false },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex">
        {TABS.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-colors ${
              active ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-orange-500' : 'text-gray-400'}`} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}
