import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPayPalOrder } from '@/lib/paypal'
import { calculateShuttlePrice, DESTINATIONS } from '@/lib/pricing'
import { createAdminClient } from '@/lib/supabase'
import { checkShuttleConflictInSupabase } from '@/lib/shuttleAvailability'

const schema = z
  .object({
    destination: z.enum(['puerto-la-libertad', 'el-tunco', 'el-sunzal', 'el-zonte']),
    bookingMode: z.enum(['solo', 'group']),
    vehicleType: z.enum(['suv', 'pickup']).optional(),
    isRoundTrip: z.boolean(),
    travelDate: z.string().min(1),
    pickupTime: z.string().min(1),
    passengers: z.number().int().min(1).max(6),
    flightNumber: z.string().optional(),
    name: z.string().min(1),
    email: z.string().email(),
    whatsapp: z.string().min(1),
    notes: z.string().optional(),
    locale: z.enum(['es', 'en']),
  })
  .refine((d) => d.bookingMode !== 'group' || !!d.vehicleType, {
    message: 'vehicleType is required for private bookings',
    path: ['vehicleType'],
  })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const priceUsd = calculateShuttlePrice({
      destination: data.destination,
      bookingMode: data.bookingMode,
      vehicleType: data.vehicleType,
      isRoundTrip: data.isRoundTrip,
      passengers: data.passengers,
    })

    const deposit = parseFloat((priceUsd * 0.5).toFixed(2))
    const destLabel = DESTINATIONS[data.destination]
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!

    if (process.env.MOCK_MODE !== 'true') {
      const supabaseAdmin = createAdminClient()
      const { conflict, error } = await checkShuttleConflictInSupabase(supabaseAdmin, {
        travelDate: data.travelDate,
        pickupTime: data.pickupTime,
        destination: data.destination,
        isRoundTrip: data.isRoundTrip,
        bookingMode: data.bookingMode,
        vehicleType: data.vehicleType ?? null,
      })

      if (error) {
        console.error('[checkout] availability check error', error)
      }

      if (conflict) {
        return NextResponse.json(
          {
            error:
              data.locale === 'es'
                ? 'Este horario ya no esta disponible. Elige otro horario.'
                : 'This timeslot is no longer available. Please pick another time.',
            code: 'TIME_SLOT_UNAVAILABLE',
          },
          { status: 409 },
        )
      }
    }

    const bookingMeta = {
      destination: data.destination,
      bookingMode: data.bookingMode,
      vehicleType: data.vehicleType ?? null,
      isRoundTrip: data.isRoundTrip,
      travelDate: data.travelDate,
      pickupTime: data.pickupTime,
      passengers: data.passengers,
      flightNumber: data.flightNumber ?? '',
      name: data.name,
      email: data.email,
      whatsapp: data.whatsapp,
      notes: data.notes ?? '',
      priceUsd,
    }

    const encodedMeta = encodeURIComponent(
      Buffer.from(JSON.stringify(bookingMeta)).toString('base64'),
    )

    // ── Mock mode: skip PayPal, redirect straight to success ─────────────────
    if (process.env.MOCK_MODE === 'true') {
      const orderId = `MOCK-${Date.now()}`
      const successUrl = `${appUrl}/${data.locale}/shuttle/success?token=${orderId}&data=${encodedMeta}`
      return NextResponse.json({ url: successUrl })
    }

    // ── Real PayPal flow ─────────────────────────────────────────────────────
    const returnUrl = `${appUrl}/${data.locale}/shuttle/success?data=${encodedMeta}`
    const cancelUrl = `${appUrl}/${data.locale}/shuttle/cancelled`

    const { approveUrl } = await createPayPalOrder({
      amountUsd: deposit,
      description: `50% deposit — Shuttle to ${destLabel}. Balance $${priceUsd - deposit} USD paid on arrival.`,
      returnUrl,
      cancelUrl,
    })

    return NextResponse.json({ url: approveUrl })
  } catch (err) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
