import { Star, Clock, Leaf } from 'lucide-react'
import type { HomepageItem } from '@/types'

interface Props {
  item: HomepageItem
  showReason?: boolean
  variant?: 'default' | 'compact'
}

const CUISINE_COLORS: Record<string, string> = {
  Biryani: 'bg-yellow-100 text-yellow-800',
  Chinese: 'bg-red-100 text-red-800',
  Pizza: 'bg-red-100 text-red-800',
  'North Indian': 'bg-orange-100 text-orange-800',
  'South Indian': 'bg-green-100 text-green-800',
  Desserts: 'bg-pink-100 text-pink-800',
}

function ratingColor(r?: number) {
  if (!r) return 'bg-gray-500'
  if (r >= 4.0) return 'bg-green-600'
  if (r >= 3.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

export default function RestaurantCard({ item, showReason = true, variant = 'default' }: Props) {
  const isCompact = variant === 'compact'

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group ${isCompact ? 'flex gap-3 p-3' : ''}`}>
      {/* Image placeholder */}
      <div className={`bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center relative overflow-hidden ${isCompact ? 'w-20 h-20 rounded-xl shrink-0' : 'h-40 w-full'}`}>
        <span className="text-4xl">{isCompact ? '🍽️' : '🍛'}</span>
        {!isCompact && (
          <div className="absolute bottom-2 left-2">
            {item.veg !== undefined && (
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${item.veg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                <Leaf className="w-2.5 h-2.5" />
                {item.veg ? 'VEG' : 'NON-VEG'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`${isCompact ? 'flex-1 min-w-0' : 'p-3'}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className={`font-bold text-gray-900 truncate group-hover:text-orange-500 transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}>
              {item.name}
            </h3>
            <p className={`text-gray-500 truncate ${isCompact ? 'text-xs' : 'text-sm'}`}>
              {item.restaurant}
            </p>
          </div>
          {item.price && (
            <span className={`shrink-0 font-bold text-gray-900 ${isCompact ? 'text-sm' : 'text-base'}`}>
              ₹{item.price}
            </span>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-2">
          {item.rating !== undefined && (
            <span className={`flex items-center gap-1 text-white text-xs font-bold px-1.5 py-0.5 rounded ${ratingColor(item.rating)}`}>
              <Star className="w-2.5 h-2.5 fill-white" />
              {item.rating.toFixed(1)}
            </span>
          )}
          {item.delivery_min !== undefined && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {item.delivery_min} min
            </span>
          )}
        </div>

        {/* AI reason */}
        {showReason && item.reason && (
          <p className={`mt-2 text-gray-500 leading-snug ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
            <span className="text-orange-500 font-semibold">✦ </span>
            {item.reason}
          </p>
        )}
      </div>
    </div>
  )
}
