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

export default function ShuttlePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  return <ShuttleForm />
}
