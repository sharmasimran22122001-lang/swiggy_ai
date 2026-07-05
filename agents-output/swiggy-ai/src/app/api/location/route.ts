import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocode } from '@/lib/location'

// GET /api/location?lat=12.97&lng=77.59
// Proxies to Nominatim so the client never hits an external API directly.
export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '')
  const lng = parseFloat(req.nextUrl.searchParams.get('lng') ?? '')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  // Basic bounds check — India roughly spans 8–37°N, 68–97°E
  if (lat < 6 || lat > 38 || lng < 67 || lng > 98) {
    return NextResponse.json({ error: 'Coordinates outside India' }, { status: 400 })
  }

  try {
    const location = await reverseGeocode(lat, lng)
    return NextResponse.json(location)
  } catch (err: any) {
    console.error('[location]', err)
    return NextResponse.json({ error: 'Geocoding failed', detail: err.message }, { status: 502 })
  }
}
