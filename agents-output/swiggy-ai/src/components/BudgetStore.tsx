import type { HomepageBlock } from '@/types'
import { Tag } from 'lucide-react'

interface Props {
  block: HomepageBlock
}

export default function BudgetStore({ block }: Props) {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-green-500 text-white rounded-full p-1">
            <Tag className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{block.title}</h2>
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">Budget Picks</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {block.items.slice(0, 4).map((item, i) => (
            <div key={i} className="bg-green-50 border border-green-100 rounded-2xl p-3 cursor-pointer hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
              <p className="text-gray-500 text-xs truncate">{item.restaurant}</p>
              {item.price && (
                <p className="mt-2 text-green-700 font-black text-lg">₹{item.price}</p>
              )}
              <p className="text-gray-500 text-[11px] mt-1 leading-snug">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
