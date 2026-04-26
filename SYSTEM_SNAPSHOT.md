# Ridewave - System Snapshot

This file documents the current implementation so the same system can be replicated in a new commercial copy for other entrepreneurs.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (DB + admin service role usage in API routes)
- PayPal checkout/capture flow
- Resend email confirmations
- next-intl (ES/EN translations)

## Main Functional Modules

- Public booking form: `components/shuttle/ShuttleForm.tsx`
- Checkout API: `app/api/checkout/route.ts`
- PayPal capture API: `app/api/paypal/capture/route.ts`
- Availability API (UI slot disabling): `app/api/shuttle/availability/route.ts`
- Admin dashboard: `app/admin/page.tsx`
- Availability domain logic: `lib/shuttleAvailability.ts`
- Pricing rules: `lib/pricing.ts`
- Supabase clients: `lib/supabase.ts`
- Mock store for local testing: `lib/mockStore.ts`

## Booking Flow (Current)

1. User fills shuttle form and submits.
2. `POST /api/checkout`:
   - validates payload,
   - calculates price/deposit,
   - checks overlap/conflicts against existing bookings,
   - returns PayPal approval URL (or direct success URL when `MOCK_MODE=true`).
3. User returns from PayPal success page and capture is triggered.
4. `POST /api/paypal/capture`:
   - captures order (unless mock),
   - re-checks availability (double validation),
   - persists booking in DB (or in-memory mock store),
   - sends confirmation email.

## Availability & No-Overlap Logic

Core file: `lib/shuttleAvailability.ts`

- Uses a blocked window model:
  - pre-pickup buffer: 45 min
  - travel duration by destination
  - return duration (same mapping, if round-trip)
  - post buffer: 20 min
- Conflict rule:
  - overlap exists if `a.start < b.end && b.start < a.end`
- DB check currently queries shuttle bookings in active statuses:
  - `pending`, `confirmed`, `completed`

### Concurrency Protection

- Preferred atomic path via DB RPC: `reserve_shuttle_booking_atomic`
- SQL definition stored in: `supabase/booking_availability.sql`
- If RPC is missing, capture route falls back to check + insert flow.

## UI Availability Reflection

- `ShuttleForm` calls:
  - `GET /api/shuttle/availability?date=...&destination=...&bookingMode=...&vehicleType=...&isRoundTrip=...`
- Response shape:
  - `{ availableSlots: string[] }`, slot format `HH:mm`
- Hour/minute selects disable unavailable options.
- If selected time becomes unavailable after a parameter change, form resets `pickupTime`.

## Admin Dashboard (Current)

Route: `/admin`

- Cookie auth using `ADMIN_PASSWORD`
- Lists today and upcoming bookings
- Shows booking card details (customer, destination, time, pax, notes, payment, WhatsApp quick action)
- Shows operational blocked window on each card:
  - `Bloque ocupado: HH:mm - HH:mm`

## Environment Variables

Required in practice (do not commit real values):

- App/Auth:
  - `NEXT_PUBLIC_APP_URL`
  - `ADMIN_PASSWORD`
  - `MOCK_MODE`
- Supabase:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- PayPal:
  - `PAYPAL_MODE`
  - `PAYPAL_CLIENT_ID`
  - `PAYPAL_CLIENT_SECRET`
- Email:
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `RESEND_TEST_EMAIL`

## Replication Checklist (for productized copy)

1. Copy codebase to new project.
2. Create new branding/theme/assets.
3. Create isolated Supabase project per client.
4. Apply SQL function from `supabase/booking_availability.sql`.
5. Configure client-specific `.env.local` and production secrets.
6. Configure PayPal credentials for that client.
7. Configure Resend domain/sender for that client.
8. Verify end-to-end:
   - booking creation,
   - conflict blocking,
   - availability slots disabled in UI,
   - admin login and booking visibility,
   - email confirmation.

## Multi-Tenant/Product Notes

- Keep this baseline as a template branch.
- Never reuse service-role keys across clients.
- Never share booking tables between clients unless explicit multi-tenant schema isolation is implemented.
- Recommended: one Supabase project per client for strongest isolation.
