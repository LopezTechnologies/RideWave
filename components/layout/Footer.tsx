import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Waves, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')

  return (
    <footer className="bg-ocean-950 text-ocean-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <Waves className="w-5 h-5 text-ocean-400" />
              <span>La Libertad <span className="text-ocean-400">Shuttle</span></span>
            </div>
            <p className="text-sm text-ocean-300 leading-relaxed">{t('tagline')}</p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-3">{t('services')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shuttle" className="hover:text-white transition-colors">
                  {t('shuttleAirport')}
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-white transition-colors">
                  {t('surfTours')}
                </Link>
              </li>
              <li>
                <Link href="/shuttle" className="hover:text-white transition-colors">
                  {t('roundTrip')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div id="contacto">
            <h3 className="text-white font-semibold mb-3">{t('contact')}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-ocean-400 shrink-0" />
                {t('location')}
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-ocean-400 shrink-0" />
                <a href="https://wa.me/50300000000" className="hover:text-white transition-colors">
                  WhatsApp: +503 0000-0000
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-ocean-400 shrink-0" />
                <a href="mailto:hola@lalibertadshuttle.com" className="hover:text-white transition-colors">
                  hola@lalibertadshuttle.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ocean-800 text-center text-xs text-ocean-400">
          {t('copyright', { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  )
}
