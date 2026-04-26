import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingMode, Destination, VehicleType } from '@/types'

const PRE_PICKUP_MINUTES = 45
const POST_BUFFER_MINUTES = 20

const ONE_WAY_DRIVE_MINUTES: Record<Destination, number> = {
  'puerto-la-libertad': 60,
  'el-tunco': 75,
  'el-sunzal': 75,
  'el-zonte': 90,
}

const ROUND_TRIP_RETURN_MINUTES: Record<Destination, number> = {
  'puerto-la-libertad': 60,
  'el-tunco': 75,
  'el-sunzal': 75,
  'el-zonte': 90,
}

export type ShuttleBookingLike = {
  id?: string
  service_type?: string
  status?: string | null
  travel_date: string
  pickup_time: string
  destination: string
  is_round_trip?: boolean | null
}

export type ShuttleCandidate = {
  travelDate: string
  pickupTime: string
  destination: Destination
  isRoundTrip: boolean
  bookingMode: BookingMode
  vehicleType: VehicleType | null
}

export function getShuttleBlockMinutes(destination: Destination, isRoundTrip: boolean): number {
  const outbound = ONE_WAY_DRIVE_MINUTES[destination]
  const returnTrip = isRoundTrip ? ROUND_TRIP_RETURN_MINUTES[destination] : outbound
  return PRE_PICKUP_MINUTES + outbound + returnTrip + POST_BUFFER_MINUTES
}

function getDateFromParts(travelDate: string, pickupTime: string): Date {
  return new Date(`${travelDate}T${pickupTime}:00`)
}

export function getShuttleWindow(candidate: {
  travelDate: string
  pickupTime: string
  destination: Destination
  isRoundTrip: boolean
}) {
  const pickupAt = getDateFromParts(candidate.travelDate, candidate.pickupTime)
  const totalMinutes = getShuttleBlockMinutes(candidate.destination, candidate.isRoundTrip)
  const startAt = new Date(pickupAt.getTime() - PRE_PICKUP_MINUTES * 60_000)
  const endAt = new Date(startAt.getTime() + totalMinutes * 60_000)
  return { startAt, endAt, totalMinutes }
}

function normalizeBooking(booking: ShuttleBookingLike): {
  travelDate: string
  pickupTime: string
  destination: Destination
  isRoundTrip: boolean
} | null {
  if (
    booking.destination !== 'puerto-la-libertad' &&
    booking.destination !== 'el-tunco' &&
    booking.destination !== 'el-sunzal' &&
    booking.destination !== 'el-zonte'
  ) {
    return null
  }

  return {
    travelDate: booking.travel_date,
    pickupTime: booking.pickup_time,
    destination: booking.destination,
    isRoundTrip: booking.is_round_trip === true,
  }
}

export function hasWindowOverlap(
  a: { startAt: Date; endAt: Date },
  b: { startAt: Date; endAt: Date },
) {
  return a.startAt < b.endAt && b.startAt < a.endAt
}

export function findConflictingBooking(
  candidate: ShuttleCandidate,
  bookings: ShuttleBookingLike[],
): ShuttleBookingLike | null {
  const candidateWindow = getShuttleWindow(candidate)

  for (const booking of bookings) {
    const normalized = normalizeBooking(booking)
    if (!normalized) continue
    if (booking.service_type && booking.service_type !== 'shuttle') continue
    if (booking.status && !['pending', 'confirmed', 'completed'].includes(booking.status)) continue
    const existingWindow = getShuttleWindow(normalized)
    if (hasWindowOverlap(candidateWindow, existingWindow)) return booking
  }

  return null
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function checkShuttleConflictInSupabase(
  supabase: SupabaseClient,
  candidate: ShuttleCandidate,
) {
  const window = getShuttleWindow(candidate)
  const from = toDateKey(new Date(window.startAt.getTime() - 24 * 60 * 60 * 1000))
  const to = toDateKey(new Date(window.endAt.getTime() + 24 * 60 * 60 * 1000))

  const baseQuery = supabase
    .from('bookings')
    .select('id, service_type, status, travel_date, pickup_time, destination, is_round_trip')
    .eq('service_type', 'shuttle')
    .in('status', ['pending', 'confirmed', 'completed'])
    .gte('travel_date', from)
    .lte('travel_date', to)
    .limit(300)

  const { data, error } = await baseQuery

  if (error && /is_round_trip/.test(error.message)) {
    const fallback = await supabase
      .from('bookings')
      .select('id, service_type, status, travel_date, pickup_time, destination')
      .eq('service_type', 'shuttle')
      .in('status', ['pending', 'confirmed', 'completed'])
      .gte('travel_date', from)
      .lte('travel_date', to)
      .limit(300)

    if (fallback.error) {
      return { conflict: null as ShuttleBookingLike | null, error: fallback.error }
    }

    const conflict = findConflictingBooking(candidate, fallback.data ?? [])
    return { conflict, error: null }
  }

  if (error) {
    return { conflict: null as ShuttleBookingLike | null, error }
  }

  const conflict = findConflictingBooking(candidate, data ?? [])
  return { conflict, error: null }
}

export async function reserveShuttleBookingAtomic(
  supabase: SupabaseClient,
  payload: {
    orderId: string
    candidate: ShuttleCandidate
    customerName: string
    customerEmail: string
    customerWhatsapp: string
    flightNumber: string
    passengers: number
    priceUsd: number
    depositPaid: number
    notes: string
  },
) {
  const { data, error } = await supabase.rpc('reserve_shuttle_booking_atomic', {
    p_order_id: payload.orderId,
    p_customer_name: payload.customerName,
    p_customer_email: payload.customerEmail,
    p_customer_whatsapp: payload.customerWhatsapp,
    p_flight_number: payload.flightNumber || null,
    p_travel_date: payload.candidate.travelDate,
    p_pickup_time: payload.candidate.pickupTime,
    p_destination: payload.candidate.destination,
    p_booking_mode: payload.candidate.bookingMode,
    p_vehicle_type: payload.candidate.vehicleType,
    p_is_round_trip: payload.candidate.isRoundTrip,
    p_passengers: payload.passengers,
    p_price_usd: payload.priceUsd,
    p_deposit_paid: payload.depositPaid,
    p_notes: payload.notes || null,
  })

  if (error) return { data: null, error }
  return { data, error: null }
}
