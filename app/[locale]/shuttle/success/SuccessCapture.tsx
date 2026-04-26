'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'

type Texts = {
  title: string
  subtitle: string
  description: string
  cta: string
}

type Status = 'loading' | 'success' | 'error'

export default function SuccessCapture({
  token,
  encodedMeta,
  texts,
}: {
  token: string
  encodedMeta: string
  texts: Texts
}) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    async function capture() {
      try {
        const meta = JSON.parse(atob(encodedMeta))
        const res = await fetch('/api/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: token, meta }),
        })
        setStatus(res.ok ? 'success' : 'error')
      } catch {
        setStatus('error')
      }
    }
    capture()
  }, [token, encodedMeta])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <Loader2 className="w-12 h-12 text-ocean-400 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-ocean-950">Finalizando tu reserva...</h1>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-9 h-9 text-red-500" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold text-ocean-950 mb-2">Algo salió mal</h1>
          <p className="text-gray-500 text-sm mb-8">
            Tu pago fue aprobado pero hubo un problema al confirmar. Contáctanos por WhatsApp y te ayudamos de inmediato.
          </p>
          <a
            href="https://wa.me/50300000000"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  // success
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-ocean-950 mb-2">{texts.title}</h1>
        <p className="text-ocean-700 mb-2">{texts.subtitle}</p>
        <p className="text-gray-500 text-sm mb-8">{texts.description}</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-ocean-950 text-white font-semibold text-sm hover:bg-ocean-800 transition-colors"
        >
          {texts.cta}
        </Link>
      </div>
    </div>
  )
}
