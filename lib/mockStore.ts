// In-memory mock store — singleton in the Node.js dev process.
// Cleared on server restart. Only used when MOCK_MODE=true.

export type MockBooking = {
  id: string
  orderId: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_whatsapp: string
  flight_number: string
  travel_date: string
  pickup_time: string
  passengers: number
  booking_mode: string
  vehicle_type: string | null
  destination: string
  is_round_trip?: boolean
  price_usd: number
  deposit_paid: number
  notes: string
}

const store = new Map<string, MockBooking>()

export function addMockBooking(booking: MockBooking): void {
  store.set(booking.orderId, booking)
}

export function getMockBookingByOrderId(orderId: string): MockBooking | undefined {
  return store.get(orderId)
}

export function getAllMockBookings(): MockBooking[] {
  return Array.from(store.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
}
