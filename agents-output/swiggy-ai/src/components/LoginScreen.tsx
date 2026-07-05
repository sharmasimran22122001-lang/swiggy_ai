'use client'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const DEMO_USERS = [
  { id: 'u01', name: 'Meera Sharma',  avatar: '👩🏽', city: 'Bangalore', type: 'Loyalist',      typeColor: '#c2410c', typeBg: '#fff7ed' },
  { id: 'u02', name: 'Arjun Mehta',   avatar: '👨🏽', city: 'Bangalore', type: 'Explorer',      typeColor: '#1d4ed8', typeBg: '#eff6ff' },
  { id: 'u03', name: 'Neha Verma',    avatar: '👩🏻', city: 'Bangalore', type: 'Variety Seeker',typeColor: '#7c3aed', typeBg: '#f5f3ff' },
  { id: 'u05', name: 'Priya Nair',    avatar: '👩🏽', city: 'Mumbai',    type: 'Explorer',      typeColor: '#1d4ed8', typeBg: '#eff6ff' },
  { id: 'u06', name: 'Vikram Bose',   avatar: '👨🏻', city: 'Delhi',     type: 'Variety Seeker',typeColor: '#7c3aed', typeBg: '#f5f3ff' },
  { id: 'u07', name: 'Kavitha Rajan', avatar: '👩🏾', city: 'Chennai',   type: 'Loyalist',      typeColor: '#c2410c', typeBg: '#fff7ed' },
  { id: 'u08', name: 'Sanjay Reddy',  avatar: '👨🏽', city: 'Hyderabad', type: 'Explorer',      typeColor: '#1d4ed8', typeBg: '#eff6ff' },
  { id: 'u09', name: 'Ananya Das',    avatar: '👩🏻', city: 'Kolkata',   type: 'Variety Seeker',typeColor: '#7c3aed', typeBg: '#f5f3ff' },
]

interface Props {
  onLogin: (userId: string, userName: string) => void
}

export default function LoginScreen({ onLogin }: Props) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#f8f8f8' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 20px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#FC8019', letterSpacing: '-0.03em', marginBottom: 4 }}>swiggy</div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#3d4152' }}>Choose a demo profile to explore</p>
        <p style={{ fontSize: 11, color: '#93959f', marginTop: 2 }}>Each profile shows personalised recommendations</p>
      </div>

      {/* Profile list */}
      <div style={{ flex: 1, padding: '12px 16px 32px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {DEMO_USERS.map((user, i) => (
          <motion.button
            key={user.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.055 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLogin(user.id, user.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 14px',
              background: '#fff',
              border: '1.5px solid #ebebeb',
              borderRadius: 16,
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: '#f4f4f4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}>
              {user.avatar}
            </div>

            {/* Name + city + type */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#3d4152' }}>{user.name}</p>
              <p style={{ fontSize: 11, color: '#93959f', marginTop: 2 }}>{user.city}</p>
            </div>

            {/* Type pill */}
            <span style={{
              fontSize: 10, fontWeight: 700,
              color: user.typeColor, background: user.typeBg,
              padding: '4px 10px', borderRadius: 20,
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {user.type}
            </span>

            <ChevronRight style={{ width: 16, height: 16, color: '#d1d5db', flexShrink: 0 }} />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
