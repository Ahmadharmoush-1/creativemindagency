import { useRef } from 'react'
import { scrollToHash } from '../lib/scroll'
import { useLang } from '../lib/i18n'
import { gsap, prefersReduced, useGsap } from '../lib/gsap'
import { nav, site } from '../content/site'
import { services } from '../content/services'
import { ui } from '../content/ui'
import { Cta, Wordmark } from './Brand'

export function Footer() {
  const { tr, lang, setLang } = useLang()
  const root = useRef<HTMLElement>(null)

  // Sphere and A/V lines lean toward the cursor.
  useGsap(root, () => {
    const el = root.current
    if (!el || prefersReduced()) return

    const sx = gsap.quickTo('.ft-sphere', 'x', {
      duration: 1.2,
      ease: 'power3.out',
    })

    const sy = gsap.quickTo('.ft-sphere', 'y', {
      duration: 1.2,
      ease: 'power3.out',
    })

    const lx = gsap.quickTo('.ft-lines', 'x', {
      duration: 1.8,
      ease: 'power3.out',
    })

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const nx = (e.clientX - r.left) / r.width - 0.5
      const ny = (e.clientY - r.top) / r.height - 0.5

      sx(nx * 90)
      sy(ny * 60)
      lx(nx * -30)
    }

    el.addEventListener('pointermove', move)

    gsap.to('.ft-sphere-in', {
      y: -14,
      duration: 3.2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })

    return () => el.removeEventListener('pointermove', move)
  })

  const colHead = 'eyebrow mb-5 text-white/45'
  const link =
    'inline-block py-1 text-white/80 transition-colors duration-300 hover:text-signal'

  return (
    <footer
      ref={root}
      className="relative overflow-hidden bg-navy-deep pt-24 pb-8"
    >
      <svg
        className="ft-lines pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          d="M820 980 1180 60 1540 980"
          fill="none"
          stroke="#F6620D"
          strokeOpacity=".16"
          strokeWidth="1.5"
        />
        <path
          d="M1040 -40 1260 620 1480 -40"
          fill="none"
          stroke="#fff"
          strokeOpacity=".07"
          strokeWidth="1.5"
        />
      </svg>

      <div
        className="ft-sphere pointer-events-none absolute end-[9%] top-10 md:end-[14%] md:top-[22%]"
        aria-hidden="true"
      >
        <div className="ft-sphere-in sphere h-12 w-12 md:h-28 md:w-28" />
      </div>

      <div className="wrap relative">
        <div className="flex flex-col items-start gap-8 border-b border-white/10 pb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-title max-w-[16ch] font-light">
              {tr({
                en: 'Let’s build what’s next.',
                ar: 'لنبنِ ما هو قادم.',
              })}
            </p>
          </div>

          <div>
            <Cta to="#contact">{tr(ui.cta)}</Cta>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-12 py-16 md:grid-cols-4">
          {/* Navigation: desktop only */}
          <nav
            className="hidden md:block"
            aria-label={tr(ui.footer.nav)}
          >
            <h2 className={colHead}>{tr(ui.footer.nav)}</h2>

            <ul className="space-y-2">
              {nav.map((n) => (
                <li key={n.to}>
                  <a
                    href={n.to}
                    className={link}
                    onClick={(event) => {
                      event.preventDefault()
                      scrollToHash(n.to)
                    }}
                  >
                    {tr(n.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services: desktop only */}
          <nav
            className="hidden md:block"
            aria-label={tr(ui.footer.services)}
          >
            <h2 className={colHead}>{tr(ui.footer.services)}</h2>

            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.id}>
                  <a
                    href="#services"
                    className={link}
                    onClick={(event) => {
                      event.preventDefault()
                      scrollToHash('#services')
                    }}
                  >
                    {tr(s.title)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Language: mobile and desktop */}
          <div>
            <h2 className={colHead}>{tr(ui.footer.language)}</h2>

            <ul className="space-y-3">
              <li>
                <button
                  type="button"
                  className={`latin ${
                    lang === 'en' ? 'text-signal' : link
                  }`}
                  onClick={() => setLang('en')}
                >
                  EN
                </button>
              </li>

              <li>
                <button
                  type="button"
                  lang="ar"
                  className={`font-ar ${
                    lang === 'ar' ? 'text-signal' : link
                  }`}
                  onClick={() => setLang('ar')}
                >
                  العربية
                </button>
              </li>
            </ul>
          </div>

          {/* Social: mobile and desktop */}
          <div>
            <h2 className={colHead}>{tr(ui.footer.social)}</h2>

            <ul className="latin space-y-3">
              {site.social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} className={link}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative">
          <Wordmark className="block text-[9.7vw] leading-none 3xl:text-[10.4rem]" />
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p className={lang === 'en' ? 'eyebrow' : ''}>
            {tr(site.tagline)}
          </p>

          <p>
            <span className="latin">
              © {new Date().getFullYear()} Creative Mind.
            </span>{' '}
            {tr(ui.footer.rights)}
          </p>
        </div>
      </div>
    </footer>
  )
}