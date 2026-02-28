import { redirect } from 'next/navigation'

// Middleware handles locale routing; this is a fallback
export default function ShuttleFallbackPage() {
  redirect('/es/shuttle')
}
