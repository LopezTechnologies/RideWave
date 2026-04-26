import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase'
import { getAllMockBookings } from '@/lib/mockStore'
import type { MockBooking } from '@/lib/mockStore'
import { MapPin, Users, Car, Truck, Calendar, Clock, Phone, StickyNote, LogOut } from 'lucide-react'

// ─── Auth check ───────────────────────────────────────────────────────────────

function isAuthenticated() {
  const cookieStore = cookies()
  const auth = cookieStore.get('admin_auth')
  return auth?.value === process.env.ADMIN_PASSWORD
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Booking = {
  id: string
  created_at: string
  customer_name: string
  customer_email: string
  customer_whatsapp: string
  travel_date: string
  pickup_time: string
  destination: string
  vehicle_type: string | null
  booking_mode?: string
  passengers: number
  is_round_trip?: boolean
  price_usd: number
  deposit_paid: number
  status?: string
  flight_number: string | null
  notes: string | null
  paypal_order_id?: string | null
}

const DEST_LABELS: Record<string, string> = {
  'puerto-la-libertad': 'Puerto La Libertad',
  'el-tunco': 'El Tunco',
  'el-sunzal': 'El Sunzal',
  'el-zonte': 'El Zonte',
}

function vehicleLabel(v: string | null, mode?: string): string {
  if (mode === 'shared') return 'Compartido'
  if (v === 'pickup') return 'Pickup'
  if (v === 'suv') return 'SUV'
  return v ?? '—'
}

// ─── Login page ───────────────────────────────────────────────────────────────

function LoginPage({ error }: { error: boolean }) {
  return (
    <div className="min-h-screen bg-ocean-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-ocean-950 mb-1">Panel Admin</h1>
        <p className="text-gray-500 text-sm mb-6">ShuttleWave</p>

        <form action="/api/admin/login" method="POST" className="flex flex-col gap-4">
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            autoFocus
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400"
          />
          {error && (
            <p className="text-red-500 text-xs -mt-2">Contraseña incorrecta</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-ocean-950 text-white font-bold text-sm hover:bg-ocean-800 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({ b, isToday }: { b: Booking; isToday: boolean }) {
  const whatsappMsg = encodeURIComponent(
    `Hola ${b.customer_name}, te confirmamos tu shuttle a ${DEST_LABELS[b.destination] ?? b.destination} el ${b.travel_date} a las ${b.pickup_time}. ¡Nos vemos! 🌊`,
  )

  const VehicleIcon = b.vehicle_type === 'pickup' ? Truck : Car
  const label = vehicleLabel(b.vehicle_type, b.booking_mode)

  return (
    <div
      className={`bg-white rounded-2xl border p-5 shadow-sm ${
        isToday ? 'border-ocean-400 ring-1 ring-ocean-300' : 'border-gray-100'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-bold text-ocean-950 text-base">{b.customer_name}</p>
          <p className="text-gray-500 text-xs">{b.customer_email}</p>
        </div>
        <div className="flex items-center gap-2">
          {b.booking_mode && (
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                b.booking_mode === 'solo'
                  ? 'bg-sand-100 text-sand-800'
                  : 'bg-ocean-100 text-ocean-800'
              }`}
            >
              {b.booking_mode === 'solo' ? 'Individual' : 'Grupo'}
            </span>
          )}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isToday ? 'bg-ocean-100 text-ocean-800' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {isToday ? 'HOY' : b.travel_date}
          </span>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="flex items-center gap-1.5 text-gray-600">
          <MapPin className="w-4 h-4 text-ocean-400 shrink-0" />
          {DEST_LABELS[b.destination] ?? b.destination}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock className="w-4 h-4 text-ocean-400 shrink-0" />
          {b.pickup_time}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <VehicleIcon className="w-4 h-4 text-ocean-400 shrink-0" />
          {label}
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Users className="w-4 h-4 text-ocean-400 shrink-0" />
          {b.passengers} {b.passengers === 1 ? 'pasajero' : 'pasajeros'}
        </div>
        {b.flight_number && (
          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
            <Calendar className="w-4 h-4 text-ocean-400 shrink-0" />
            Vuelo: {b.flight_number}
          </div>
        )}
        {b.notes && (
          <div className="flex items-start gap-1.5 text-gray-600 col-span-2">
            <StickyNote className="w-4 h-4 text-ocean-400 shrink-0 mt-0.5" />
            {b.notes}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Depósito pagado</p>
          <p className="font-bold text-ocean-950">
            ${b.deposit_paid}{' '}
            <span className="text-gray-400 font-normal text-xs">/ ${b.price_usd} total</span>
          </p>
        </div>
        <a
          href={`https://wa.me/${b.customer_whatsapp.replace(/\D/g, '')}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

async function Dashboard() {
  const today = new Date().toISOString().split('T')[0]
  let bookings: Booking[] = []
  const isMock = process.env.MOCK_MODE === 'true'

  if (isMock) {
    bookings = getAllMockBookings().map((m: MockBooking) => ({
      id: m.id,
      created_at: m.created_at,
      customer_name: m.customer_name,
      customer_email: m.customer_email,
      customer_whatsapp: m.customer_whatsapp,
      travel_date: m.travel_date,
      pickup_time: m.pickup_time,
      destination: m.destination,
      vehicle_type: m.vehicle_type,
      booking_mode: m.booking_mode,
      passengers: m.passengers,
      price_usd: m.price_usd,
      deposit_paid: m.deposit_paid,
      flight_number: m.flight_number || null,
      notes: m.notes || null,
    }))
  } else {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .gte('travel_date', today)
      .order('travel_date', { ascending: true })
      .order('pickup_time', { ascending: true })
      .limit(100)

    if (error) console.error('[admin] supabase error', error)
    bookings = data ?? []
  }

  const todayBookings = bookings.filter((b) => b.travel_date === today)
  const upcomingBookings = bookings.filter((b) => b.travel_date > today)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-ocean-950 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-lg">Panel de Reservas</h1>
          <p className="text-ocean-400 text-xs">
          ShuttleWave · {today}
            {isMock && (
              <span className="ml-2 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                MOCK MODE
              </span>
            )}
          </p>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-1.5 text-ocean-400 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </form>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Today */}
        <section>
          <h2 className="text-sm font-bold text-ocean-950 uppercase tracking-wider mb-3">
            Hoy — {todayBookings.length} {todayBookings.length === 1 ? 'reserva' : 'reservas'}
          </h2>
          {todayBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin traslados hoy.</p>
          ) : (
            <div className="grid gap-4">
              {todayBookings.map((b) => (
                <BookingCard key={b.id} b={b} isToday />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="text-sm font-bold text-ocean-950 uppercase tracking-wider mb-3">
            Próximas — {upcomingBookings.length}{' '}
            {upcomingBookings.length === 1 ? 'reserva' : 'reservas'}
          </h2>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin reservas próximas.</p>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((b) => (
                <BookingCard key={b.id} b={b} isToday={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  if (!isAuthenticated()) {
    return <LoginPage error={searchParams.error === '1'} />
  }
  return <Dashboard />
}
