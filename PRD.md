# PRD — La Libertad Shuttle & Surf Tours Booking Platform

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Owner:** [Tu nombre]  
**Ubicación del negocio:** Puerto de La Libertad, El Salvador

---

## 1. Visión del Producto

Una plataforma web sencilla y atractiva que permita a turistas y surfers reservar traslados privados desde el Aeropuerto Internacional de El Salvador (SAL) hacia La Libertad y alrededores, así como tours guiados a los mejores spots de surf de la zona. El enfoque es **pequeños grupos (máx. 4 personas)**, experiencia personalizada, y un servicio de confianza para quienes visitan una de las mejores zonas de surf del mundo.

---

## 2. Problema que Resuelve

Los turistas que llegan al aeropuerto de El Salvador (a ~45 min de La Libertad) no tienen una opción confiable, fácil de reservar y orientada a viajeros independientes/surfers para llegar a su alojamiento. Los taxis informales generan desconfianza, los buses públicos no son aptos para viajeros con tablas de surf o equipaje pesado, y no existe un servicio boutique que combine traslado + experiencias locales de surf en un mismo lugar.

---

## 3. Usuarios Objetivo

- **Surfers internacionales** (EE.UU., Europa, Australia) que vienen a La Libertad, Punta Roca, El Sunzal, El Zonte, etc.
- **Turistas de playa** en parejas o grupos pequeños (hasta 4 personas)
- **Viajeros digitales nómadas** que buscan comodidad y confianza
- **Grupos de amigos** (2–4 personas) que viajan juntos

---

## 4. Servicios del Producto

### 4.1 Shuttle Aeropuerto ↔ La Libertad y alrededores
- **Ruta principal:** Aeropuerto SAL → Puerto de La Libertad, El Sunzal, El Tunco, El Zonte, Playa Conchalío
- **Vehículos:** Sedán (1–3 pax) / Pickup o SUV (1–4 pax con tablas de surf)
- **Opciones:** One-way o Round trip
- **Extras:** Equipaje de surf (+tabla), silla de bebé, parada en supermercado
- **Precios fijos y transparentes** por tramo (sin negociación)

### 4.2 Tours de Surf
- **Surf Spot Tour:** Visita guiada a 3–4 spots (Punta Roca, El Sunzal, Las Flores, El Zonte) en un día, con explicación de las olas, niveles, mareas
- **Surf & Culture Tour:** Mañana de surf + tarde en el mercado de mariscos del puerto, ceviche, pupusas
- **Sunrise Surf Session:** Transporte temprano a Punta Roca o El Sunzal para agarrar las mejores olas del amanecer
- **Multi-day Surf Itinerary:** Coordinación de hospedaje + traslados + spots para estadías de 3–7 días

### 4.3 Servicios Complementarios (ideas para expandir)
- **Beach Day Trips:** Traslados a playas menos conocidas (Mizata, Costa del Sol)
- **Fishing trips:** Salidas de pesca artesanal desde el puerto
- **Airport meet & greet:** El conductor espera con letrero en el aeropuerto
- **WhatsApp concierge:** Atención directa para preguntas sobre la zona
- **Partnerships:** Convenios con hostales (El Tunco Lodge, Mango's, etc.) para paquetes combinados

---

## 5. Funcionalidades del MVP

### Páginas principales
1. **Home** — Hero visual con foto de las olas + CTA de reserva
2. **Shuttle** — Formulario de reserva (fecha, hora de llegada, # pasajeros, destino, vuelo)
3. **Tours** — Cards de cada tour con descripción, precio, galería de fotos
4. **Booking Flow** — Selección de servicio → datos de pasajero → pago o reserva con depósito
5. **Confirmación** — Email + WhatsApp automático con detalles de la reserva
6. **About/Contact** — Historia del negocio, fotos del conductor/equipo, ubicación

### Funcionalidades técnicas MVP
- Formulario de reserva con calendario y selector de hora
- Cálculo automático de precio según destino y tipo de vehículo
- Pago en línea (Stripe o PayPal) o reserva con depósito vía transferencia/Zelle
- Panel de administración simple (ver reservas del día, confirmar, cancelar)
- Notificaciones automáticas vía email y/o WhatsApp (usando Twilio o WhatsApp Business API)
- Google Maps embed mostrando rutas y destinos
- Responsive design (mobile-first — la mayoría reservará desde el celular)

---

## 6. Flujo de Usuario Principal (Shuttle)

```
Usuario llega a la web
  → Selecciona "Shuttle from Airport"
  → Elige fecha y hora de llegada del vuelo
  → Elige destino (dropdown: Puerto La Libertad, El Tunco, El Sunzal, El Zonte, otro)
  → Elige # pasajeros (1–4) y si lleva tabla de surf
  → Ve precio total calculado automáticamente
  → Ingresa nombre, email, número de vuelo, WhatsApp
  → Paga (Stripe/PayPal) o reserva con 50% de depósito
  → Recibe confirmación por email y WhatsApp
  → El día del viaje: conductor llega al aeropuerto con letrero
```

---

## 7. Stack Técnico Recomendado

| Componente | Tecnología |
|---|---|
| Frontend | Next.js + Tailwind CSS |
| Backend / API | Next.js API routes o Node.js + Express |
| Base de datos | PostgreSQL (via Supabase — tiene free tier) |
| Autenticación admin | NextAuth.js o Supabase Auth |
| Pagos | Stripe (acepta tarjetas internacionales) |
| Emails | Resend o SendGrid |
| WhatsApp | Twilio o WhatsApp Business API |
| Deploy | Vercel (gratis para proyectos pequeños) |
| Dominio sugerido | `lalibertadshuttle.com` / `surftransferelsalvador.com` |

---

## 8. Precios de Referencia (para configurar en el sistema)

| Ruta | Sedán (1–3 pax) | SUV/Pickup (1–4 pax) |
|---|---|---|
| Aeropuerto → Puerto La Libertad | $35 | $45 |
| Aeropuerto → El Tunco / El Sunzal | $40 | $50 |
| Aeropuerto → El Zonte | $45 | $55 |
| Round trip (cualquier ruta) | +$25 | +$30 |
| Extra: tabla de surf | +$5 | incluido |

*Precios sugeridos — ajustar según mercado local*

---

## 9. Diseño y Branding

- **Paleta:** Azul océano, arena, verde palmera, blanco
- **Tono:** Aventurero pero confiable. "Tu ride de confianza hacia las olas."
- **Fotos:** Olas de Punta Roca, playas de La Libertad, el puerto, surfers, atardeceres
- **Idiomas:** Español e Inglés (toggle o detección automática)

---

## 10. Métricas de Éxito (3 meses post-lanzamiento)

- 50+ reservas de shuttle completadas
- 10+ tours realizados
- 4.5+ estrellas en Google Reviews
- Tasa de conversión del formulario >15%
- 30% de clientes con reservas recurrentes o por referidos

---

## 11. Fases del Proyecto

### Fase 1 — MVP (4–6 semanas)
- Landing page con diseño atractivo
- Formulario de reserva de shuttle
- Panel admin básico
- Integración de pagos
- Notificaciones por email

### Fase 2 — Tours & WhatsApp (2–3 semanas)
- Página de tours con booking
- Galería de fotos
- Integración WhatsApp para confirmaciones
- Google Reviews widget

### Fase 3 — Crecimiento (ongoing)
- Blog de surf (SEO: "best surf spots El Salvador", "airport transfer La Libertad")
- Sistema de reviews
- Programa de referidos
- Partnerships con hostales y escuelas de surf

---

## 12. Ideas Adicionales para Diferenciarse

1. **"Surf Report en el traslado"** — El conductor da el reporte de olas del día durante el viaje
2. **Bag storage** — Guardar equipaje mientras los turistas surfean (coordinado con hospedajes)
3. **Early bird pricing** — Descuento por reservar con 7+ días de anticipación
4. **Group deals** — Si llenan el vehículo (4 pax), precio especial
5. **Affiliate con tiendas de surf** — Referir a los turistas a tiendas de equipo locales y recibir comisión
6. **Instagram/TikTok integration** — Contenido del viaje, spots del día, testimonios de surfers
7. **"Surf Buddy" add-on** — Conectar al turista con un surfer local para guiarlo en los spots

---

*Este PRD es un documento vivo — actualizar conforme evoluciona el negocio.*
