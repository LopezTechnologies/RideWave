import type { SupabaseClient } from '@supabase/supabase-js'
import type { BookingMode, Destination, VehicleType } from '@/types'
import { getAllMockBookings } from '@/lib/mockStore'

const ACTIVE_STATUSES = ['pending', 'confirmed', 'completed'] as const

const PRE_PICKUP_BUFFER_MIN = 45
const POST_SERVICE_BUFFER_MIN = 20

const ONE_WAY_DURATION_BY_DESTINATION_MIN: Record<Destination, number> = {
  'puerto-la-libertad': 45,
  'el-tunco': 55,
  'el-sunzal': 60,
  'el-zonte': 70,
}

type ShuttleBookingRecord = {
  id: string
  travel_date: string
  pickup_time: string
  destination: Destination
  is_round_trip: boolean | null
  service_type: string
  status: string
}

type ShuttleRequestInput = {
  travelDate: string
  pickupTime: string
  destination: Destination
  isRoundTrip: boolean
  bookingMode: BookingMode
  vehicleType: VehicleType | null
}

type TimeWindow = {
  start: Date
  end: Date
}

function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}:00`)
}

function addMinutes(base: Date, minutes: number): Date {
  return new Date(base.getTime() + minutes * 60_000)
}

function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.start < b.end && b.start < a.end
}

function toHHMM(date: Date): string {
  const hh = date.getHours().toString().padStart(2, '0')
  const mm = date.getMinutes().toString().padStart(2, '0')
  return `${hh}:${mm}`
}

function serviceDurationMinutes(destination: Destination, isRoundTrip: boolean): number {
  const oneWay = ONE_WAY_DURATION_BY_DESTINATION_MIN[destination]
  return isRoundTrip ? oneWay * 2 : oneWay
}

export function getBlockedWindowForShuttle(
  travelDate: string,
  pickupTime: string,
  destination: Destination,
  isRoundTrip: boolean,
): TimeWindow {
  const pickupAt = parseDateTime(travelDate, pickupTime)
  const totalDurationMin = serviceDurationMinutes(destination, isRoundTrip)
  return {
    start: addMinutes(pickupAt, -PRE_PICKUP_BUFFER_MIN),
    end: addMinutes(pickupAt, totalDurationMin + POST_SERVICE_BUFFER_MIN),
  }
}

export async function getActiveShuttleBookingsForDate(
  supabaseAdmin: SupabaseClient | null,
  travelDate: string,
): Promise<ShuttleBookingRecord[]> {
  if (process.env.MOCK_MODE === 'true') {
    return getAllMockBookings()
      .filter((booking) => booking.travel_date === travelDate)
      .map((booking) => ({
        id: booking.id,
        travel_date: booking.travel_date,
        pickup_time: booking.pickup_time,
        destination: booking.destination as Destination,
        is_round_trip: booking.is_round_trip ?? false,
        service_type: 'shuttle',
        status: 'confirmed',
      }))
  }

  if (!supabaseAdmin) {
    throw new Error('Missing Supabase admin client for availability checks')
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('id, travel_date, pickup_time, destination, is_round_trip, service_type, status')
    .eq('service_type', 'shuttle')
    .eq('travel_date', travelDate)
    .in('status', [...ACTIVE_STATUSES])
    .limit(300)

  if (error) {
    throw new Error(`Failed to load shuttle availability: ${error.message}`)
  }

  return (data ?? []) as ShuttleBookingRecord[]
}

export function hasShuttleConflict(
  request: ShuttleRequestInput,
  existingBookings: ShuttleBookingRecord[],
): boolean {
  // Single-vehicle entrepreneur: any overlap blocks this time slot.
  // TODO: support multi-vehicle fleet capacity in a future iteration.
  const requestedWindow = getBlockedWindowForShuttle(
    request.travelDate,
    request.pickupTime,
    request.destination,
    request.isRoundTrip,
  )

  return existingBookings.some((booking) => {
    const bookingWindow = getBlockedWindowForShuttle(
      booking.travel_date,
      booking.pickup_time,
      booking.destination,
      Boolean(booking.is_round_trip),
    )
    return overlaps(requestedWindow, bookingWindow)
  })
}

export async function assertShuttleSlotAvailable(
  supabaseAdmin: SupabaseClient | null,
  request: ShuttleRequestInput,
): Promise<void> {
  const existingBookings = await getActiveShuttleBookingsForDate(supabaseAdmin, request.travelDate)
  if (hasShuttleConflict(request, existingBookings)) {
    throw new Error('Selected shuttle time is no longer available')
  }
}

export function buildAllSlotsForDay(): string[] {
  const slots: string[] = []
  for (let hour = 4; hour <= 23; hour += 1) {
    for (let minute = 0; minute < 60; minute += 5) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
    }
  }
  return slots
}

export async function getAvailableSlotsForRequest(
  supabaseAdmin: SupabaseClient | null,
  request: Omit<ShuttleRequestInput, 'pickupTime'>,
): Promise<string[]> {
  const existingBookings = await getActiveShuttleBookingsForDate(supabaseAdmin, request.travelDate)
  const allSlots = buildAllSlotsForDay()

  return allSlots.filter((pickupTime) => {
    return !hasShuttleConflict(
      {
        ...request,
        pickupTime,
      },
      existingBookings,
    )
  })
}

export function formatBlockedWindow(
  travelDate: string,
  pickupTime: string,
  destination: Destination,
  isRoundTrip: boolean,
): { start: string; end: string } {
  const window = getBlockedWindowForShuttle(travelDate, pickupTime, destination, isRoundTrip)
  return {
    start: toHHMM(window.start),
    end: toHHMM(window.end),
  }
}
