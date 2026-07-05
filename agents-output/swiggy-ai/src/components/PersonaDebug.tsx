import type { UserProfile, TimeSlot } from '@/types'
import { Brain, Clock, TrendingUp } from 'lucide-react'

interface Props {
  profile: UserProfile
  slot: TimeSlot
  fromCache: boolean
}

const LABEL_LABELS: Record<string, string> = {
  '2A_loyalist': '2A · Loyalist',
  '2B_restaurant_loyal_explorer': '2B · Restaurant Explorer',
  '2C_variety_seeker': '2C · Variety Seeker',
}

export default function PersonaDebug({ profile, slot, fromCache }: Props) {
  const scores = profile.behavior_scores

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      <div className="bg-gray-900 text-green-400 rounded-2xl p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-3 border-b border-gray-700 pb-2">
          <Brain className="w-4 h-4 text-orange-400" />
          <span className="text-orange-400 font-bold">AI Engine — User Profile</span>
          {fromCache && <span className="ml-auto text-gray-500 text-[10px]">● cached</span>}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <p className="text-gray-500 text-[10px] uppercase">User</p>
            <p className="text-white font-bold">{profile.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase">Persona</p>
            <p className="text-green-400 font-bold">{LABEL_LABELS[profile.label]}</p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase">Slot</p>
            <p className="text-white font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />{slot.part}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-[10px] uppercase">Price Band</p>
            <p className="text-white font-bold">{profile.price_band} · ₹{profile.avg_order_value} avg</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-gray-500 text-[10px] uppercase mb-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> Behavior Scores
          </p>
          <div className="flex gap-6">
            {[
              { label: 'Repeat', val: scores.repeat },
              { label: 'Variety', val: scores.restaurant_loyal_variety },
              { label: 'Explore', val: scores.exploration },
            ].map(s => (
              <div key={s.label}>
                <p className="text-gray-400">{s.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-20 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-orange-400"
                      style={{ width: `${Math.round(s.val * 100)}%` }}
                    />
                  </div>
                  <span className="text-white">{(s.val * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-700 flex flex-wrap gap-4 text-[10px]">
          <span><span className="text-gray-500">Fav: </span><span className="text-white">{profile.favourite_restaurant}</span></span>
          <span><span className="text-gray-500">Usual: </span><span className="text-white">{profile.usual_dish}</span></span>
          <span><span className="text-gray-500">Top cuisines: </span><span className="text-white">{profile.top_cuisines.join(', ')}</span></span>
          <span><span className="text-gray-500">Diet: </span><span className="text-white">{profile.diet.inferred}</span></span>
          <span><span className="text-gray-500">Orders: </span><span className="text-white">{profile.total_orders} across {profile.distinct_restaurants} restaurants</span></span>
        </div>
      </div>
    </div>
  )
}
