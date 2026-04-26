import { setRequestLocale, getTranslations } from 'next-intl/server'
import { XCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export default async function CancelledPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'shuttle.cancelled' })

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
            <XCircle className="w-9 h-9 text-red-400" />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-ocean-950 mb-2">{t('title')}</h1>
        <p className="text-ocean-700 mb-2">{t('subtitle')}</p>
        <p className="text-gray-500 text-sm mb-8">{t('description')}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/shuttle"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-coral text-white font-semibold text-sm hover:bg-orange-700 transition-colors"
          >
            {t('cta')}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-ocean-950 text-ocean-950 font-semibold text-sm hover:bg-ocean-50 transition-colors"
          >
            {t('ctaHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
