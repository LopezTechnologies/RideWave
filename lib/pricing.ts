import type { Destination, VehicleType } from '@/types'

const PRICES: Record<'shuttle', Record<VehicleType, Record<Destination, number>>> = {
  shuttle: {
    sedan: {
      'puerto-la-libertad': 35,
      'el-tunco': 40,
      'el-sunzal': 40,
      'el-zonte': 45,
    },
    suv: {
      'puerto-la-libertad': 45,
      'el-tunco': 50,
      'el-sunzal': 50,
      'el-zonte': 55,
    },
  },
}

const ROUND_TRIP_EXTRA: Record<VehicleType, number> = {
  sedan: 25,
  suv: 30,
}

const SURFBOARD_EXTRA = 5 // solo para sedan

export function calculateShuttlePrice({
  destination,
  vehicleType,
  isRoundTrip,
  hasSurfboard,
}: {
  destination: Destination
  vehicleType: VehicleType
  isRoundTrip: boolean
  hasSurfboard: boolean
}): number {
  let price = PRICES.shuttle[vehicleType][destination]

  if (isRoundTrip) {
    price += ROUND_TRIP_EXTRA[vehicleType]
  }

  // Surfboard extra solo aplica en sedan
  if (hasSurfboard && vehicleType === 'sedan') {
    price += SURFBOARD_EXTRA
  }

  return price
}

export const DESTINATIONS: Record<Destination, string> = {
  'puerto-la-libertad': 'Puerto de La Libertad',
  'el-tunco': 'El Tunco',
  'el-sunzal': 'El Sunzal',
  'el-zonte': 'El Zonte',
}
