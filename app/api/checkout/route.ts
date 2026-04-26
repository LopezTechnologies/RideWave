import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPayPalOrder } from '@/lib/paypal'
import { calculateShuttlePrice, DESTINATIONS } from '@/lib/pricing'
import { createAdminClient } from '@/lib/supabase'
import { assertShuttleSlotAvailable } from '@/lib/shuttleAvailability'

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
    const supabaseAdmin = process.env.MOCK_MODE === 'true' ? null : createAdminClient()

    await assertShuttleSlotAvailable(supabaseAdmin, {
      destination: data.destination,
      bookingMode: data.bookingMode,
      vehicleType: data.vehicleType ?? null,
      isRoundTrip: data.isRoundTrip,
      travelDate: data.travelDate,
      pickupTime: data.pickupTime,
    })

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
    if (err instanceof Error && err.message.includes('no longer available')) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
