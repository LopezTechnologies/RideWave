import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Waves, MapPin, Star, ArrowRight } from 'lucide-react'

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return {
    title: locale === 'es' ? 'Tours de Surf — Próximamente | Ridewave' : 'Surf Tours — Coming Soon | Ridewave',
    description: locale === 'es'
      ? 'Tours guiados a los mejores spots de surf de El Salvador. Punta Roca, El Sunzal, El Zonte y más. Próximamente.'
      : 'Guided tours to El Salvador\'s best surf spots. Punta Roca, El Sunzal, El Zonte and more. Coming soon.',
  }
}

export default async function ToursPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale)
  const es = locale === 'es'

  const spots = [
    {
      name: 'Punta Roca',
      tag: es ? 'Ola de clase mundial' : 'World-class wave',
      desc: es
        ? 'El spot más famoso de El Salvador. Right hand point break potente, ideal para surfers intermedios y avanzados.'
        : 'El Salvador\'s most famous spot. Powerful right-hand point break, ideal for intermediate to advanced surfers.',
      level: es ? 'Intermedio — Avanzado' : 'Intermediate — Advanced',
      duration: '~45 min',
      emoji: '🤙',
    },
    {
      name: 'El Sunzal',
      tag: es ? 'Longboard perfecto' : 'Perfect longboard',
      desc: es
        ? 'Ola larga y suave de punto. Perfecta para longboard, surfers principiantes con experiencia y fotografía de surf.'
        : 'Long, mellow point break. Perfect for longboarding, experienced beginners, and surf photography.',
      level: es ? 'Principiante — Intermedio' : 'Beginner — Intermediate',
      duration: '~50 min',
      emoji: '🏄',
    },
    {
      name: 'El Zonte',
      tag: 'Bitcoin Beach',
      desc: es
        ? 'Ola hollow y divertida, ambiente bohemio y comunidad internacional. El spot favorito de los nómadas digitales surfers.'
        : 'Fun, hollow wave, bohemian vibe and international community. The go-to spot for digital nomad surfers.',
      level: es ? 'Intermedio' : 'Intermediate',
      duration: '~55 min',
      emoji: '₿',
    },
    {
      name: 'El Tunco',
      tag: es ? 'Más popular' : 'Most popular',
      desc: es
        ? 'El corazón del surf en La Libertad. Ola consistente todo el año, hostales, vida nocturna y el mejor ambiente surfer.'
        : 'The heart of La Libertad surf. Consistent wave year-round, hostels, nightlife and the best surf vibes.',
      level: es ? 'Todos los niveles' : 'All levels',
      duration: '~45 min',
      emoji: '🌊',
    },
  ]

  const whatsIncluded = es
    ? ['Transporte puerta a puerta', 'Guía local experto', 'Conocimiento de mareas y condiciones', 'Tips de fotografía de surf', 'Soporte WhatsApp']
    : ['Door-to-door transport', 'Expert local guide', 'Tide & conditions knowledge', 'Surf photography tips', 'WhatsApp support']

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero coming soon ── */}
      <section className="relative bg-ocean-950 overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 80% 20%, #06b6d4 0%, transparent 40%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-32 pb-20 text-center">
          <span className="inline-flex items-center gap-2 bg-coral/20 text-coral text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
            {es ? 'Próximamente' : 'Coming soon'}
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            {es ? 'Tours de Surf' : 'Surf Tours'}
            <span className="block text-ocean-400">
              {es ? 'en El Salvador' : 'in El Salvador'}
            </span>
          </h1>

          <p className="text-gray-500 text-lg max-w-xl mx-auto mb-10">
            {es
              ? 'Estamos diseñando los mejores tours guiados a los spots más épicos de La Libertad. Mientras tanto, reserva tu shuttle.'
              : "We're crafting the best guided tours to La Libertad's most epic surf spots. In the meantime, book your shuttle."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shuttle"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-coral text-white font-bold text-sm hover:bg-orange-700 transition-colors"
            >
              {es ? 'Reservar Shuttle' : 'Book Shuttle'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://wa.me/50300000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-ocean-800 text-white font-bold text-sm hover:bg-ocean-700 transition-colors"
            >
              {es ? 'Avísame cuando esté listo' : 'Notify me when ready'}
            </a>
          </div>
        </div>
      </section>

      {/* ── Spots teaser ── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-extrabold text-ocean-950 mb-2">
            {es ? 'Los spots que visitaremos' : 'Spots we\'ll visit'}
          </h2>
          <p className="text-gray-500 text-sm">
            {es ? 'Acceso local a los mejores picos de La Libertad.' : 'Local access to the best breaks in La Libertad.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {spots.map((spot) => (
            <div
              key={spot.name}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-2xl">{spot.emoji}</span>
                  <h3 className="font-extrabold text-ocean-950 text-lg mt-1">{spot.name}</h3>
                  <span className="inline-block text-xs font-semibold text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-full mt-0.5">
                    {spot.tag}
                  </span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg font-medium">
                  {spot.duration} {es ? 'del aeropuerto' : 'from airport'}
                </span>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-4">{spot.desc}</p>

              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-ocean-400" />
                  {spot.level}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-ocean-400" />
                  La Libertad
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── What's included teaser ── */}
      <section className="bg-ocean-950 py-14 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-ocean-400 text-xs font-bold uppercase tracking-widest">
                {es ? 'Qué incluye' : "What's included"}
              </span>
              <h2 className="text-2xl font-extrabold text-white mt-2 mb-4">
                {es ? 'Experiencia completa, sin preocupaciones' : 'Full experience, zero stress'}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                {es
                  ? 'Cada tour incluye transporte, guía local experto y todo lo que necesitas para aprovechar al máximo tu día de surf en El Salvador.'
                  : 'Every tour includes transport, an expert local guide, and everything you need to make the most of your surf day in El Salvador.'}
              </p>
            </div>

            <ul className="space-y-3">
              {whatsIncluded.map((item) => (
                <li key={item} className="flex items-center gap-3 text-gray-500 text-sm">
                  <Star className="w-4 h-4 text-ocean-400 shrink-0 fill-ocean-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Stats / social proof ── */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '4', label: es ? 'Spots de clase mundial' : 'World-class spots' },
            { value: '1:1', label: es ? 'Guía por grupo' : 'Guide per group' },
            { value: '100%', label: es ? 'Enfoque local' : 'Local knowledge' },
            { value: '$60', label: es ? 'Desde por persona' : 'From per person' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-3xl font-extrabold text-ocean-950 mb-1">{value}</p>
              <p className="text-gray-500 text-xs">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-400 text-sm mb-4">
            {es ? '¿Quieres llegar al spot? Reserva tu shuttle ahora.' : 'Want to get to the spot? Book your shuttle now.'}
          </p>
          <Link
            href="/shuttle"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ocean-950 text-white font-bold text-sm hover:bg-ocean-800 transition-colors"
          >
            {es ? 'Ver opciones de shuttle' : 'See shuttle options'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
