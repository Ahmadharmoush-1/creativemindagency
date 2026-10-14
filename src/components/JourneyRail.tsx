import { useRef } from 'react'
import { useLang } from '../lib/i18n'
import { ScrollTrigger, useGsap } from '../lib/gsap'
import { ui } from '../content/ui'

/**
 * The site's through-line: Thought → Idea → System → Action → Growth.
 * The orange signal travels down the rail as the page is read.
 */
export function JourneyRail() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLDivElement>(null)

  useGsap(
    root,
    () => {
      const el = root.current!
      const dotEl = el.querySelector<HTMLElement>('.jr-dot')!
      const fill = el.querySelector<HTMLElement>('.jr-fill')!
      const labels = Array.from(el.querySelectorAll<HTMLElement>('.jr-label'))
      const set = (p: number) => {
        dotEl.style.top = `${p * 100}%`
        fill.style.transform = `scaleY(${p})`
        const active = Math.min(labels.length - 1, Math.floor(p * labels.length))
        labels.forEach((l, i) => l.classList.toggle('is-on', i === active))
      }
      set(0)
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => set(s.progress) })
    },
    [lang],
  )

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="pointer-events-none fixed end-5 top-1/2 z-40 hidden h-[38vh] -translate-y-1/2 mix-blend-difference 2xl:block"
    >
      <div className="relative h-full w-px bg-white/25">
        <div className="jr-fill absolute inset-0 origin-top bg-white" style={{ transform: 'scaleY(0)' }} />
        <div className="jr-dot absolute start-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal rtl:translate-x-1/2" />
        <ul className="absolute end-4 top-0 flex h-full flex-col justify-between">
          {ui.journey.map((j) => (
            <li
              key={j.en}
              className="jr-label eyebrow text-end whitespace-nowrap text-white opacity-30 transition-opacity duration-500 [&.is-on]:opacity-100"
              style={{ fontSize: lang === 'en' ? '0.56rem' : '0.7rem' }}
            >
              {tr(j)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
