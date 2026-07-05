'use client'

// Wireframe exact: horizontal chip strip with 26px icon + text label
const ITEMS = [
  { label: 'New on Swiggy', emoji: '✨' },
  { label: 'Large Orders',  emoji: '🎉' },
  { label: 'Food on Train', emoji: '🚂' },
  { label: 'Chain Offers',  emoji: '🏷️' },
  { label: 'Instamart',     emoji: '🛒' },
  { label: 'Dineout',       emoji: '🍽️' },
]

export default function MoreOnSwiggy() {
  return (
    <div style={{ paddingTop: 2 }}>
      <div
        style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '14px 15px 7px' }}
      >
        <h2 style={{ fontSize: 13, fontWeight: 700, color: '#3d4152' }}>More on Swiggy</h2>
      </div>

      {/* Chip strip — wireframe exact */}
      <div
        className="flex gap-2 overflow-x-auto"
        style={{ padding: '0 15px 12px', scrollbarWidth: 'none' }}
      >
        {ITEMS.map(item => (
          <button
            key={item.label}
            className="flex-shrink-0 flex items-center gap-[7px] cursor-pointer whitespace-nowrap rounded-[11px]"
            style={{
              padding: '7px 11px',
              border: '1.5px solid #e0e0e0',
              background: '#fff',
            }}
          >
            {/* 26px icon box — wireframe exact */}
            <div
              className="rounded-[6px] flex items-center justify-center flex-shrink-0"
              style={{
                width: 26,
                height: 26,
                border: '1px solid #e0e0e0',
                background: '#f8f8f8',
                fontSize: 14,
              }}
            >
              {item.emoji}
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3d4152' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
