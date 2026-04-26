'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Car,
  Truck,
  ArrowRight,
  ArrowLeftRight,
  Waves,
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
} from 'lucide-react'
import { calculateShuttlePrice, DESTINATIONS } from '@/lib/pricing'
import type { Destination, VehicleType } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  destination: Destination
  vehicleType: VehicleType
  isRoundTrip: boolean
  hasSurfboard: boolean
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
  const vehicleLabel = form.vehicleType === 'sedan' ? t('sedan') : t('suv')

  const lineItems = [
    {
      label: t('shuttleTo', { destination: destLabel, vehicle: vehicleLabel }),
      amount:
        form.vehicleType === 'sedan'
          ? { 'puerto-la-libertad': 35, 'el-tunco': 40, 'el-sunzal': 40, 'el-zonte': 45 }[form.destination]
          : { 'puerto-la-libertad': 45, 'el-tunco': 50, 'el-sunzal': 50, 'el-zonte': 55 }[form.destination],
    },
    form.isRoundTrip
      ? { label: t('roundTripLine'), amount: form.vehicleType === 'sedan' ? 25 : 30 }
      : null,
    form.hasSurfboard && form.vehicleType === 'sedan'
      ? { label: t('surfboardLine'), amount: 5 }
      : null,
  ].filter(Boolean) as { label: string; amount: number }[]

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
        {lineItems.map((item) => (
          <div key={item.label} className="flex justify-between">
            <span className="text-ocean-300">{item.label}</span>
            <span className="font-semibold">${item.amount} USD</span>
          </div>
        ))}
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
        {[
          t('privateDriver'),
          t('nameSign'),
          t('luggage'),
          form.vehicleType === 'suv' ? t('surfboardSuv') : null,
        ]
          .filter(Boolean)
          .map((item) => (
            <li key={item} className="flex items-center gap-2 text-ocean-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-ocean-400 shrink-0" />
              {item}
            </li>
          ))}
      </ul>

      <button
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

  const [form, setForm] = useState<FormData>({
    destination: 'el-tunco',
    vehicleType: 'sedan',
    isRoundTrip: false,
    hasSurfboard: false,
    travelDate: '',
    pickupTime: '',
    passengers: 2,
    flightNumber: '',
    name: '',
    email: '',
    whatsapp: '',
    notes: '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const total = useMemo(
    () =>
      calculateShuttlePrice({
        destination: form.destination,
        vehicleType: form.vehicleType,
        isRoundTrip: form.isRoundTrip,
        hasSurfboard: form.hasSurfboard,
      }),
    [form.destination, form.vehicleType, form.isRoundTrip, form.hasSurfboard],
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
    setLoading(true)
    // TODO: crear sesión de Stripe → redirigir a checkout
    await new Promise((r) => setTimeout(r, 1200))
    alert(
      `Booking ready!\nTotal: $${total} USD\nDeposit: $${Math.round(total * 0.5)} USD\n\n(Stripe checkout coming soon)`,
    )
    setLoading(false)
  }

  const destinations = Object.entries(DESTINATIONS) as [Destination, string][]

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

              {/* Vehicle type */}
              <div className="mb-5">
                <label className="block text-sm font-semibold text-ocean-950 mb-2">
                  {tf('vehicleType')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: 'sedan' as VehicleType, labelKey: 'sedan', subKey: 'sedanSub', icon: Car },
                      { value: 'suv' as VehicleType, labelKey: 'suv', subKey: 'suvSub', icon: Truck },
                    ] as const
                  ).map(({ value, labelKey, subKey, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        set('vehicleType', value)
                        if (value === 'suv') set('hasSurfboard', false)
                      }}
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
                        <p className={`font-semibold text-sm ${form.vehicleType === value ? 'text-ocean-800' : 'text-gray-700'}`}>
                          {tf(labelKey)}
                        </p>
                        <p className="text-xs text-gray-500">{tf(subKey)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip type */}
              <div className="mb-5">
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
                    {tf('roundTripNote', { amount: form.vehicleType === 'sedan' ? 25 : 30 })}
                  </p>
                )}
              </div>

              {/* Surfboard — solo sedan */}
              {form.vehicleType === 'sedan' && (
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-2">
                    {tf('surfboard')}
                  </label>
                  <button
                    type="button"
                    onClick={() => set('hasSurfboard', !form.hasSurfboard)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      form.hasSurfboard
                        ? 'border-ocean-600 bg-ocean-50'
                        : 'border-gray-200 bg-white hover:border-ocean-300'
                    }`}
                  >
                    <Waves className={`w-5 h-5 ${form.hasSurfboard ? 'text-ocean-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className={`font-semibold text-sm ${form.hasSurfboard ? 'text-ocean-800' : 'text-gray-700'}`}>
                        {tf('surfboardYes')}
                      </p>
                      <p className="text-xs text-gray-500">{tf('surfboardNote')}</p>
                    </div>
                    <div
                      className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        form.hasSurfboard ? 'border-ocean-600 bg-ocean-600' : 'border-gray-300'
                      }`}
                    >
                      {form.hasSurfboard && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                    </div>
                  </button>
                </div>
              )}
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
                  <input
                    type="date"
                    min={todayString()}
                    value={form.travelDate}
                    onChange={(e) => set('travelDate', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ocean-950 focus:outline-none focus:ring-2 focus:ring-ocean-400 ${
                      errors.travelDate ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={errors.travelDate} />
                </div>

                {/* Pickup time */}
                <div>
                  <label className="block text-sm font-semibold text-ocean-950 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-ocean-400" />
                      {tf('time')}
                    </span>
                  </label>
                  <input
                    type="time"
                    value={form.pickupTime}
                    onChange={(e) => set('pickupTime', e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ocean-950 focus:outline-none focus:ring-2 focus:ring-ocean-400 ${
                      errors.pickupTime ? 'border-red-400' : 'border-gray-200'
                    }`}
                  />
                  <FieldError msg={errors.pickupTime} />
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
                      onClick={() => set('passengers', Math.max(1, form.passengers - 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-ocean-400 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-ocean-950 w-6 text-center">
                      {form.passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => set('passengers', Math.min(4, form.passengers + 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-ocean-400 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-400">{tf('passengersMax')}</span>
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
                  {DESTINATIONS[form.destination]}<br />
                  {form.vehicleType === 'sedan' ? ts('sedan') : ts('suv')}{' '}
                  · {form.isRoundTrip ? ts('roundTrip') : ts('oneWay')}
                </div>
              </div>
              <button
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
