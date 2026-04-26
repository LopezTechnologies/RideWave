# Cotización — Sistema de Reservas para Shuttle & Tours
**Ridewave · Plataforma de Traslados y Tours de Surf**

---

## ¿Qué incluye el sistema?

| Módulo | Descripción |
|---|---|
| Landing page | Home con hero, servicios, destinos, testimonials, CTA WhatsApp |
| Formulario de reserva | Privado / Individual con precios en tiempo real |
| Procesador de pagos | 50% depósito online, balance en destino |
| Confirmación por email | Email automático al cliente al confirmar pago |
| Panel admin | Lista de reservas del día y próximas, botón WhatsApp directo |
| Bilingüe ES / EN | Detección automática de idioma, switch manual |
| Diseño responsive | Mobile, tablet y desktop |
| SEO básico | Metadata dinámica por página e idioma |
| Página Tours | Coming soon con teaser de spots |

---

## Costo de Desarrollo (cobro único)

> Rangos según el perfil del cliente y mercado objetivo.

### Opción A — Precio de entrada (startups / negocios locales)
| Concepto | Horas est. | Tarifa | Total |
|---|---|---|---|
| Diseño UI/UX + brand | 8 h | $35/h | $280 |
| Frontend (páginas + form) | 16 h | $35/h | $560 |
| Backend (APIs + pagos + email) | 12 h | $35/h | $420 |
| Base de datos + admin | 8 h | $35/h | $280 |
| i18n + SEO + deploy | 6 h | $35/h | $210 |
| **TOTAL** | **50 h** | | **$1,750 USD** |

### Opción B — Precio de mercado (negocios establecidos / turismo)
| Concepto | Horas est. | Tarifa | Total |
|---|---|---|---|
| Diseño UI/UX + brand | 8 h | $55/h | $440 |
| Frontend (páginas + form) | 16 h | $55/h | $880 |
| Backend (APIs + pagos + email) | 12 h | $55/h | $660 |
| Base de datos + admin | 8 h | $55/h | $440 |
| i18n + SEO + deploy | 6 h | $55/h | $330 |
| **TOTAL** | **50 h** | | **$2,750 USD** |

### Opción C — Precio premium (agencias / clientes internacionales)
**$4,500 – $6,000 USD** (precio por proyecto, sin desglose de horas)

---

## Costos Mensuales de Operación (cliente paga)

Estos son los costos recurrentes que el cliente asume después de la entrega.

| Servicio | Plan recomendado | Costo/mes | Notas |
|---|---|---|---|
| **Vercel** (hosting) | Pro | $20 | Hobby no permitido para uso comercial |
| **Supabase** (base de datos) | Pro | $25 | Free tier funciona para MVP (<500 MB) |
| **Resend** (emails) | Free / Pro | $0 – $20 | Free = 3,000 emails/mes — suficiente al inicio |
| **Dominio .com** | — | ~$1.25 | ~$15/año en Namecheap o similar |
| **TOTAL MÍNIMO** | | **~$46/mes** | Con Supabase free + Resend free |
| **TOTAL RECOMENDADO** | | **~$66/mes** | Con todos en pro |

---

## Comisiones del Procesador de Pagos

### PayPal (recomendado para El Salvador)
- **Tarifa estándar:** 3.49% + $0.49 por transacción
- **Ejemplo:** Depósito de $25 USD → PayPal cobra ~$1.37 → el negocio recibe ~$23.63
- Sin costo mensual fijo. Solo paga cuando cobra.
- Requiere cuenta PayPal Business verificada.

### Alternativas según el mercado del cliente

| Procesador | Disponible en | Tarifa aprox. | Notas |
|---|---|---|---|
| **PayPal** | Global | 3.49% + $0.49 | Lo más simple para El Salvador |
| **Stripe** | USA / Europa / MX | 2.9% + $0.30 | No disponible para cobrar en SV directamente |
| **Wompi** | Colombia, algunos LA | 2.9% + $900 COP | Buena opción si el cliente opera en CO |
| **Mercado Pago** | Argentina, MX, BR, CO | 3.29% – 4.99% | Depende del país |
| **Clip** | México | 3.6% | Solo para negocios MX |

> **Recomendación:** Para negocios de turismo en El Salvador que reciben pagos de clientes internacionales, **PayPal es la opción más pragmática para el MVP.** A futuro, si el volumen crece, vale la pena evaluar Stripe con una entidad legal en USA o Panamá.

---

## Resumen para el cliente

| Concepto | Monto |
|---|---|
| Desarrollo (cobro único) | $1,750 – $4,500 USD |
| Hosting + servicios / mes | ~$46 – $66 USD |
| Comisión PayPal por venta | 3.49% + $0.49 |

### Ejemplo real de flujo de dinero
> Shuttle a El Zonte, SUV, one-way → **$55 USD total**
> - Depósito online (50%): **$27.50**
> - PayPal cobra: ~$1.45 → negocio recibe **~$26.05**
> - Balance en destino (cash): **$27.50**
> - **El negocio recibe $53.55 netos por reserva** (~97.4%)

---

## Qué NO incluye esta versión (upsells futuros)

| Feature | Costo estimado adicional |
|---|---|
| Booking de Tours completo | $800 – $1,200 |
| Integración WhatsApp automático (Twilio) | $400 – $600 |
| Google Calendar para el driver | $300 – $500 |
| Pasarela de pago alternativa (Stripe via LLC) | $500 – $800 |
| App móvil (React Native) | $3,000 – $6,000 |
| Multi-negocio / SaaS | Proyecto separado |

---

*Documento preparado por Lopez Technologies · lopeztech.sv@gmail.com*
