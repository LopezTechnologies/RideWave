# Shuttle Solo Fines de Semana — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restrict shuttle bookings to Saturday/Sunday only, enforced both in the UI (calendar) and server-side (API), while operating on `feature/shuttle-weekend-only`.

**Architecture:** A single pure function `isBookableDay`/`isBookableDateString` in `lib/shuttleAvailability.ts` is the one source of truth for which days are bookable. A new `ShuttleDatePicker` component (wrapping `react-day-picker`) consumes it to grey out weekdays in the calendar UI. Both `checkout` and `availability` API routes consume the same function to reject/short-circuit weekday requests server-side, independent of the UI.

**Tech Stack:** Next.js 14 App Router, TypeScript, `date-fns` v4 (already installed), `react-day-picker` v10 (new), Vitest (new, for the one pure-function unit test the spec calls for — no test runner exists in this repo yet).

Spec: `docs/superpowers/specs/2026-08-06-weekend-only-shuttle-design.md`

## Global Constraints

- Bookable days: `DIAS_HABILITADOS = [0, 6]` (domingo=0, sábado=6, per `date-fns getDay()`) — temporary, changed by editing the constant + redeploy, no admin UI.
- Scope: shuttle booking flow only. Tours has no booking flow yet — out of scope.
- Any conversion from a `'YYYY-MM-DD'` string to a `Date` MUST use `date-fns parseISO`, never a raw `new Date(string)` — the latter parses as UTC midnight and can read back as the wrong local day (see spec's Timezone section).
- API error text for `DAY_NOT_BOOKABLE` follows the **existing convention already used for `TIME_SLOT_UNAVAILABLE`** in `app/api/checkout/route.ts` (hardcoded bilingual string picked by `data.locale === 'es'`, returned inline in the JSON error response) — this repo does not source server-side API error text from `messages/*.json`, so this plan does not touch those files, despite the spec mentioning them. This is a deliberate deviation from the spec's literal wording to match the codebase's actual established pattern.
- `react-day-picker` version: `^10.0.1` (legacy package name `react-day-picker`, not the newer `@daypicker/react` rename — same v10 API, well-documented, avoids introducing an unfamiliar package name). Depends on `date-fns@^4.1.0`, which matches this project's installed version.

---

### Task 1: `isBookableDay` / `isBookableDateString` in `lib/shuttleAvailability.ts`

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add `vitest` devDependency + `"test"` script)
- Modify: `lib/shuttleAvailability.ts`
- Test: `lib/shuttleAvailability.test.ts`

**Interfaces:**
- Produces: `DIAS_HABILITADOS: number[]`, `isBookableDay(date: Date): boolean`, `isBookableDateString(travelDate: string): boolean` — all exported from `lib/shuttleAvailability.ts`. Tasks 2, 3, 4 import these.

- [x] **Step 1: Install Vitest**

Run: `npm install -D vitest`

- [x] **Step 2: Add the test script to `package.json`**

In the `"scripts"` block of `package.json`, add:

```json
"test": "vitest run"
```

- [x] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [x] **Step 4: Write the failing test**

Create `lib/shuttleAvailability.test.ts`:

```ts
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
```

- [x] **Step 5: Run the test to verify it fails**

Run: `npx vitest run lib/shuttleAvailability.test.ts`
Expected: FAIL — `isBookableDay` and `isBookableDateString` are not exported yet.

- [x] **Step 6: Implement `isBookableDay` and `isBookableDateString`**

In `lib/shuttleAvailability.ts`, change the top import line:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
```

to:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import { getDay, parseISO } from 'date-fns'
```

Then add, right after the existing `ROUND_TRIP_RETURN_MINUTES` constant (before `export type ShuttleBookingLike`):

```ts
// domingo=0, sábado=6 — per date-fns getDay(). Temporary while the operator
// runs weekends-only; change this array + redeploy to open more days.
export const DIAS_HABILITADOS = [0, 6]

export function isBookableDay(date: Date): boolean {
  return DIAS_HABILITADOS.includes(getDay(date))
}

export function isBookableDateString(travelDate: string): boolean {
  return isBookableDay(parseISO(travelDate))
}
```

- [x] **Step 7: Run the test to verify it passes**

Run: `npx vitest run lib/shuttleAvailability.test.ts`
Expected: PASS — 6 tests green.

- [x] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/shuttleAvailability.ts lib/shuttleAvailability.test.ts
git commit -m "feat: add isBookableDay/isBookableDateString for weekend-only shuttle rule"
```

---

### Task 2: `ShuttleDatePicker` component

**Files:**
- Modify: `package.json` (add `react-day-picker` dependency)
- Create: `components/shuttle/ShuttleDatePicker.tsx`

**Interfaces:**
- Consumes: `isBookableDay(date: Date): boolean` from Task 1 (`@/lib/shuttleAvailability`).
- Produces: default-exported React component
  `ShuttleDatePicker({ value: string, onChange: (value: string) => void, locale: 'es' | 'en', error?: boolean })`
  — `value`/`onChange` use the same `'YYYY-MM-DD'` string shape `ShuttleForm.tsx` already keeps in `form.travelDate`. Task 3 imports and renders this component.

- [x] **Step 1: Install `react-day-picker`**

Run: `npm install react-day-picker@^10.0.1`

- [x] **Step 2: Create the component**

Create `components/shuttle/ShuttleDatePicker.tsx`:

```tsx
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
```

- [x] **Step 3: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors. (No automated render test — per the spec's own Testing section, `react-day-picker` is a mature library not worth testing at the render level; Task 3's manual browser check is the verification for actual calendar behavior.)

- [x] **Step 4: Commit**

```bash
git add package.json package-lock.json components/shuttle/ShuttleDatePicker.tsx
git commit -m "feat: add ShuttleDatePicker component with weekday dates disabled"
```

---

### Task 3: Wire `ShuttleDatePicker` into `ShuttleForm`

**Files:**
- Modify: `components/shuttle/ShuttleForm.tsx`

**Interfaces:**
- Consumes: `ShuttleDatePicker` from Task 2 (`@/components/shuttle/ShuttleDatePicker`).

- [x] **Step 1: Import the component**

In `components/shuttle/ShuttleForm.tsx`, add near the top imports (after the `types` import):

```tsx
import ShuttleDatePicker from './ShuttleDatePicker'
```

- [x] **Step 2: Remove the now-unused `todayString` helper**

Delete this block (it's only used by the native date input being replaced):

```ts
function todayString() {
  return new Date().toISOString().split('T')[0]
}
```

- [x] **Step 3: Replace the native date input**

Find this block (inside "Section 2: Fecha y pasajeros", the "Travel date" `<div>`):

```tsx
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
```

Replace it with:

```tsx
                  <ShuttleDatePicker
                    value={form.travelDate}
                    onChange={(value) => set('travelDate', value)}
                    locale={locale as 'es' | 'en'}
                    error={!!errors.travelDate}
                  />
```

- [x] **Step 4: Verify it type-checks and builds**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors.

- [x] **Step 5: Manual browser check**

Run: `npm run dev`, open `http://localhost:3000/es/shuttle`.
Expected: the date field now renders a calendar (not a native date input). Monday–Friday dates are visibly greyed out and unclickable. Saturdays/Sundays (today or later) are selectable and, once picked, populate the pickup-time dropdown as before.

- [x] **Step 6: Commit**

```bash
git add components/shuttle/ShuttleForm.tsx
git commit -m "feat: replace native date input with ShuttleDatePicker in shuttle form"
```

---

### Task 4: Server-side enforcement in `checkout` and `availability` routes

**Files:**
- Modify: `app/api/checkout/route.ts`
- Modify: `app/api/shuttle/availability/route.ts`

**Interfaces:**
- Consumes: `isBookableDateString(travelDate: string): boolean` from Task 1 (`@/lib/shuttleAvailability`).

- [x] **Step 1: Reject weekday bookings in `checkout/route.ts`**

Change the import line:

```ts
import { checkShuttleConflictInSupabase } from '@/lib/shuttleAvailability'
```

to:

```ts
import { checkShuttleConflictInSupabase, isBookableDateString } from '@/lib/shuttleAvailability'
```

Then, right after `const data = schema.parse(body)` and before the `calculateShuttlePrice` call, add:

```ts
    if (!isBookableDateString(data.travelDate)) {
      return NextResponse.json(
        {
          error:
            data.locale === 'es'
              ? 'Por ahora solo operamos sábados y domingos. Elige una de esas fechas.'
              : 'We currently operate weekends only. Please choose a Saturday or Sunday.',
          code: 'DAY_NOT_BOOKABLE',
        },
        { status: 400 },
      )
    }
```

This check runs unconditionally (both mock and real mode) — unlike the existing Supabase conflict check a few lines below, which is skipped in mock mode, this one is a pure computation with no external dependency and must always apply.

- [x] **Step 2: Short-circuit weekday queries in `availability/route.ts`**

Change the import line:

```ts
import { findConflictingBooking } from '@/lib/shuttleAvailability'
```

to:

```ts
import { findConflictingBooking, isBookableDateString } from '@/lib/shuttleAvailability'
```

Then, right after the existing validation block:

```ts
    if (!date || !isDestination(destination) || !isBookingMode(bookingModeRaw)) {
      return NextResponse.json({ error: 'Invalid availability query' }, { status: 400 })
    }
```

add:

```ts

    if (!isBookableDateString(date)) {
      return NextResponse.json({ availableSlots: [] })
    }
```

- [x] **Step 3: Verify it type-checks and builds**

Run: `npx tsc --noEmit && npm run build`
Expected: no errors.

- [x] **Step 4: Manual verification — checkout rejects a weekday**

Start the dev server if not already running: `npm run dev`

Run (a Tuesday in 2026):

```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "destination":"el-tunco","bookingMode":"solo","isRoundTrip":false,
    "travelDate":"2026-08-11","pickupTime":"10:00","passengers":1,
    "name":"Weekday Test","email":"weekday@test.com","whatsapp":"+50370000000","locale":"es"
  }' -w "\nHTTP: %{http_code}\n"
```

Expected: `HTTP: 400` with `"code":"DAY_NOT_BOOKABLE"` — no PayPal order / mock success URL created.

- [x] **Step 5: Manual verification — checkout still accepts a weekend day**

```bash
curl -s -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "destination":"el-tunco","bookingMode":"solo","isRoundTrip":false,
    "travelDate":"2026-08-15","pickupTime":"10:00","passengers":1,
    "name":"Weekend Test","email":"weekend@test.com","whatsapp":"+50370000000","locale":"es"
  }' -w "\nHTTP: %{http_code}\n"
```

Expected: `HTTP: 200` with a `url` field (mock success URL).

- [x] **Step 6: Manual verification — availability returns empty for a weekday**

```bash
curl -s "http://localhost:3000/api/shuttle/availability?date=2026-08-11&destination=el-tunco&bookingMode=solo&vehicleType=suv&isRoundTrip=false" -w "\nHTTP: %{http_code}\n"
```

Expected: `HTTP: 200` with `{"availableSlots":[]}`.

- [x] **Step 7: Commit**

```bash
git add app/api/checkout/route.ts app/api/shuttle/availability/route.ts
git commit -m "feat: reject weekday shuttle bookings server-side"
```
