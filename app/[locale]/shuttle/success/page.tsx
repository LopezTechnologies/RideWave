import { setRequestLocale, getTranslations } from 'next-intl/server'
import { CheckCircle2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import SuccessCapture from './SuccessCapture'

export default async function SuccessPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { token?: string; data?: string }
}) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'shuttle.success' })

  const texts = {
    title: t('title'),
    subtitle: t('subtitle'),
    description: t('description'),
    cta: t('cta'),
  }

  // If PayPal redirected with token + data, handle capture flow
  if (searchParams.token && searchParams.data) {
    return (
      <SuccessCapture
        token={searchParams.token}
        encodedMeta={searchParams.data}
        texts={texts}
      />
    )
  }

  // Static fallback (direct navigation, no token)
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
