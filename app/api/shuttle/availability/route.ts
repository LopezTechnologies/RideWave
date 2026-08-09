import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAllMockBookings } from '@/lib/mockStore'
import { findConflictingBooking } from '@/lib/shuttleAvailability'
import type { BookingMode, Destination, VehicleType } from '@/types'

const DESTINATIONS: Destination[] = ['puerto-la-libertad', 'el-tunco', 'el-sunzal', 'el-zonte']
const BOOKING_MODES: BookingMode[] = ['solo', 'group']
const VEHICLE_TYPES: VehicleType[] = ['suv', 'pickup']
const TIME_START_MINUTES = 4 * 60
const TIME_END_MINUTES = 23 * 60 + 55
const STEP_MINUTES = 5

function isDestination(value: string): value is Destination {
  return DESTINATIONS.includes(value as Destination)
}

function isBookingMode(value: string): value is BookingMode {
  return BOOKING_MODES.includes(value as BookingMode)
}

function isVehicleType(value: string): value is VehicleType {
  return VEHICLE_TYPES.includes(value as VehicleType)
}

function toTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function buildCandidateSlots() {
  const slots: string[] = []
  for (let mins = TIME_START_MINUTES; mins <= TIME_END_MINUTES; mins += STEP_MINUTES) {
    slots.push(toTimeString(mins))
  }
  return slots
}

function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams
    const date = search.get('date') || ''
    const destination = search.get('destination') || ''
    const bookingModeRaw = search.get('bookingMode') || 'solo'
    const vehicleTypeRaw = search.get('vehicleType') || 'suv'
    const isRoundTripRaw = search.get('isRoundTrip') || 'false'

    if (!date || !isDestination(destination) || !isBookingMode(bookingModeRaw)) {
      return NextResponse.json({ error: 'Invalid availability query' }, { status: 400 })
    }

    const vehicleType = isVehicleType(vehicleTypeRaw) ? vehicleTypeRaw : 'suv'
    const isRoundTrip = isRoundTripRaw === 'true'

    const slots = buildCandidateSlots()
    const availableSlots: string[] = []

    if (process.env.MOCK_MODE === 'true') {
      const bookings = getAllMockBookings().map((booking) => ({
        ...booking,
        service_type: 'shuttle',
        status: 'confirmed',
        is_round_trip: booking.is_round_trip ?? false,
      }))

      for (const pickupTime of slots) {
        const conflict = findConflictingBooking(
          {
            travelDate: date,
            pickupTime,
            destination,
            isRoundTrip,
            bookingMode: bookingModeRaw,
            vehicleType,
          },
          bookings,
        )

        if (!conflict) availableSlots.push(pickupTime)
      }

      return NextResponse.json({ availableSlots })
    }

    const supabaseAdmin = createAdminClient()
    const centerDate = new Date(`${date}T12:00:00`)
    const from = toDateKey(new Date(centerDate.getTime() - 2 * 24 * 60 * 60 * 1000))
    const to = toDateKey(new Date(centerDate.getTime() + 2 * 24 * 60 * 60 * 1000))
    const primary = await supabaseAdmin
      .from('bookings')
      .select('id, service_type, status, travel_date, pickup_time, destination, is_round_trip')
      .eq('service_type', 'shuttle')
      .in('status', ['pending', 'confirmed', 'completed'])
      .gte('travel_date', from)
      .lte('travel_date', to)
      .limit(500)

    let data = primary.data ?? []
    let error = primary.error

    if (error && /is_round_trip/.test(error.message)) {
      const fallback = await supabaseAdmin
        .from('bookings')
        .select('id, service_type, status, travel_date, pickup_time, destination')
        .eq('service_type', 'shuttle')
        .in('status', ['pending', 'confirmed', 'completed'])
        .gte('travel_date', from)
        .lte('travel_date', to)
        .limit(500)

      data = fallback.data ?? []
      error = fallback.error
    }

    if (error) {
      console.error('[shuttle/availability] supabase error', error)
      return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
    }

    for (const pickupTime of slots) {
      const conflict = findConflictingBooking(
        {
          travelDate: date,
          pickupTime,
          destination,
          isRoundTrip,
          bookingMode: bookingModeRaw,
          vehicleType,
        },
        data ?? [],
      )
      if (!conflict) {
        availableSlots.push(pickupTime)
      }
    }

    return NextResponse.json({ availableSlots })
  } catch (error) {
    console.error('[shuttle/availability]', error)
    return NextResponse.json({ error: 'Failed to load availability' }, { status: 500 })
  }
}
