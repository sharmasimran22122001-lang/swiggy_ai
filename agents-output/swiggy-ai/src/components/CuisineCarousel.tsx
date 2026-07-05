'use client'

const CUISINES = [
  { label: 'Biryani', emoji: '🍛', color: 'from-yellow-400 to-orange-400' },
  { label: 'Pizza', emoji: '🍕', color: 'from-red-400 to-pink-400' },
  { label: 'Chinese', emoji: '🥡', color: 'from-red-500 to-orange-400' },
  { label: 'North Indian', emoji: '🫓', color: 'from-orange-400 to-amber-400' },
  { label: 'South Indian', emoji: '🥘', color: 'from-green-400 to-teal-400' },
  { label: 'Desserts', emoji: '🍰', color: 'from-pink-400 to-rose-400' },
  { label: 'Healthy', emoji: '🥗', color: 'from-green-500 to-emerald-400' },
  { label: 'Fast Food', emoji: '🍔', color: 'from-yellow-500 to-orange-500' },
  { label: 'Beverages', emoji: '🧃', color: 'from-blue-400 to-cyan-400' },
  { label: 'Snacks', emoji: '🍿', color: 'from-yellow-400 to-lime-400' },
]

export default function CuisineCarousel() {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">What&apos;s on your mind?</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {CUISINES.map(c => (
            <button
              key={c.label}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl shadow-md group-hover:scale-110 transition-transform`}>
                {c.emoji}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-orange-500 transition-colors">
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
