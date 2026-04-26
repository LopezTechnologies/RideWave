export type ServiceType = 'shuttle'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type VehicleType = 'suv' | 'pickup'
export type BookingMode = 'solo' | 'group'

export interface Booking {
  id: string
  service_type: ServiceType
  status: BookingStatus
  customer_name: string
  customer_email: string
  customer_whatsapp: string
  flight_number?: string
  travel_date: string
  pickup_time: string
  passengers: number
  booking_mode: BookingMode
  vehicle_type: VehicleType | null
  is_round_trip?: boolean
  origin: string
  destination: string
  price_usd: number
  deposit_paid: number
  paypal_order_id?: string
  notes?: string
  created_at: string
}

export type Destination = 'puerto-la-libertad' | 'el-tunco' | 'el-sunzal' | 'el-zonte'
