# Shuttle solo fines de semana — Diseño

## Contexto

El operador arranca el servicio de shuttle operando solo sábado y domingo, por
capacidad propia (no es una limitación permanente del negocio). Hoy el
formulario de reserva (`components/shuttle/ShuttleForm.tsx`) permite elegir
cualquier fecha vía `<input type="date">` nativo, y no hay ninguna validación
de día de la semana en ninguna capa.

## Alcance

Solo afecta el flujo de reserva de **shuttle**. Tours no tiene booking
implementado todavía, por lo que queda fuera de este diseño.

## Regla central

Nueva constante y función pura en `lib/shuttleAvailability.ts` (ya es el
archivo responsable de "¿se puede reservar este slot?" vía chequeo de
conflictos de horario — esta es una extensión natural de esa responsabilidad):

```ts
const DIAS_HABILITADOS = [0, 6] // domingo=0, sábado=6 (getDay())

function isBookableDay(date: Date): boolean {
  return DIAS_HABILITADOS.includes(getDay(date))
}
```

Es la única fuente de verdad. Ningún otro punto del código reimplementa esta
regla — todos la importan.

**Config temporal, no permanente**: cuando el operador quiera habilitar más
días, se cambia el array `DIAS_HABILITADOS` y se redeploya (1-2 min en
Vercel). No se construye UI de admin para esto ahora — es YAGNI mientras la
restricción sea temporal y el operador sea también quien toca el código.

## Componentes

**Nuevo**: `components/shuttle/ShuttleDatePicker.tsx` — client component que
envuelve `react-day-picker` (nueva dependencia; se integra nativamente con
`date-fns`, que el proyecto ya usa). Estilizado con la paleta ocean/sand
existente. Recibe `disabled={(date) => !isBookableDay(date)}` para que
lunes-viernes aparezcan deshabilitados y no sean seleccionables.

Reemplaza el `<input type="date">` dentro de `ShuttleForm.tsx` manteniendo el
mismo shape de `value`/`onChange` que ya consume `form.travelDate` (string
`'YYYY-MM-DD'`) — no se toca el resto del formulario.

## Flujo de datos

1. Usuario abre el calendario → lunes-viernes deshabilitados visualmente
2. Selecciona sábado o domingo → sigue el flujo normal (chequeo de horarios
   disponibles vía `GET /api/shuttle/availability`)
3. `app/api/shuttle/availability/route.ts` llama `isBookableDay()` primero —
   si el día no es válido, corta antes de consultar Supabase y devuelve lista
   vacía de horarios
4. `app/api/checkout/route.ts` vuelve a validar `isBookableDay()` antes de
   llamar `checkShuttleConflictInSupabase()` / `createPayPalOrder()` — última
   línea de defensa si alguien pega directo al API saltándose el frontend

## Timezone

`travelDate` llega como string `'YYYY-MM-DD'`. Se parsea con
`date-fns parseISO`, **no** con `new Date(string)` crudo — ese constructor
interpreta el string como UTC medianoche, lo que puede correr el día según la
zona horaria del servidor (El Salvador es UTC-6: un `new Date('2026-08-08')`
puede leerse sábado en UTC pero viernes en hora local). `parseISO` +
`getDay()` de `date-fns` evita ese corrimiento.

## Manejo de errores

Si `checkout/route.ts` recibe una fecha no habilitada (UI saltada, llamada
directa al API, o bug de timezone no capturado en tests), responde `400` con
código `DAY_NOT_BOOKABLE` y mensaje traducido ES/EN (mismo patrón que los
errores de validación Zod que ya maneja `ShuttleForm`). El catch existente en
`handleSubmit` ya muestra estos errores — no hace falta UI nueva, solo
agregar el string en `messages/es.json` y `messages/en.json`.

## Testing

- Unit test de `isBookableDay()`: viernes→false, sábado→true, domingo→true,
  lunes→false, más un caso explícito cerca de medianoche UTC-6 para blindar
  contra el bug de timezone descrito arriba.
- Verificación manual: `curl` directo a `POST /api/checkout` con
  `travelDate` de un martes, confirmar `400 DAY_NOT_BOOKABLE` sin llegar a
  crear orden PayPal — prueba que la validación server-side es independiente
  del calendario del frontend.
- Sin e2e de UI: `react-day-picker` es una librería madura, no vale la pena
  testear su render; alcanza con verificar que recibe el `matcher` correcto.

## Fuera de alcance

- Tours (no tiene booking implementado)
- UI de admin para cambiar los días habilitados sin redeploy
- Migración PayPal → Stripe (se brainstorea por separado)
