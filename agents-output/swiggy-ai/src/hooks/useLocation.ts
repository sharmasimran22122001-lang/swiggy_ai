'use client'
import { useState, useEffect } from 'react'

export type LocationStatus = 'idle' | 'detecting' | 'detected' | 'denied' | 'error'

export interface LocationState {
  city: string | null
  area: string | null
  status: LocationStatus
}

export function useLocation(fallbackCity?: string): LocationState {
  const [state, setState] = useState<LocationState>({
    city: fallbackCity ?? null,
    area: null,
    status: 'idle',
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setState(s => ({ ...s, city: fallbackCity ?? s.city, status: 'error' }))
      return
    }

    setState(s => ({ ...s, status: 'detecting' }))

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `/api/location?lat=${coords.latitude}&lng=${coords.longitude}`
          )
          const data = await res.json()
          setState({
            city: data.city ?? fallbackCity ?? null,
            area: data.area ?? null,
            status: 'detected',
          })
        } catch {
          setState(s => ({ ...s, city: fallbackCity ?? s.city, status: 'error' }))
        }
      },
      () => {
        // User denied or timed out — fall back silently, don't block the UI
        setState(s => ({ ...s, city: fallbackCity ?? s.city, status: 'denied' }))
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 }
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return state
}
