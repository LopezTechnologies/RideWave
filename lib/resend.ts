import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendBookingConfirmation({
  to,
  customerName,
  destination,
  travelDate,
  pickupTime,
  passengers,
  vehicleType,
  priceUsd,
}: {
  to: string
  customerName: string
  destination: string
  travelDate: string
  pickupTime: string
  passengers: number
  vehicleType: string
  priceUsd: number
}) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: '¡Tu reserva está confirmada! — La Libertad Shuttle',
    html: `
      <h1>¡Hola ${customerName}!</h1>
      <p>Tu reserva de shuttle ha sido confirmada.</p>
      <ul>
        <li><strong>Destino:</strong> ${destination}</li>
        <li><strong>Fecha:</strong> ${travelDate}</li>
        <li><strong>Hora de recogida:</strong> ${pickupTime}</li>
        <li><strong>Pasajeros:</strong> ${passengers}</li>
        <li><strong>Vehículo:</strong> ${vehicleType}</li>
        <li><strong>Total:</strong> $${priceUsd} USD</li>
      </ul>
      <p>Nos vemos en el aeropuerto. ¡Bienvenido a El Salvador!</p>
    `,
  })
}
