'use client'

interface UserOption {
  id: string
  name: string
  city: string
  label?: string
}

const USERS: UserOption[] = [
  { id: 'u01', name: 'Meera', city: 'Bangalore', label: '2A · Loyalist' },
  { id: 'u02', name: 'Arjun', city: 'Bangalore', label: '2B · Explorer' },
  { id: 'u03', name: 'Neha', city: 'Bangalore', label: '2C · Variety-seeker' },
  { id: 'u04', name: 'Rahul', city: 'Bangalore', label: 'Blend (2A+2C)' },
]

interface Props {
  activeUserId: string
  onChange: (userId: string) => void
  loading: boolean
}

export default function UserSwitcher({ activeUserId, onChange, loading }: Props) {
  return (
    <div className="bg-orange-50 border-b border-orange-100 py-3">
      <div className="max-w-5xl mx-auto px-4">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-2">
          AI Demo — Switch User Persona
        </p>
        <div className="flex flex-wrap gap-2">
          {USERS.map(u => (
            <button
              key={u.id}
              onClick={() => onChange(u.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeUserId === u.id
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600'
              } disabled:opacity-50 disabled:cursor-wait`}
            >
              {u.name}
              <span className={`ml-2 text-xs font-normal ${activeUserId === u.id ? 'text-orange-100' : 'text-gray-400'}`}>
                {u.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
