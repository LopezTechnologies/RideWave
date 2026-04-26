import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { capturePayPalOrder } from '@/lib/paypal'
import { createAdminClient } from '@/lib/supabase'
import { sendBookingConfirmation } from '@/lib/resend'
import { DESTINATIONS } from '@/lib/pricing'
import { addMockBooking, getAllMockBookings } from '@/lib/mockStore'
import type { BookingMode, Destination, VehicleType } from '@/types'
import {
  checkShuttleConflictInSupabase,
  findConflictingBooking,
  reserveShuttleBookingAtomic,
  type ShuttleCandidate,
} from '@/lib/shuttleAvailability'

const schema = z.object({
  orderId: z.string().min(1),
  meta: z.object({
    destination: z.string(),
    bookingMode: z.string(),
    vehicleType: z.string().nullable(),
    isRoundTrip: z.boolean(),
    travelDate: z.string(),
    pickupTime: z.string(),
    passengers: z.number(),
    flightNumber: z.string(),
    name: z.string(),
    email: z.string(),
    whatsapp: z.string(),
    notes: z.string(),
    priceUsd: z.number(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, meta } = schema.parse(body)
    const deposit = Math.round(meta.priceUsd * 0.5)
    const candidate: ShuttleCandidate = {
      travelDate: meta.travelDate,
      pickupTime: meta.pickupTime,
      destination: meta.destination as Destination,
      isRoundTrip: meta.isRoundTrip,
      bookingMode: meta.bookingMode as BookingMode,
      vehicleType: meta.vehicleType as VehicleType | null,
    }

    // ── Mock mode: store in memory, skip PayPal + Supabase ───────────────────
    if (process.env.MOCK_MODE === 'true') {
      const conflict = findConflictingBooking(
        candidate,
        getAllMockBookings().map((booking) => ({
          ...booking,
          service_type: 'shuttle',
          status: 'confirmed',
          is_round_trip: booking.is_round_trip ?? false,
        })),
      )

      if (conflict) {
        return NextResponse.json(
          {
            error: 'This timeslot is no longer available. Please pick another time.',
            code: 'TIME_SLOT_UNAVAILABLE',
          },
          { status: 409 },
        )
      }

      addMockBooking({
        id: `mock-${Date.now()}`,
        orderId,
        created_at: new Date().toISOString(),
        customer_name: meta.name,
        customer_email: meta.email,
        customer_whatsapp: meta.whatsapp,
        flight_number: meta.flightNumber,
        travel_date: meta.travelDate,
        pickup_time: meta.pickupTime,
        passengers: meta.passengers,
        booking_mode: meta.bookingMode,
        vehicle_type: meta.vehicleType,
        destination: meta.destination,
        is_round_trip: meta.isRoundTrip,
        price_usd: meta.priceUsd,
        deposit_paid: deposit,
        notes: meta.notes,
      })
      return NextResponse.json({ success: true })
    }

    // ── Real flow ────────────────────────────────────────────────────────────
    const result = await capturePayPalOrder(orderId)
    const alreadyCaptured = result?.alreadyCaptured === true

    if (!alreadyCaptured) {
      const supabaseAdmin = createAdminClient()
      let bookingPersisted = false

      const atomicResult = await reserveShuttleBookingAtomic(supabaseAdmin, {
        orderId,
        candidate,
        customerName: meta.name,
        customerEmail: meta.email,
        customerWhatsapp: meta.whatsapp,
        flightNumber: meta.flightNumber,
        passengers: meta.passengers,
        priceUsd: meta.priceUsd,
        depositPaid: deposit,
        notes: meta.notes,
      })

      if (atomicResult.error) {
        // Fallback path for environments where the SQL function has not been installed yet.
        const message = atomicResult.error.message || ''
        const functionMissing =
          message.includes('reserve_shuttle_booking_atomic') && message.includes('does not exist')

        if (!functionMissing) {
          console.error('[paypal/capture] atomic reservation error', atomicResult.error)
        }
      } else if (atomicResult.data?.conflict === true) {
        return NextResponse.json(
          {
            error: 'This timeslot is no longer available. Please pick another time.',
            code: 'TIME_SLOT_UNAVAILABLE',
          },
          { status: 409 },
        )
      } else if (atomicResult.data?.success === true) {
        bookingPersisted = true
      }

      if (!bookingPersisted) {
        const { conflict, error: conflictError } = await checkShuttleConflictInSupabase(
          supabaseAdmin,
          candidate,
        )

        if (conflictError) {
          console.error('[paypal/capture] conflict check error', conflictError)
        }

        if (conflict) {
          return NextResponse.json(
            {
              error: 'This timeslot is no longer available. Please pick another time.',
              code: 'TIME_SLOT_UNAVAILABLE',
            },
            { status: 409 },
          )
        }

        const { error: dbError } = await supabaseAdmin.from('bookings').insert({
          service_type: 'shuttle',
          status: 'confirmed',
          customer_name: meta.name,
          customer_email: meta.email,
          customer_whatsapp: meta.whatsapp,
          flight_number: meta.flightNumber || null,
          travel_date: meta.travelDate,
          pickup_time: meta.pickupTime,
          passengers: meta.passengers,
          booking_mode: meta.bookingMode,
          vehicle_type: meta.vehicleType,
          origin: 'Aeropuerto SAL',
          destination: meta.destination,
          price_usd: meta.priceUsd,
          deposit_paid: deposit,
          paypal_order_id: orderId,
          notes: meta.notes || null,
        })

        if (dbError) {
          console.error('[paypal/capture] supabase error', dbError)
        }
      }

      await sendBookingConfirmation({
        to: meta.email,
        customerName: meta.name,
        destination: DESTINATIONS[meta.destination as Destination],
        travelDate: meta.travelDate,
        pickupTime: meta.pickupTime,
        passengers: meta.passengers,
        vehicleType: meta.vehicleType ?? 'suv',
        priceUsd: meta.priceUsd,
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[paypal/capture]', err)
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 })
  }
}
