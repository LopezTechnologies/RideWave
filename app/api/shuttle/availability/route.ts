import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase'
import { getAvailableSlotsForRequest } from '@/lib/shuttleAvailability'

const querySchema = z.object({
  date: z.string().min(1),
  destination: z.enum(['puerto-la-libertad', 'el-tunco', 'el-sunzal', 'el-zonte']),
  bookingMode: z.enum(['solo', 'group']),
  vehicleType: z.enum(['suv', 'pickup']).optional(),
  isRoundTrip: z.enum(['true', 'false']).optional(),
}).refine((d) => d.bookingMode !== 'group' || !!d.vehicleType, {
  message: 'vehicleType is required for group bookings',
  path: ['vehicleType'],
})

export async function GET(request: NextRequest) {
  try {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const parsed = querySchema.parse(params)
    const supabaseAdmin = process.env.MOCK_MODE === 'true' ? null : createAdminClient()

    const availableSlots = await getAvailableSlotsForRequest(supabaseAdmin, {
      destination: parsed.destination,
      bookingMode: parsed.bookingMode,
      vehicleType: parsed.vehicleType ?? null,
      isRoundTrip: parsed.isRoundTrip === 'true',
      travelDate: parsed.date,
    })

    return NextResponse.json({ availableSlots })
  } catch (err) {
    console.error('[shuttle/availability]', err)
    return NextResponse.json({ error: 'Failed to calculate shuttle availability' }, { status: 500 })
  }
}
