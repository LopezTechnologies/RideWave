'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import {
  Car,
  Truck,
  ArrowRight,
  ArrowLeftRight,
  Calendar,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  PlaneTakeoff,
  StickyNote,
  CheckCircle2,
  ChevronRight,
  UserCheck,
  UsersRound,
} from 'lucide-react'
import {
  calculateShuttlePrice,
  DESTINATIONS,
  MAX_PASSENGERS,
  MAX_SOLO_PASSENGERS,
  MIN_GROUP_PASSENGERS,
  PRIVATE_ROUND_TRIP_EXTRA,
} from '@/lib/pricing'
import type { Destination, VehicleType, BookingMode } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  bookingMode: BookingMode
  destination: Destination
  vehicleType: VehicleType
  isRoundTrip: boolean
  travelDate: string
  pickupTime: string
  passengers: number
  flightNumber: string
  name: string
  email: string
  whatsapp: string
  notes: string
}

type FormErrors = Partial<Record<keyof FormData, string>>

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().split('T')[0]
}

const HOURS = Array.from({ length: 20 }, (_, i) => {
  const h = i + 4 // 4 AM → 11 PM
  const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h
  const ampm = h < 12 ? 'AM' : 'PM'
  return { value: h.toString().padStart(2, '0'), label: `${h12} ${ampm}` }
})

const MINUTES = Array.from({ length: 12 }, (_, i) => {
  const m = i * 5
  return { value: m.toString().padStart(2, '0'), label: m.toString().padStart(2, '0') }
})

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-bold text-ocean-950 mb-4 pb-2 border-b border-gray-100">
      {children}
    </h2>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
}

// ─── Price Summary ─────────────────────────────────────────────────────────────

function PriceSummary({
  form,
  total,
  onSubmit,
  loading,
}: {
  form: FormData
  total: number
  onSubmit: () => void
  loading: boolean
}) {
  const t = useTranslations('shuttle.summary')
  const deposit = Math.round(total * 0.5)
  const balance = total - deposit
  const destLabel = DESTINATIONS[form.destination]

  const vehicleLabel =
    form.bookingMode === 'solo'
      ? t('soloLabel')
      : form.vehicleType === 'suv'
        ? t('suv')
        : t('pickup')

  const basePrice =
    form.bookingMode === 'group'
      ? ({ suv: { 'puerto-la-libertad': 45, 'el-tunco': 50, 'el-sunzal': 50, 'el-zonte': 55 }, pickup: { 'puerto-la-libertad': 50, 'el-tunco': 55, 'el-sunzal': 55, 'el-zonte': 60 } } as Record<VehicleType, Record<Destination, number>>)[form.vehicleType][form.destination]
      : ({ 'puerto-la-libertad': 15, 'el-tunco': 18, 'el-sunzal': 18, 'el-zonte': 20 } as Record<Destination, number>)[form.destination]

  const lineItems: { label: string; amount: number }[] = []

  if (form.bookingMode === 'group') {
    lineItems.push({
      label: t('shuttleTo', { destination: destLabel, vehicle: vehicleLabel }),
      amount: basePrice,
    })
    if (form.isRoundTrip) {
      lineItems.push({
        label: t('roundTripLine'),
        amount: PRIVATE_ROUND_TRIP_EXTRA[form.vehicleType],
      })
    }
  } else {
    lineItems.push({
      label: t('shuttleSoloTo', { destination: destLabel }),
      amount: basePrice,
    })
    if (form.isRoundTrip) {
      lineItems.push({ label: t('roundTripLine'), amount: 10 })
    }
    lineItems.push({
      label: t('perPersonLine', { passengers: form.passengers }),
      amount: 0,
    })
  }

  const includes = [
    t('privateDriver'),
    t('nameSign'),
    t('luggage'),
    t('surfboardIncluded'),
    form.bookingMode === 'solo' ? t('soloVehicle') : null,
  ].filter(Boolean) as string[]

  const whyItems = [
    t('whyItem1'),
    t('whyItem2'),
    t('whyItem3'),
    t('whyItem4'),
    t('whyItem5'),
  ]

  const isReady =
    form.name.trim() &&
    form.email.trim() &&
    form.whatsapp.trim() &&
    form.travelDate &&
    form.pickupTime

  return (
    <div className="bg-ocean-950 rounded-2xl p-6 text-white flex flex-col gap-5 sticky top-24">
      <div>
        <p className="text-ocean-400 text-xs font-semibold uppercase tracking-wider mb-1">
          {t('yourBooking')}
        </p>
        <h3 className="font-bold text-lg leading-tight">{destLabel}</h3>
        <p className="text-ocean-300 text-sm">
          {vehicleLabel} ·{' '}
          {form.isRoundTrip ? t('roundTrip') : t('oneWay')} ·{' '}
          {form.passengers} {form.passengers === 1 ? t('passenger') : t('passengers')}
        </p>
      </div>

      {/* Line items */}
      <div className="space-y-2 text-sm">
        {lineItems.map((item, i) =>
          item.amount === 0 ? (
            <div key={i} className="text-ocean-500 text-xs italic">
              {item.label}
            </div>
          ) : (
            <div key={i} className="flex justify-between">
              <span className="text-ocean-300">{item.label}</span>
              <span className="font-semibold">${item.amount} USD</span>
            </div>
          ),
        )}
        <div className="border-t border-ocean-800 pt-2 flex justify-between font-bold text-base">
          <span>{t('total')}</span>
          <span className="text-ocean-400">${total} USD</span>
        </div>
      </div>

      {/* Payment breakdown */}
      <div className="bg-ocean-900 rounded-xl p-4 text-sm space-y-1.5">
        <div className="flex justify-between">
          <span className="text-ocean-300">{t('depositNow')}</span>
          <span className="font-bold text-green-400">${deposit} USD</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ocean-300">{t('balanceOnArrival')}</span>
          <span className="font-semibold">${balance} USD</span>
        </div>
      </div>

      {/* Includes */}
      <ul className="space-y-1.5 text-sm">
        {includes.map((item) => (
          <li key={item} className="flex items-center gap-2 text-ocean-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-ocean-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Why Ridewave */}
      <div className="border-t border-ocean-800 pt-4">
        <p className="text-ocean-400 text-xs font-semibold uppercase tracking-wider mb-2">
          {t('whyRidewave')}
        </p>
        <ul className="space-y-1.5 text-sm">
          {whyItems.map((item) => (
            <li key={item} className="flex items-start gap-2 text-ocean-400">
              <span className="text-ocean-600 mt-0.5">›</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!isReady || loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-coral text-white font-bold text-sm transition-all hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="animate-pulse">{t('processing')}</span>
        ) : (
          <>
            {t('continue')}
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

      {!isReady && (
        <p className="text-ocean-500 text-xs text-center -mt-2">{t('completeFields')}</p>
      )}

      <p className="text-ocean-600 text-xs text-center">{t('securePayment')}</p>
    </div>
  )
}

// ─── Main Form ─────────────────────────────────────────────────────────────────

export default function ShuttleForm() {
  const t = useTranslations('shuttle')
  const tf = useTranslations('shuttle.form')
  const ts = useTranslations('shuttle.summary')
  const locale = useLocale()

  const [form, setForm] = useState<FormData>({
    bookingMode: 'solo',
    destination: 'el-tunco',
    vehicleType: 'suv',
    isRoundTrip: false,
    travelDate: '',
    pickupTime: '',
    passengers: 1,
    flightNumber: '',
    name: '',
    email: '',
    whatsapp: '',
    notes: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [availableSlots, setAvailableSlots] = useState<string[] | null>(null)

  const maxPassengers =
    form.bookingMode === 'solo' ? MAX_SOLO_PASSENGERS : MAX_PASSENGERS[form.vehicleType]
  const minPassengers = form.bookingMode === 'group' ? MIN_GROUP_PASSENGERS : 1

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function setBookingMode(mode: BookingMode) {
    setForm((prev) => {
      if (mode === 'solo') {
        return {
          ...prev,
          bookingMode: mode,
          passengers: Math.min(prev.passengers, MAX_SOLO_PASSENGERS),
        }
      }
      // group
      return {
        ...prev,
        bookingMode: mode,
        passengers: Math.max(prev.passengers, MIN_GROUP_PASSENGERS),
      }
    })
  }

  function setVehicleType(v: VehicleType) {
    setForm((prev) => ({
      ...prev,
      vehicleType: v,
      passengers: Math.min(prev.passengers, MAX_PASSENGERS[v]),
    }))
  }

  const total = useMemo(
    () =>
      calculateShuttlePrice({
        destination: form.destination,
        bookingMode: form.bookingMode,
        vehicleType: form.bookingMode === 'group' ? form.vehicleType : null,
        isRoundTrip: form.isRoundTrip,
        passengers: form.passengers,
      }),
    [form.destination, form.bookingMode, form.vehicleType, form.isRoundTrip, form.passengers],
  )

  function validate(): boolean {
    const newErrors: FormErrors = {}
    if (!form.name.trim()) newErrors.name = tf('errorName')
    if (!form.email.trim()) newErrors.email = tf('errorEmail')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = tf('errorEmailInvalid')
    if (!form.whatsapp.trim()) newErrors.whatsapp = tf('errorWhatsapp')
    if (!form.travelDate) newErrors.travelDate = tf('errorDate')
    if (!form.pickupTime) newErrors.pickupTime = tf('errorTime')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setApiError('')
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingMode: form.bookingMode,
          destination: form.destination,
          vehicleType: form.bookingMode === 'group' ? form.vehicleType : undefined,
          isRoundTrip: form.isRoundTrip,
          travelDate: form.travelDate,
          pickupTime: form.pickupTime,
          passengers: form.passengers,
          flightNumber: form.flightNumber,
          name: form.name,
          email: form.email,
          whatsapp: form.whatsapp,
          notes: form.notes,
          locale,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      window.location.href = data.url
    } catch (err) {
      const isUnavailable =
        err instanceof Error && err.message.toLowerCase().includes('no longer available')
      setApiError(isUnavailable ? tf('errorUnavailable') : tf('errorApi'))
      setLoading(false)
    }
  }

  const destinations = Object.entries(DESTINATIONS) as [Destination, string][]

  const roundTripExtra =
    form.bookingMode === 'solo'
      ? null
      : PRIVATE_ROUND_TRIP_EXTRA[form.vehicleType]
  const selectedHour = form.pickupTime ? form.pickupTime.split(':')[0] : ''

  const availableSlotSet = useMemo(
    () => new Set(availableSlots ?? []),
    [availableSlots],
  )

  useEffect(() => {
    let cancelled = false

    async function loadAvailability() {
      if (!form.travelDate) {
        setAvailableSlots(null)
        return
      }

      try {
        const params = new URLSearchParams({
          date: form.travelDate,
          destination: form.destination,
          bookingMode: form.bookingMode,
          isRoundTrip: String(form.isRoundTrip),
        })

        if (form.bookingMode === 'group') {
          params.set('vehicleType', form.vehicleType)
        }

        const res = await fetch(`/api/shuttle/availability?${params.toString()}`)
        const data = await res.json()
        if (!res.ok || !Array.isArray(data.availableSlots)) {
          throw new Error('availability_error')
        }
        if (!cancelled) {
          setAvailableSlots(data.availableSlots)
          if (form.pickupTime && !data.availableSlots.includes(form.pickupTime)) {
            setForm((prev) => ({ ...prev, pickupTime: '' }))
          }
        }
      } catch {
        if (!cancelled) {
          setAvailableSlots(null)
        }
      }
    }

    loadAvailability()
    return () => {
      cancelled = true
    }
  }, [form.travelDate, form.destination, form.bookingMode, form.vehicleType, form.isRoundTrip])

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 mb-2">
            {t('title')}
          </h1>
          <p className="text-ocean-700 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── Section 1: Detalles del viaje ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionTitle>{tf('section1')}</SectionTitle>

              {/* Booking mode */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ocean-950 mb-2">
                  {tf('bookingMode')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: 'solo' as BookingMode, labelKey: 'solo', subKey: 'soloSub', icon: UserCheck },
                      { value: 'group' as BookingMode, labelKey: 'group', subKey: 'groupSub', icon: UsersRound },
                    ] as const
                  ).map(({ value, labelKey, subKey, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setBookingMode(value)}
                      className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                        form.bookingMode === value
                          ? 'border-ocean-600 bg-ocean-50'
                          : 'border-gray-200 bg-white hover:border-ocean-300'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 mt-0.5 shrink-0 ${
                          form.bookingMode === value ? 'text-ocean-600' : 'text-gray-400'
                        }`}
                      />
                      <div className="text-left">
                        <p
                          className={`font-semibold text-sm ${
                            form.bookingMode === value ? 'text-ocean-800' : 'text-gray-700'
                          }`}
                        >
                          {tf(labelKey)}
                        </p>
                        <p className="text-xs text-gray-500">{tf(subKey)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ocean-950 mb-2">
                  {tf('destination')}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {destinations.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => set('destination', key)}
                      className={`text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        form.destination === key
                          ? 'border-ocean-600 bg-ocean-50 text-ocean-800'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-ocean-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle type — only for group */}
              {form.bookingMode === 'group' && (
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-ocean-950 mb-2">
                    {tf('vehicleType')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {(
                      [
                        { value: 'suv' as VehicleType, labelKey: 'suv', subKey: 'suvSub', modelsKey: 'suvModels', icon: Car },
                        { value: 'pickup' as VehicleType, labelKey: 'pickup', subKey: 'pickupSub', modelsKey: 'pickupModels', icon: Truck },
                      ] as const
                    ).map(({ value, labelKey, subKey, modelsKey, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVehicleType(value)}
                        className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                          form.vehicleType === value
                            ? 'border-ocean-600 bg-ocean-50'
                            : 'border-gray-200 bg-white hover:border-ocean-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mt-0.5 shrink-0 ${
                            form.vehicleType === value ? 'text-ocean-600' : 'text-gray-400'
                          }`}
                        />
                        <div className="text-left">
                          <p
                            className={`font-semibold text-sm ${
                              form.vehicleType === value ? 'text-ocean-800' : 'text-gray-700'
                            }`}
                          >
                            {tf(labelKey)}
                          </p>
                          <p className="text-xs text-gray-500">{tf(subKey)}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{tf(modelsKey)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trip type */}
              <div>
                <label className="block text-sm font-semibold text-ocean-950 mb-2">
                  {tf('tripType')}
                </label>
                <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden w-fit">
                  {[
                    { value: false, labelKey: 'oneWay', icon: ArrowRight },
                    { value: true, labelKey: 'roundTrip', icon: ArrowLeftRight },
                  ].map(({ value, labelKey, icon: Icon }) => (
                    <button
                      key={labelKey}
                      type="button"
                      onClick={() => set('isRoundTrip', value)}
                      className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all ${
                        form.isRoundTrip === value
                          ? 'bg-ocean-950 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tf(labelKey as 'oneWay' | 'roundTrip')}
                    </button>
                  ))}
                </div>
                {form.isRoundTrip && (
                  <p className="text-ocean-600 text-xs mt-1.5">
                    {form.bookingMode === 'solo'
                      ? tf('roundTripNoteShared')
                      : tf('roundTripNote', { amount: roundTripExtra! })}
                  </p>
                )}
              </div>
            </div>

            {/* ── Section 2: Fecha y pasajeros ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionTitle>{tf('section2')}</SectionTitle>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Travel date */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-ocean-400" />
                      {tf('date')}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayString()}
                      value={form.travelDate}
                      onChange={(e) => set('travelDate', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-ocean-950 bg-white focus:outline-none focus:ring-2 focus:ring-ocean-400 cursor-pointer appearance-none ${
                        errors.travelDate ? 'border-red-400' : 'border-gray-200'
                      } ${!form.travelDate ? 'text-gray-400' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.travelDate} />
                </div>

                {/* Pickup time — hour + minute selects */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-ocean-400" />
                      {tf('time')}
                    </span>
                  </label>
                  <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-ocean-400 ${
                    errors.pickupTime ? 'border-red-400' : 'border-gray-200'
                  }`}>
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                    <select
                      value={form.pickupTime ? form.pickupTime.split(':')[0] : ''}
                      onChange={(e) => {
                        const mins = form.pickupTime ? form.pickupTime.split(':')[1] : '00'
                        const newTime = e.target.value ? `${e.target.value}:${mins}` : ''
                        set('pickupTime', newTime)
                      }}
                      className="flex-1 text-sm text-ocean-950 bg-transparent focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>{tf('timeHourPlaceholder')}</option>
                      {HOURS.map(({ value, label }) => (
                        <option
                          key={value}
                          value={value}
                          disabled={
                            !!form.travelDate &&
                            availableSlots !== null &&
                            !MINUTES.some(({ value: m }) => availableSlotSet.has(`${value}:${m}`))
                          }
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-300 font-bold">:</span>
                    <select
                      value={form.pickupTime ? form.pickupTime.split(':')[1] : '00'}
                      onChange={(e) => {
                        const hrs = form.pickupTime ? form.pickupTime.split(':')[0] : ''
                        if (!hrs) return
                        set('pickupTime', `${hrs}:${e.target.value}`)
                      }}
                      className="w-16 text-sm text-ocean-950 bg-transparent focus:outline-none cursor-pointer"
                    >
                      {MINUTES.map(({ value, label }) => (
                        <option
                          key={value}
                          value={value}
                          disabled={
                            !!form.travelDate &&
                            !!selectedHour &&
                            availableSlots !== null &&
                            !availableSlotSet.has(`${selectedHour}:${value}`)
                          }
                        >
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <FieldError msg={errors.pickupTime} />
                  {form.travelDate && availableSlots?.length === 0 && (
                    <p className="text-amber-600 text-xs mt-1.5">{tf('noSlotsAvailable')}</p>
                  )}
                </div>

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-ocean-400" />
                      {tf('passengers')}
                    </span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => set('passengers', Math.max(minPassengers, form.passengers - 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-ocean-400 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-ocean-950 w-6 text-center">
                      {form.passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        set('passengers', Math.min(maxPassengers, form.passengers + 1))
                      }
                      className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-ocean-400 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-400">
                      {tf('passengersMax', { max: maxPassengers })}
                    </span>
                  </div>
                </div>

                {/* Flight number */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <PlaneTakeoff className="w-4 h-4 text-ocean-400" />
                      {tf('flightNumber')}{' '}
                      <span className="font-normal text-gray-400">({tf('optional')})</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={tf('flightPlaceholder')}
                    value={form.flightNumber}
                    onChange={(e) => set('flightNumber', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-ocean-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400"
                  />
                </div>
              </div>
            </div>

            {/* ── Section 3: Datos de contacto ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <SectionTitle>{tf('section3')}</SectionTitle>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-4 h-4 text-ocean-400" />
                      {tf('name')}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder={tf('namePlaceholder')}
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ocean-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 ${
                      errors.name ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={errors.name} />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-ocean-400" />
                      {tf('email')}
                    </span>
                  </label>
                  <input
                    type="email"
                    placeholder={tf('emailPlaceholder')}
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ocean-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 ${
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={errors.email} />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-ocean-400" />
                      {tf('whatsapp')}
                    </span>
                  </label>
                  <input
                    type="tel"
                    placeholder={tf('whatsappPlaceholder')}
                    value={form.whatsapp}
                    onChange={(e) => set('whatsapp', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ocean-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 ${
                      errors.whatsapp ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={errors.whatsapp} />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <StickyNote className="w-4 h-4 text-ocean-400" />
                      {tf('notes')}{' '}
                      <span className="font-normal text-gray-400">({tf('optional')})</span>
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder={tf('notesPlaceholder')}
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-ocean-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ocean-400 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* API error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
                {apiError}
              </div>
            )}

            {/* Mobile CTA */}
            <div className="lg:hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">{ts('totalLabel')}</p>
                  <p className="text-2xl font-extrabold text-ocean-950">${total} USD</p>
                  <p className="text-xs text-gray-400">
                    {ts('depositLabel')} ${Math.round(total * 0.5)} USD
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {DESTINATIONS[form.destination]}
                  <br />
                  {form.bookingMode === 'solo'
                    ? ts('soloLabel')
                    : form.vehicleType === 'suv'
                      ? ts('suv')
                      : ts('pickup')}{' '}
                  · {form.isRoundTrip ? ts('roundTrip') : ts('oneWay')}
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-coral text-white font-bold text-sm transition-all hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? ts('processing') : ts('continue')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── RIGHT: Price summary (desktop) ── */}
          <div className="hidden lg:block">
            <PriceSummary form={form} total={total} onSubmit={handleSubmit} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
