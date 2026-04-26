# CLAUDE.md — La Libertad Shuttle & Surf Tours

## Descripción del Proyecto

Plataforma web de reservas para traslados privados desde el Aeropuerto Internacional de El Salvador (SAL) hacia La Libertad y sus playas, además de tours guiados a spots de surf. Servicio boutique para grupos pequeños (máx. 4 personas), orientado a surfers y turistas internacionales.

**Negocio:** Puerto de La Libertad, El Salvador  
**Idiomas:** Español + Inglés  
**Dominio objetivo:** lalibertadshuttle.com (o similar)

---

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Estilos:** Tailwind CSS
- **Base de datos:** Supabase (PostgreSQL)
- **Autenticación:** Supabase Auth (solo panel admin)
- **Pagos:** Stripe
- **Emails:** Resend
- **WhatsApp:** Twilio (fase 2)
- **Deploy:** Vercel
- **Lenguaje:** TypeScript

---

## Estructura de Carpetas

```
/
├── app/
│   ├── (public)/
│   │   ├── page.tsx              # Home
│   │   ├── shuttle/page.tsx      # Booking de shuttle
│   │   ├── tours/page.tsx        # Listado de tours
│   │   ├── tours/[slug]/page.tsx # Detalle de tour
│   │   └── confirm/page.tsx      # Confirmación de reserva
│   ├── (admin)/
│   │   ├── admin/page.tsx        # Dashboard admin
│   │   └── admin/bookings/page.tsx
│   └── api/
│       ├── bookings/route.ts     # Crear reserva
│       ├── tours/route.ts
│       └── stripe/webhook/route.ts
├── components/
│   ├── ui/                       # Componentes base (Button, Input, etc.)
│   ├── booking/                  # BookingForm, PriceSummary, DatePicker
│   ├── tours/                    # TourCard, TourGallery
│   └── layout/                   # Header, Footer, Nav
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   ├── resend.ts
│   └── pricing.ts                # Lógica de cálculo de precios
├── types/
│   └── index.ts                  # Tipos globales (Booking, Tour, Vehicle, etc.)
└── public/
    └── images/                   # Fotos de playas, olas, vehículos
```

---

## Modelos de Base de Datos

### bookings
```sql
id              UUID PRIMARY KEY
service_type    TEXT  -- 'shuttle' | 'tour'
status          TEXT  -- 'pending' | 'confirmed' | 'completed' | 'cancelled'
customer_name   TEXT
customer_email  TEXT
customer_whatsapp TEXT
flight_number   TEXT
travel_date     DATE
pickup_time     TIMESTAMPTZ
passengers      INT
has_surfboard   BOOLEAN DEFAULT false
vehicle_type    TEXT  -- 'sedan' | 'suv'
origin          TEXT  -- 'airport' | custom address
destination     TEXT
price_usd       DECIMAL(10,2)
deposit_paid    DECIMAL(10,2)
stripe_session_id TEXT
notes           TEXT
created_at      TIMESTAMPTZ DEFAULT now()
```

### tours
```sql
id          UUID PRIMARY KEY
slug        TEXT UNIQUE
name_es     TEXT
name_en     TEXT
description_es TEXT
description_en TEXT
duration_hours INT
max_people  INT DEFAULT 4
price_usd   DECIMAL(10,2)
includes    JSONB  -- array de strings
images      JSONB  -- array de URLs
active      BOOLEAN DEFAULT true
```

### tour_bookings
```sql
id          UUID PRIMARY KEY
tour_id     UUID REFERENCES tours(id)
booking_id  UUID REFERENCES bookings(id)
tour_date   DATE
time_slot   TEXT
```

---

## Lógica de Precios (lib/pricing.ts)

```typescript
const PRICES = {
  shuttle: {
    sedan: {
      'puerto-la-libertad': 35,
      'el-tunco': 40,
      'el-sunzal': 40,
      'el-zonte': 45,
    },
    suv: {
      'puerto-la-libertad': 45,
      'el-tunco': 50,
      'el-sunzal': 50,
      'el-zonte': 55,
    }
  },
  roundTripExtra: { sedan: 25, suv: 30 },
  surfboardExtra: 5  // solo sedan
}
```

---

## Variables de Entorno (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend (emails)
RESEND_API_KEY=
EMAIL_FROM=reservas@lalibertadshuttle.com

# Twilio WhatsApp (fase 2)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAIL=tu@email.com
```

---

## Convenciones de Código

- **TypeScript estricto** — no usar `any`
- **Server Components por defecto** — usar `'use client'` solo cuando necesario (forms, interactividad)
- **Tailwind para estilos** — no CSS modules salvo excepciones
- **Nombres en inglés** para código (variables, funciones, componentes)
- **Comentarios en español** cuando ayudan a entender lógica de negocio
- **Zod** para validación de formularios y API routes
- **date-fns** para manejo de fechas

---

## Comandos Frecuentes

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # ESLint
npx supabase gen types --local  # Generar tipos desde Supabase
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Test webhooks
```

---

## Flujo de Reserva (Shuttle)

1. Usuario llena `BookingForm` en `/shuttle`
2. Se llama `POST /api/bookings` → crea registro en Supabase con status `pending`
3. Se crea Stripe Checkout Session → redirige al usuario
4. Stripe webhook confirma pago → actualiza status a `confirmed`
5. Se envía email de confirmación con Resend
6. Admin ve la reserva en el panel `/admin`

---

## Notas Importantes de Negocio

- **Aeropuerto:** Aeropuerto Internacional Monseñor Óscar Arnulfo Romero (SAL / IATA: SAL), Comalapa, ~45 min de La Libertad
- **Destinos principales:** Puerto de La Libertad, El Tunco, El Sunzal, El Zonte, Conchalío
- **Spots de surf clave:** Punta Roca (ola de clase mundial, derecha), El Sunzal, El Zonte, Las Flores, Mizata
- **Temporada alta de surf:** Abril–Octubre (swells del Pacífico)
- **Moneda:** USD (El Salvador dolarizado desde 2001 — ventaja para cobros internacionales)
- **WhatsApp** es el canal de comunicación principal en El Salvador — priorizar integración

---

## TODO — Fase 1 MVP

- [ ] Setup Next.js + Tailwind + Supabase
- [ ] Diseño Home page (hero con foto Punta Roca, CTAs)
- [ ] Formulario de reserva shuttle con cálculo de precio en tiempo real
- [ ] Integración Stripe (checkout + webhook)
- [ ] Email de confirmación con Resend
- [ ] Panel admin básico (lista de reservas del día)
- [ ] Deploy en Vercel
- [ ] Dominio + SSL

## TODO — Fase 2

- [ ] Página de tours con galería
- [ ] Booking de tours
- [ ] Integración WhatsApp (confirmación automática)
- [ ] Google Maps en página de contacto/destinos
- [ ] Reseñas / testimonio widget
- [ ] Versión en inglés (i18n con next-intl)
