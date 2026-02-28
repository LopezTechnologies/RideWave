export type ServiceType = 'shuttle' | 'tour'
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'
export type VehicleType = 'sedan' | 'suv'

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
  has_surfboard: boolean
  vehicle_type: VehicleType
  origin: string
  destination: string
  price_usd: number
  deposit_paid: number
  stripe_session_id?: string
  notes?: string
  created_at: string
}

export interface Tour {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string
  description_en: string
  duration_hours: number
  max_people: number
  price_usd: number
  includes: string[]
  images: string[]
  active: boolean
}

export interface TourBooking {
  id: string
  tour_id: string
  booking_id: string
  tour_date: string
  time_slot: string
}

export type Destination = 'puerto-la-libertad' | 'el-tunco' | 'el-sunzal' | 'el-zonte'
