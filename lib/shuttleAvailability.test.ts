import { describe, it, expect } from 'vitest'
import { isBookableDay, isBookableDateString } from './shuttleAvailability'

describe('isBookableDay', () => {
  it('rejects Friday', () => {
    expect(isBookableDay(new Date('2026-08-07T12:00:00'))).toBe(false)
  })

  it('accepts Saturday', () => {
    expect(isBookableDay(new Date('2026-08-08T12:00:00'))).toBe(true)
  })

  it('accepts Sunday', () => {
    expect(isBookableDay(new Date('2026-08-09T12:00:00'))).toBe(true)
  })

  it('rejects Monday', () => {
    expect(isBookableDay(new Date('2026-08-10T12:00:00'))).toBe(false)
  })
})

describe('isBookableDateString (timezone safety)', () => {
  // parseISO reads 'YYYY-MM-DD' as LOCAL midnight, and getDay() also reads in
  // local time — both ends agree, so this is stable across server timezones.
  // A raw `new Date('2026-08-08')` parses as UTC midnight instead, which in a
  // negative-UTC-offset timezone (e.g. America/El_Salvador, UTC-6) reads back
  // as Friday — that mismatch is exactly the bug isBookableDateString exists
  // to prevent by always going through parseISO.
  it('accepts a Saturday YYYY-MM-DD string', () => {
    expect(isBookableDateString('2026-08-08')).toBe(true)
  })

  it('rejects a Friday YYYY-MM-DD string', () => {
    expect(isBookableDateString('2026-08-07')).toBe(false)
  })
})
