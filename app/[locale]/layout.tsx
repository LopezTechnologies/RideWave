import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import '../globals.css'

type Props = {
  children: React.ReactNode
  params: { locale: string }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' })
  return {
    title: t('homeTitle'),
    description: t('homeDesc'),
    keywords:
      'shuttle aeropuerto El Salvador, traslado La Libertad, tours surf El Salvador, Punta Roca, El Tunco, El Sunzal',
    openGraph: {
      title: t('homeOgTitle'),
      description: t('homeOgDesc'),
      locale: locale === 'es' ? 'es_SV' : 'en_US',
      type: 'website',
    },
  }
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
