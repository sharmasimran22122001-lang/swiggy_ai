import RestaurantCard from './RestaurantCard'
import type { HomepageBlock } from '@/types'

interface Props {
  block: HomepageBlock
}

export default function DiscoveryBlock({ block }: Props) {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{block.title}</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {block.items.slice(0, 6).map((item, i) => (
            <div key={i} className="shrink-0 w-56">
              <RestaurantCard item={item} showReason />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
