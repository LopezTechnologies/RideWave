'use client'

import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { format, parseISO, startOfToday } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { isBookableDay } from '@/lib/shuttleAvailability'

export default function ShuttleDatePicker({
  value,
  onChange,
  locale,
  error,
}: {
  value: string
  onChange: (value: string) => void
  locale: 'es' | 'en'
  error?: boolean
}) {
  const selected = value ? parseISO(value) : undefined

  return (
    <div
      style={
        {
          '--rdp-accent-color': '#0284c7',
          '--rdp-accent-background-color': '#e0f7ff',
          '--rdp-today-color': '#0284c7',
        } as React.CSSProperties
      }
      className={`rounded-xl border p-2 bg-white ${
        error ? 'border-red-400' : 'border-gray-200'
      }`}
    >
      <DayPicker
        mode="single"
        locale={locale === 'es' ? es : enUS}
        selected={selected}
        onSelect={(date) => onChange(date ? format(date, 'yyyy-MM-dd') : '')}
        disabled={[{ before: startOfToday() }, (date: Date) => !isBookableDay(date)]}
      />
    </div>
  )
}
