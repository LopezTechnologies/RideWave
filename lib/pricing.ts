import type { Destination, VehicleType, BookingMode } from '@/types'

// ─── Private prices (whole vehicle, one-way) ──────────────────────────────────

export const PRIVATE_PRICES: Record<VehicleType, Record<Destination, number>> = {
  suv: {
    'puerto-la-libertad': 45,
    'el-tunco': 50,
    'el-sunzal': 50,
    'el-zonte': 55,
  },
  pickup: {
    'puerto-la-libertad': 50,
    'el-tunco': 55,
    'el-sunzal': 55,
    'el-zonte': 60,
  },
}

// ─── Shared prices (per person, one-way) ─────────────────────────────────────

export const SHARED_PRICES: Record<Destination, number> = {
  'puerto-la-libertad': 15,
  'el-tunco': 18,
  'el-sunzal': 18,
  'el-zonte': 20,
}

// ─── Round trip extras ────────────────────────────────────────────────────────

export const PRIVATE_ROUND_TRIP_EXTRA: Record<VehicleType, number> = {
  suv: 30,
  pickup: 35,
}

export const SHARED_ROUND_TRIP_EXTRA_PER_PERSON = 10

// ─── Passenger limits ─────────────────────────────────────────────────────────

export const MAX_PASSENGERS: Record<VehicleType, number> = {
  suv: 6,
  pickup: 4,
}

export const MAX_SOLO_PASSENGERS = 2
export const MIN_GROUP_PASSENGERS = 3

// ─── Main calculation ─────────────────────────────────────────────────────────

export function calculateShuttlePrice({
  destination,
  bookingMode,
  vehicleType,
  isRoundTrip,
  passengers,
}: {
  destination: Destination
  bookingMode: BookingMode
  vehicleType?: VehicleType | null
  isRoundTrip: boolean
  passengers: number
}): number {
  if (bookingMode === 'group' && vehicleType) {
    let price = PRIVATE_PRICES[vehicleType][destination]
    if (isRoundTrip) price += PRIVATE_ROUND_TRIP_EXTRA[vehicleType]
    return price
  }

  // solo (per person, max 2)
  let pricePerPerson = SHARED_PRICES[destination]
  if (isRoundTrip) pricePerPerson += SHARED_ROUND_TRIP_EXTRA_PER_PERSON
  return pricePerPerson * passengers
}

// ─── Destination labels ───────────────────────────────────────────────────────

export const DESTINATIONS: Record<Destination, string> = {
  'puerto-la-libertad': 'Puerto de La Libertad',
  'el-tunco': 'El Tunco',
  'el-sunzal': 'El Sunzal',
  'el-zonte': 'El Zonte',
}
