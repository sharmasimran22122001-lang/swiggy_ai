import RestaurantCard from './RestaurantCard'
import type { HomepageBlock } from '@/types'

interface Props {
  block: HomepageBlock
}

export default function SlotTopRated({ block }: Props) {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{block.title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.items.slice(0, 4).map((item, i) => (
            <RestaurantCard key={i} item={item} variant="compact" showReason />
          ))}
        </div>
      </div>
    </section>
  )
}
