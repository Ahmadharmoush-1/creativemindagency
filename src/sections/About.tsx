import { useRef } from 'react'
import { useLang } from '../lib/i18n'
import { gsap, prefersReduced, useGsap } from '../lib/gsap'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'

export function Principles() {
  const { tr } = useLang()
  return (
    <ol className="grid gap-x-10 sm:grid-cols-2">
      {ui.about.principles.map((p, i) => (
        <li key={p.t.en} className="group border-t border-white/15 py-7 transition-colors duration-500 hover:border-signal" data-reveal="up" data-delay={i * 0.06}>
          <div className="flex items-start gap-4">
            <span className="mt-2 block h-2 w-2 shrink-0 rounded-full bg-signal transition-transform duration-500 ease-cine group-hover:scale-[2.2]" aria-hidden="true" />
            <div>
              <h3 className="text-xl font-semibold tracking-tight rtl:tracking-normal">{tr(p.t)}</h3>
              <p className="muted mt-2 max-w-[30ch] leading-snug rtl:leading-relaxed">{tr(p.d)}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** The character appears here as a portrait: one of the few places it is used. */
export function CharacterPortrait({ className = '' }: { className?: string }) {
  const { tr } = useLang()
  const root = useRef<HTMLDivElement>(null)
  useGsap(root, () => {
    if (prefersReduced()) return
    gsap.fromTo(
      '.cp-img',
      { yPercent: -7, scale: 1.12 },
      { yPercent: 7, scale: 1.12, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } },
    )
    gsap.fromTo(
      '.cp-a',
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 80%', end: 'center 45%', scrub: 0.6 } },
    )
  })
  return (
    <figure ref={root} className={`relative ${className}`}>
      {/* The outline is wider than the photo; the wrapper clips it to the screen edge on phones. */}
      <svg viewBox="0 0 400 520" className="absolute -inset-x-[14%] -top-[8%] h-[116%] w-[128%]" aria-hidden="true">
        <path className="cp-a" d="M10 520 200 10 390 520" pathLength={1} strokeDasharray="1" fill="none" stroke="#F6620D" strokeWidth="2" />
      </svg>
      <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem]" data-reveal="clip">
        <img
          className="cp-img h-full w-full object-cover object-[50%_22%]"
          src="/media/character.webp"
          width={720}
          height={1280}
          loading="lazy"
          decoding="async"
          srcSet="/media/character-480.webp 480w, /media/character.webp 720w"
          sizes="(max-width: 640px) 300px, 420px"
          alt={tr(ui.about.charAlt)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent" />
      </div>
      <figcaption className="muted mt-4 flex max-w-[34ch] items-start gap-3 text-sm leading-snug rtl:leading-relaxed">
        <span className="sphere mt-1 block h-2.5 w-2.5 shrink-0" aria-hidden="true" />
        {tr(ui.about.charNote)}
      </figcaption>
    </figure>
  )
}

/** Home teaser. */
export function About() {
  const { tr, lang } = useLang()
  return (
    <section className="section overflow-x-clip">
      <div className="wrap grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <CharacterPortrait className="order-2 mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:order-1" />
        <div className="order-1 lg:order-2">
          <Eyebrow className="mb-7 text-white/70">{tr(ui.about.eyebrow)}</Eyebrow>
          <h2 className="sr-only">{ui.about.title[lang].join(' ')}</h2>
          <Lines
            as="p"
            className="t-display !text-[clamp(2.2rem,5.4vw,5.4rem)]"
            lines={[<span className="thin">{ui.about.title[lang][0]}</span>, dot(ui.about.title[lang][1])]}
          />
          <p className="t-lead mt-7 max-w-[46ch] text-white/85" data-reveal="up">
            {tr(ui.about.lead)}
          </p>
          <div className="mt-10">
            <Principles />
          </div>
        </div>
      </div>
    </section>
  )
}
