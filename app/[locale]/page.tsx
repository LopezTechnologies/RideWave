import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import {
  Car,
  Compass,
  CheckCircle2,
  Star,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const t = useTranslations('home.hero')

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ocean-950">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 60% 40%, #075985 0%, #0c4a6e 40%, #082f49 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #38bdf8 0, #38bdf8 1px, transparent 0, transparent 50%)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full text-white fill-current">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-3xl mx-auto pt-16">
        <div className="inline-flex items-center gap-2 bg-ocean-800/60 border border-ocean-600 rounded-full px-4 py-1.5 text-ocean-200 text-sm font-medium mb-6">
          <MapPin className="w-4 h-4 text-ocean-400" />
          {t('badge')}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight text-balance mb-5">
          {t('title')}<br />
          <span className="text-ocean-400">{t('titleHighlight')}</span>
        </h1>

        <p className="text-ocean-200 text-lg sm:text-xl mb-8 text-balance">
          {t('subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/shuttle"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-coral text-white font-bold text-base hover:bg-orange-700 transition-colors shadow-lg"
          >
            <Car className="w-5 h-5" />
            {t('ctaShuttle')}
          </Link>
          <Link
            href="/tours"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 border border-white/30 text-white font-semibold text-base hover:bg-white/20 transition-colors"
          >
            <Compass className="w-5 h-5" />
            {t('ctaTours')}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-ocean-300 text-sm">
          {[
            { icon: ShieldCheck, key: 'badgeSecure' as const },
            { icon: Users, key: 'badgeGroups' as const },
            { icon: Clock, key: 'badgePunctual' as const },
          ].map(({ icon: Icon, key }) => (
            <div key={key} className="flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-ocean-400" />
              {t(key)}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Servicios ────────────────────────────────────────────────────────────────

function ServicesSection() {
  const t = useTranslations('home.services')

  const services = [
    {
      icon: Car,
      titleKey: 'shuttleTitle' as const,
      descKey: 'shuttleDesc' as const,
      priceKey: 'shuttlePrice' as const,
      features: ['shuttleF1', 'shuttleF2', 'shuttleF3'] as const,
      ctaKey: 'shuttleCta' as const,
      href: '/shuttle' as const,
      highlight: true,
    },
    {
      icon: Compass,
      titleKey: 'toursTitle' as const,
      descKey: 'toursDesc' as const,
      priceKey: 'toursPrice' as const,
      features: ['toursF1', 'toursF2', 'toursF3'] as const,
      ctaKey: 'toursCta' as const,
      href: '/tours' as const,
      highlight: false,
    },
  ]

  return (
    <section className="bg-white py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 mb-3">
            {t('title')}
          </h2>
          <p className="text-ocean-700 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.titleKey}
                className={`rounded-2xl p-8 flex flex-col gap-5 border ${
                  s.highlight
                    ? 'bg-ocean-950 text-white border-ocean-800'
                    : 'bg-white text-ocean-950 border-gray-200 shadow-sm'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.highlight ? 'bg-ocean-800' : 'bg-ocean-50'}`}>
                  <Icon className={`w-6 h-6 ${s.highlight ? 'text-ocean-400' : 'text-ocean-600'}`} />
                </div>

                <div>
                  <h3 className={`text-xl font-bold mb-2 ${s.highlight ? 'text-white' : 'text-ocean-950'}`}>
                    {t(s.titleKey)}
                  </h3>
                  <p className={`text-sm leading-relaxed ${s.highlight ? 'text-ocean-300' : 'text-gray-600'}`}>
                    {t(s.descKey)}
                  </p>
                </div>

                <ul className="space-y-1.5">
                  {s.features.map((fKey) => (
                    <li key={fKey} className={`flex items-center gap-2 text-sm ${s.highlight ? 'text-ocean-200' : 'text-gray-600'}`}>
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${s.highlight ? 'text-ocean-400' : 'text-palm'}`} />
                      {t(fKey)}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-2">
                  <p className={`text-2xl font-extrabold mb-4 ${s.highlight ? 'text-ocean-400' : 'text-ocean-950'}`}>
                    {t(s.priceKey)}
                  </p>
                  <Link
                    href={s.href}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-colors ${
                      s.highlight
                        ? 'bg-coral text-white hover:bg-orange-700'
                        : 'bg-ocean-950 text-white hover:bg-ocean-800'
                    }`}
                  >
                    {t(s.ctaKey)}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Destinos ─────────────────────────────────────────────────────────────────

function DestinationsSection() {
  const t = useTranslations('home.destinations')

  const destinations = [
    { nameKey: 'd1Name', descKey: 'd1Desc', tagKey: 'd1Tag', priceSedan: 35, priceSuv: 45 },
    { nameKey: 'd2Name', descKey: 'd2Desc', tagKey: 'd2Tag', priceSedan: 40, priceSuv: 50 },
    { nameKey: 'd3Name', descKey: 'd3Desc', tagKey: 'd3Tag', priceSedan: 40, priceSuv: 50 },
    { nameKey: 'd4Name', descKey: 'd4Desc', tagKey: 'd4Tag', priceSedan: 45, priceSuv: 55 },
  ] as const

  return (
    <section className="bg-gray-50 py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 mb-3">
            {t('title')}
          </h2>
          <p className="text-ocean-700 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((dest) => (
            <div key={dest.nameKey} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-3">
              <span className="inline-block text-xs font-semibold text-ocean-600 bg-ocean-50 rounded-full px-3 py-1 w-fit">
                {t(dest.tagKey)}
              </span>
              <h3 className="font-bold text-ocean-950 text-lg leading-tight">{t(dest.nameKey)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{t(dest.descKey)}</p>
              <div className="pt-2 border-t border-gray-100 flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">{t('sedan')}</span>
                  <p className="font-bold text-ocean-700">${dest.priceSedan} USD</p>
                </div>
                <div>
                  <span className="text-gray-400">{t('suv')}</span>
                  <p className="font-bold text-ocean-700">${dest.priceSuv} USD</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">{t('note')}</p>
      </div>
    </section>
  )
}

// ─── Cómo funciona ────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const t = useTranslations('home.howItWorks')

  const steps = [
    { number: '01', titleKey: 's1Title', descKey: 's1Desc' },
    { number: '02', titleKey: 's2Title', descKey: 's2Desc' },
    { number: '03', titleKey: 's3Title', descKey: 's3Desc' },
    { number: '04', titleKey: 's4Title', descKey: 's4Desc' },
  ] as const

  return (
    <section className="bg-white py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ocean-950 mb-3">
            {t('title')}
          </h2>
          <p className="text-ocean-700 text-lg">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-3">
              <span className="text-5xl font-extrabold text-ocean-100 leading-none">{step.number}</span>
              <h3 className="font-bold text-ocean-950 text-base">{t(step.titleKey)}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{t(step.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const t = useTranslations('home.testimonials')

  const testimonials = [
    { textKey: 't1Text', nameKey: 't1Name', originKey: 't1Origin', stars: 5 },
    { textKey: 't2Text', nameKey: 't2Name', originKey: 't2Origin', stars: 5 },
    { textKey: 't3Text', nameKey: 't3Name', originKey: 't3Origin', stars: 5 },
  ] as const

  return (
    <section className="bg-ocean-950 py-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {t('title')}
          </h2>
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <p className="text-ocean-300">{t('rating')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((testimonial) => (
            <div key={testimonial.nameKey} className="bg-ocean-900 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-ocean-200 text-sm leading-relaxed italic">&ldquo;{t(testimonial.textKey)}&rdquo;</p>
              <div className="mt-auto">
                <p className="text-white font-semibold text-sm">{t(testimonial.nameKey)}</p>
                <p className="text-ocean-400 text-xs">{t(testimonial.originKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── WhatsApp CTA ─────────────────────────────────────────────────────────────

function WhatsAppCta() {
  const t = useTranslations('home.whatsapp')

  return (
    <section className="bg-palm py-14 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-4">
          <MessageCircle className="w-12 h-12 text-white/70" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          {t('title')}
        </h2>
        <p className="text-green-100 mb-6 text-lg">{t('subtitle')}</p>
        <a
          href="https://wa.me/50300000000?text=Hola,%20quiero%20info%20sobre%20el%20shuttle"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-palm font-bold text-base hover:bg-green-50 transition-colors shadow-lg"
        >
          <MessageCircle className="w-5 h-5" />
          {t('cta')}
        </a>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)

  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <DestinationsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <WhatsAppCta />
    </main>
  )
}
