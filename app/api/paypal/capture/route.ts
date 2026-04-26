import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { capturePayPalOrder } from '@/lib/paypal'
import { createAdminClient } from '@/lib/supabase'
import { sendBookingConfirmation } from '@/lib/resend'
import { DESTINATIONS } from '@/lib/pricing'
import { addMockBooking } from '@/lib/mockStore'
import { assertShuttleSlotAvailable } from '@/lib/shuttleAvailability'
import type { Destination } from '@/types'

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
    const supabaseAdmin = process.env.MOCK_MODE === 'true' ? null : createAdminClient()

    await assertShuttleSlotAvailable(supabaseAdmin, {
      destination: meta.destination as Destination,
      bookingMode: meta.bookingMode as 'solo' | 'group',
      vehicleType: (meta.vehicleType as 'suv' | 'pickup' | null) ?? null,
      isRoundTrip: meta.isRoundTrip,
      travelDate: meta.travelDate,
      pickupTime: meta.pickupTime,
    })

    // ── Mock mode: store in memory, skip PayPal + Supabase ───────────────────
    if (process.env.MOCK_MODE === 'true') {
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
        is_round_trip: meta.isRoundTrip,
        destination: meta.destination,
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
      let dbError: { message?: string; code?: string } | null = null

      const { data: atomicResult, error: atomicError } = await supabaseAdmin!.rpc(
        'reserve_shuttle_booking_atomic',
        {
          p_service_type: 'shuttle',
          p_status: 'confirmed',
          p_customer_name: meta.name,
          p_customer_email: meta.email,
          p_customer_whatsapp: meta.whatsapp,
          p_flight_number: meta.flightNumber || '',
          p_travel_date: meta.travelDate,
          p_pickup_time: meta.pickupTime,
          p_passengers: meta.passengers,
          p_booking_mode: meta.bookingMode,
          p_vehicle_type: meta.vehicleType,
          p_is_round_trip: meta.isRoundTrip,
          p_origin: 'Aeropuerto SAL',
          p_destination: meta.destination,
          p_price_usd: meta.priceUsd,
          p_deposit_paid: deposit,
          p_paypal_order_id: orderId,
          p_notes: meta.notes || '',
        },
      )

      if (!atomicError) {
        const conflict = Boolean(
          atomicResult &&
            typeof atomicResult === 'object' &&
            'conflict' in atomicResult &&
            atomicResult.conflict,
        )
        if (conflict) {
          return NextResponse.json(
            { error: 'Selected shuttle time is no longer available' },
            { status: 409 },
          )
        }
      } else {
        const missingRpc = atomicError.code === 'PGRST202' || atomicError.code === '42883'
        if (!missingRpc) {
          dbError = atomicError
        } else {
          const fallback = await supabaseAdmin!.from('bookings').insert({
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
            is_round_trip: meta.isRoundTrip,
            origin: 'Aeropuerto SAL',
            destination: meta.destination,
            price_usd: meta.priceUsd,
            deposit_paid: deposit,
            paypal_order_id: orderId,
            notes: meta.notes || null,
          })
          dbError = fallback.error
        }
      }

      if (dbError) {
        console.error('[paypal/capture] supabase error', dbError)
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
    if (err instanceof Error && err.message.includes('no longer available')) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 })
  }
}
