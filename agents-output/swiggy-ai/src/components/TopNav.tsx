'use client'
import { useState } from 'react'
import { MapPin, Search, ShoppingCart, ChevronDown } from 'lucide-react'

export default function TopNav() {
  const [vegMode, setVegMode] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-2xl font-black text-orange-500">swiggy</span>
        </div>

        {/* Address */}
        <button className="flex items-center gap-1 text-sm font-semibold text-gray-800 border-b-2 border-orange-500 pb-0.5 hover:text-orange-500 transition-colors">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>Koramangala, Bangalore</span>
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </button>

        {/* Vertical tabs */}
        <nav className="hidden md:flex items-center gap-6 ml-4">
          {['Food', 'Instamart', 'Dineout'].map((tab, i) => (
            <button
              key={tab}
              className={`text-sm font-semibold pb-0.5 transition-colors ${
                i === 0
                  ? 'text-orange-500 border-b-2 border-orange-500'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search */}
        <button className="hidden md:flex items-center gap-2 text-sm text-gray-500 bg-gray-100 rounded-lg px-3 py-2 hover:bg-gray-200 transition-colors">
          <Search className="w-4 h-4" />
          <span>Search for restaurants and food</span>
        </button>

        {/* Veg toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-600 hidden sm:block">Veg</span>
          <button
            onClick={() => setVegMode(v => !v)}
            className={`relative w-10 h-5 rounded-full transition-colors ${vegMode ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${vegMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Cart */}
        <button className="relative p-2 hover:bg-orange-50 rounded-full transition-colors">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
        </button>
      </div>
    </header>
  )
}
