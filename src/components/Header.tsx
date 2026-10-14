import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'
import { getLenis } from '../lib/gsap'
import { scrollToHash } from '../lib/scroll'
import { nav } from '../content/site'
import { ui } from '../content/ui'
import { Cta, Mark, Wordmark } from './Brand'

export function LangSwitch({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang()
  const item = (active: boolean) =>
    `tap px-1.5 py-1 transition-colors duration-300 ${active ? 'text-signal' : 'text-white/60 hover:text-white'}`
  return (
    <div role="group" aria-label="Language / اللغة" className={`latin flex items-center gap-0.5 text-[0.78rem] font-medium ${className}`}>
      <button type="button" className={item(lang === 'en')} aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
        EN
      </button>
      <span className="text-white/30" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        lang="ar"
        className={`font-ar ${item(lang === 'ar')}`}
        aria-pressed={lang === 'ar'}
        onClick={() => setLang('ar')}
      >
        عربي
      </button>
    </div>
  )
}

export function Header() {
  const { tr } = useLang()
  const [current, setCurrent] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const firstLink = useRef<HTMLAnchorElement>(null)
  const burger = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 40)
      // Highlight the section the reader is in: the last one whose top has passed 40 % of the screen.
      const line = window.innerHeight * 0.4
      let active = ''
      for (const item of nav) {
        const section = document.getElementById(item.to.slice(1))
        if (section && section.getBoundingClientRect().top <= line) active = item.to
      }
      setCurrent(active)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const goTo = (hash: string, viaMenu = false) => (event: { preventDefault: () => void }) => {
    event.preventDefault()
    setOpen(false)
    // Leaving the menu unlocks page scrolling first.
    window.setTimeout(() => scrollToHash(hash), viaMenu ? 80 : 0)
  }

  useEffect(() => {
    const lenis = getLenis()
    if (open) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      firstLink.current?.focus({ preventScroll: true })
    } else {
      lenis?.start()
      document.body.style.overflow = ''
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false)
        burger.current?.focus()
      }
    }
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [open])

  return (
    <>
      <a
        href="#main"
        className="fixed start-4 top-4 z-[90] -translate-y-24 rounded-full bg-signal px-5 py-3 text-sm font-semibold focus:translate-y-0"
      >
        {tr(ui.skip)}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-[70] px-3 transition-[padding] duration-500 ease-cine sm:px-5 ${
          scrolled ? 'pt-2' : 'pt-4'
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1560px] items-center justify-between gap-2 rounded-full sm:gap-6 border border-white/10 backdrop-blur-md transition-all duration-500 ease-cine ${
            scrolled ? 'bg-navy/88 py-2 ps-4 pe-2 shadow-[0_10px_40px_rgb(3_14_46/0.5)] sm:ps-5' : 'bg-navy/45 py-2.5 ps-4 pe-2.5 sm:py-3 sm:ps-6 sm:pe-3'
          }`}
        >
          <a href="#top" onClick={goTo('#top')} className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Creative Mind — back to top">
            <Mark className={`w-auto transition-all duration-500 ${scrolled ? 'h-5' : 'h-6'}`} />
            <Wordmark className={`transition-all duration-500 ${scrolled ? 'text-[0.72rem] sm:text-[0.82rem]' : 'text-[0.76rem] sm:text-[0.95rem]'}`} />
          </a>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-5 text-[0.82rem] font-medium whitespace-nowrap xl:gap-8 xl:text-[0.86rem]">
              {nav.map((n) => (
                <li key={n.to}>
                  <a
                    href={n.to}
                    onClick={goTo(n.to)}
                    aria-current={current === n.to ? 'location' : undefined}
                    className="nav-link text-white/80 hover:text-white aria-[current=location]:text-white"
                  >
                    {tr(n.label)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-5">
            <LangSwitch />
            <Cta to="#contact" className={`!hidden xl:!inline-flex ${scrolled ? '!py-3' : ''}`}>
              {tr(ui.cta)}
            </Cta>
            <button
              ref={burger}
              type="button"
              className="relative grid h-11 w-11 place-items-center rounded-full bg-signal lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={tr(open ? ui.close : ui.menu)}
              onClick={() => setOpen((o) => !o)}
            >
              <span
                className={`absolute h-[2px] w-5 bg-white transition-transform duration-500 ease-cine ${
                  open ? 'rotate-45' : '-translate-y-[4px]'
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 bg-white transition-transform duration-500 ease-cine ${
                  open ? '-rotate-45' : 'translate-y-[4px]'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen mobile navigation */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label={tr(ui.menu)}
        aria-hidden={!open}
        className={`fixed inset-0 z-[60] bg-navy-deep transition-[clip-path,visibility] duration-700 ease-cine lg:hidden ${
          open ? 'visible [clip-path:inset(0_0_0_0)]' : 'invisible [clip-path:inset(0_0_100%_0)]'
        }`}
      >
        <svg
          viewBox="0 0 400 800"
          preserveAspectRatio="xMidYMid slice"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M-40 760 200 120 440 760"
            pathLength={1}
            fill="none"
            stroke="#F6620D"
            strokeOpacity=".22"
            strokeWidth="1.5"
            strokeDasharray="1"
            style={{ strokeDashoffset: open ? 0 : 1, transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .2s' }}
          />
          <path
            d="M60 60 200 700 340 60"
            pathLength={1}
            fill="none"
            stroke="#fff"
            strokeOpacity=".1"
            strokeWidth="1.5"
            strokeDasharray="1"
            style={{ strokeDashoffset: open ? 0 : 1, transition: 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) .35s' }}
          />
        </svg>
        <div className="relative flex h-full flex-col justify-between px-6 pt-28 pb-8">
          <nav aria-label="Mobile">
            <ul>
              {nav.map((n, i) => (
                <li key={n.to} className="overflow-hidden border-b border-white/10">
                  <a
                    ref={i === 0 ? firstLink : undefined}
                    href={n.to}
                    onClick={goTo(n.to, true)}
                    aria-current={current === n.to ? 'location' : undefined}
                    tabIndex={open ? 0 : -1}
                    className="group flex items-baseline justify-between gap-4 py-3.5 text-[clamp(1.7rem,8.4vw,3rem)] leading-none font-bold tracking-tight uppercase transition-transform duration-700 ease-cine aria-[current=location]:text-signal rtl:leading-[1.4] rtl:tracking-normal"
                    style={{
                      transform: open ? 'translateY(0)' : 'translateY(110%)',
                      transitionDelay: open ? `${0.15 + i * 0.06}s` : '0s',
                    }}
                  >
                    {tr(n.label)}
                    <span className="latin text-xs font-normal text-white/40">0{i + 1}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div
            className="flex flex-col gap-5 transition-opacity duration-700"
            style={{ opacity: open ? 1 : 0, transitionDelay: open ? '.55s' : '0s' }}
          >
            <Cta to="#contact" className="justify-between" onClick={() => setOpen(false)}>
              {tr(ui.cta)}
            </Cta>
            <p className="latin eyebrow text-white/50">Mind Made Visible.</p>
          </div>
        </div>
      </div>
    </>
  )
}
