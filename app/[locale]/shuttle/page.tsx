import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import ShuttleForm from '@/components/shuttle/ShuttleForm'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('shuttleTitle'),
    description: t('shuttleDesc'),
  }
}

export default async function ShuttlePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'shuttle.packages' })

  const packages = [
    { nameKey: 'p1Name', descKey: 'p1Desc', icon: '🏄' },
    { nameKey: 'p2Name', descKey: 'p2Desc', icon: '🏆' },
    { nameKey: 'p3Name', descKey: 'p3Desc', icon: '💧' },
    { nameKey: 'p4Name', descKey: 'p4Desc', icon: '🍽️' },
  ] as const

  return (
    <>
      <ShuttleForm />

      {/* ── Package teaser ── */}
      <section className="bg-gray-50 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block bg-coral/10 text-coral text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
              {t('badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-ocean-950 mb-2">
              {t('title')}
            </h2>
            <p className="text-ocean-700 text-base max-w-xl mx-auto">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map(({ nameKey, descKey, icon }) => (
              <div
                key={nameKey}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm opacity-75 cursor-not-allowed select-none"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-ocean-950 text-sm mb-1">{t(nameKey)}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{t(descKey)}</p>
                <span className="inline-block mt-3 text-xs font-semibold text-coral/70 bg-coral/5 px-2 py-0.5 rounded-full">
                  {t('badge')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
