// City name normalisation — Nominatim returns local-language names that may
// differ from what's stored in our restaurants table.
const CITY_ALIASES: Record<string, string> = {
  bengaluru: 'Bangalore',
  'bengaluru urban': 'Bangalore',
  bangalore: 'Bangalore',
  mumbai: 'Mumbai',
  bombay: 'Mumbai',
  delhi: 'Delhi',
  'new delhi': 'Delhi',
  hyderabad: 'Hyderabad',
  chennai: 'Chennai',
  madras: 'Chennai',
  pune: 'Pune',
  kolkata: 'Kolkata',
  calcutta: 'Kolkata',
  ahmedabad: 'Ahmedabad',
  jaipur: 'Jaipur',
  surat: 'Surat',
  lucknow: 'Lucknow',
  kanpur: 'Kanpur',
  nagpur: 'Nagpur',
  indore: 'Indore',
  bhopal: 'Bhopal',
  coimbatore: 'Coimbatore',
  kochi: 'Kochi',
  cochin: 'Kochi',
  visakhapatnam: 'Visakhapatnam',
  vizag: 'Visakhapatnam',
  patna: 'Patna',
  vadodara: 'Vadodara',
  ghaziabad: 'Ghaziabad',
  ludhiana: 'Ludhiana',
  agra: 'Agra',
  nashik: 'Nashik',
  faridabad: 'Faridabad',
  meerut: 'Meerut',
  rajkot: 'Rajkot',
  kalyan: 'Kalyan',
  vasai: 'Vasai',
  varanasi: 'Varanasi',
  srinagar: 'Srinagar',
  aurangabad: 'Aurangabad',
  dhanbad: 'Dhanbad',
  amritsar: 'Amritsar',
  ranchi: 'Ranchi',
  guwahati: 'Guwahati',
  chandigarh: 'Chandigarh',
  mysuru: 'Mysore',
  mysore: 'Mysore',
  tiruchirappalli: 'Tiruchirappalli',
  trichy: 'Tiruchirappalli',
  bhubaneswar: 'Bhubaneswar',
  thiruvananthapuram: 'Thiruvananthapuram',
  trivandrum: 'Thiruvananthapuram',
}

function normaliseCity(raw: string): string {
  const key = raw.toLowerCase().trim()
  return CITY_ALIASES[key] ?? raw
}

export interface GeoLocation {
  city: string
  area: string | null
  raw: string
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=13`

  const res = await fetch(url, {
    headers: {
      // Nominatim requires a User-Agent identifying your app
      'User-Agent': 'SwiggyAI-Demo/1.0 (demo@swiggy-ai.dev)',
    },
    // 6-second server-side timeout
    signal: AbortSignal.timeout(6000),
  })

  if (!res.ok) throw new Error(`Nominatim error: ${res.status}`)

  const json = await res.json()
  const addr = json.address ?? {}

  const rawCity =
    addr.city ?? addr.town ?? addr.village ?? addr.county ?? addr.state_district ?? ''
  const rawArea = addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.road ?? null

  return {
    city: normaliseCity(rawCity),
    area: rawArea,
    raw: json.display_name ?? '',
  }
}
