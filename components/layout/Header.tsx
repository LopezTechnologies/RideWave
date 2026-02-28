'use client'

import { useState } from 'react'
import { Menu, X, Waves } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { Link, usePathname, useRouter } from '@/i18n/navigation'

function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = (next: string) => {
    router.replace(pathname, { locale: next })
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        onClick={() => switchLocale('en')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          locale === 'en'
            ? 'text-white bg-ocean-700'
            : 'text-ocean-400 hover:text-white'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className="text-ocean-700">|</span>
      <button
        onClick={() => switchLocale('es')}
        className={`px-1.5 py-0.5 rounded transition-colors ${
          locale === 'es'
            ? 'text-white bg-ocean-700'
            : 'text-ocean-400 hover:text-white'
        }`}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  )
}

export default function Header() {
  const t = useTranslations('nav')
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { label: t('home'),    href: '/' },
    { label: t('shuttle'), href: '/shuttle' },
    { label: t('tours'),   href: '/tours' },
    { label: t('contact'), href: '#contacto' },
  ] as const

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ocean-950/95 backdrop-blur-sm border-b border-ocean-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
            <Waves className="w-6 h-6 text-ocean-400" />
            <span>La Libertad <span className="text-ocean-400">Shuttle</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ocean-100 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA + language switcher + mobile toggle */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/shuttle"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
            >
              {t('cta')}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-ocean-100 hover:text-white p-1"
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ocean-950 border-t border-ocean-800 px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-ocean-100 hover:text-white text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/shuttle"
            onClick={() => setMenuOpen(false)}
            className="inline-flex justify-center items-center px-4 py-2 rounded-full bg-coral text-white text-sm font-semibold hover:bg-orange-700 transition-colors"
          >
            {t('cta')}
          </Link>
        </div>
      )}
    </header>
  )
}
