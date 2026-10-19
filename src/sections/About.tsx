import { Fragment, useEffect, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { useLang } from '../lib/i18n'
import { useReady } from '../lib/ready'
import { ScrollTrigger, gsap, prefersReduced, useGsap, useMedia } from '../lib/gsap'
import { ui } from '../content/ui'
import './about.css'
/**
 * About — "One mind. Multiple disciplines."
 *
 * The portrait is the mind: it opens out of the visor, blinks, and sends a signal
 * line to each discipline orbiting it. The heading builds letter by letter, the lead lights up
 * word by word as it scrolls past, the principles deal in as cards, and two crossing bands carry
 * the disciplines out of the section.
 * Styles and the looping layers are in about.css; nothing here pins, so phones scroll natively.
 */
/** Discipline locations, in percent of the portrait card. */
const ORBIT = [
  { x: -6, y: 14 },
  { x: -11, y: 42 },
  { x: -6, y: 70 },
  { x: 103, y: 7 },
  { x: 110, y: 29 },
  { x: 108, y: 51 },
  { x: 103, y: 73 },
]
// The visor in the card's 300x400 viewBox (an ellipse): every signal line leaves from its rim.
const VISOR = { x: 127, y: 120, rx: 64, ry: 70 }
const MOBILE_ORBIT = [
  { x: 10, y: 12 },
  { x: 10, y: 46 },
  { x: 10, y: 72 },
  { x: 90, y: 8 },
  { x: 90, y: 30 },
  { x: 90, y: 53 },
  { x: 90, y: 76 },
]
const makeLinks = (positions: typeof ORBIT) => positions.map(({ x, y }) => {
  const X = (x / 100) * 300
  const Y = (y / 100) * 400
  const a = Math.atan2(Y - VISOR.y, X - VISOR.x)
  const sx = VISOR.x + VISOR.rx * Math.cos(a)
  const sy = VISOR.y + VISOR.ry * Math.sin(a)
  const r = (n: number) => Math.round(n * 10) / 10
  return {
    d: `M${r(sx)} ${r(sy)} C${r(sx + (X - sx) * 0.55)} ${r(sy)} ${r(sx + (X - sx) * 0.45)} ${r(Y)} ${r(X)} ${r(Y)}`,
    sx: r(sx),
    sy: r(sy),
  }
})
const pad = (n: number) => String(n).padStart(2, '0')
/** A line split for animation: letters for Latin, whole words for Arabic (joined letters must stay together). */
function Split({ text, perLetter }: { text: string; perLetter: boolean }) {
  const m = text.match(/^(.*?)([.؟?!])$/)
  const words = (m ? m[1] : text).split(' ')
  return (
    <>
      {words.map((w, i) => {
        const word = (
          <span className="ab-word">
            {perLetter ? (
              Array.from(w).map((c, j) => (
                <span className="ab-ch" key={j}>
                  {c}
                </span>
              ))
            ) : (
              <span className="ab-ch">{w}</span>
            )}
          </span>
        )
        const last = i === words.length - 1
        return (
          <Fragment key={i}>
            {i > 0 && ' '}
            {last && m ? (
              <span className="ab-nowrap">
                {word}
                <span className="ab-dotp">{m[2]}</span>
              </span>
            ) : (
              word
            )}
          </Fragment>
        )
      })}
    </>
  )
}
/** Four-point star between the band words. */
function Star({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 0c.9 6.6 4.8 10.6 12 12-7.2 1.4-11.1 5.4-12 12-.9-6.6-4.8-10.6-12-12C7.2 10.6 11.1 6.6 12 0Z" />
    </svg>
  )
}
function Portrait() {
  const { tr } = useLang()
  const desktop = useMedia('(min-width: 1024px)')
  const positions = desktop ? ORBIT : MOBILE_ORBIT
  const links = makeLinks(positions)
  return (
    <figure className="ab-portrait">
      <div className="ab-stage-wrap">
        <div className="ab-stage">
          <div className="ab-halo" aria-hidden="true" />
          <svg className="ab-aline" viewBox="0 0 400 520" aria-hidden="true">
            <path d="M10 520 200 10 390 520" pathLength={1} />
          </svg>
          <div className="ab-card">
            <div className="ab-par">
              <div className="ab-imgbox">
                <img
                  className="ab-img"
                  src="/media/character.webp"
                  srcSet="/media/character-480.webp 480w, /media/character.webp 720w"
                  sizes="(max-width: 640px) 330px, 400px"
                  width={720}
                  height={1280}
                  loading="lazy"
                  decoding="async"
                  alt={tr(ui.about.charAlt)}
                />
                <span className="ab-lid ab-lid-l" aria-hidden="true" />
                <span className="ab-lid ab-lid-r" aria-hidden="true" />
                <span className="ab-visor" aria-hidden="true">
                  <span className="ab-visor-i" />
                </span>
              </div>
            </div>
            <span className="ab-scan" aria-hidden="true" />
            <span className="ab-shade" aria-hidden="true" />
            <div className="ab-hud-top latin" aria-hidden="true">
              <span className="ab-live" />
              CM—01
            </div>
            <div className="ab-hud" aria-hidden="true">
              <div className="ab-stat">
                <span className="ab-stat-n latin" data-count="1">
                  01
                </span>
                <span className="ab-stat-l">{tr(ui.about.hudMind)}</span>
              </div>
              <span className="ab-hud-link" />
              <div className="ab-stat ab-stat-end">
                <span className="ab-stat-n latin" data-count={ui.about.disciplines.length}>
                  {pad(ui.about.disciplines.length)}
                </span>
                <span className="ab-stat-l">{tr(ui.about.hudDisciplines)}</span>
              </div>
            </div>
          </div>
          <span className="ab-corner ab-c-tl" aria-hidden="true" />
          <span className="ab-corner ab-c-tr" aria-hidden="true" />
          <span className="ab-corner ab-c-bl" aria-hidden="true" />
          <span className="ab-corner ab-c-br" aria-hidden="true" />
          <div className="ab-orbit" aria-hidden="true">
            <svg className="ab-links" viewBox="0 0 300 400">
              {links.map((l, i) => (
                <g key={i}>
                  <path className="ab-link" d={l.d} pathLength={1} />
                  <path className="ab-pulse" d={l.d} pathLength={1} style={{ animationDelay: `${-i * 0.45}s` }} />
                  <circle className="ab-node" cx={l.sx} cy={l.sy} r="2.4" />
                </g>
              ))}
            </svg>
            {ui.about.disciplines.map((d, i) => (
              <span
                key={d.en}
                className="ab-chip"
                style={{ '--x': `${positions[i % positions.length].x}%`, '--y': `${positions[i % positions.length].y}%`, '--d': `${-i * 0.8}s` } as CSSProperties}
              >
                <span className="ab-chip-i">
                  <span className="ab-chip-dot" />
                  {tr(d)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="ab-cap">
        <span className="sphere ab-cap-dot block shrink-0" aria-hidden="true" />
        <span>{tr(ui.about.charNote)}</span>
      </figcaption>
    </figure>
  )
}
function Principles() {
  const { tr } = useLang()
  // Spotlight follows the pointer across a card.
  const spot = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <ol className="ab-principles">
      {ui.about.principles.map((p, i) => (
        <li key={p.t.en} className="ab-pr-cell">
          <div className="ab-pr" onPointerMove={spot}>
            <span className="ab-pr-rule" aria-hidden="true" />
            <div className="ab-pr-head" aria-hidden="true">
              <span className="ab-mask">
                <span className="ab-pr-num latin">
                  <span className="ab-pr-num-i">{pad(i + 1)}</span>
                </span>
              </span>
              <span className="ab-pr-dot">
                <span className="ab-pr-dot-i sphere" />
              </span>
            </div>
            <h3>
              <span className="ab-mask">
                <span className="ab-pr-t">{tr(p.t)}</span>
              </span>
            </h3>
            <p className="ab-pr-d">{tr(p.d)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
/** Two crossing bands of disciplines, scrolling in opposite directions. */
function Bands() {
  const { tr } = useLang()
  const group = (key: number) => (
    <div className="ab-mq-group" key={key}>
      {ui.about.disciplines.map((d) => (
        <Fragment key={d.en}>
          <span className="ab-mq-word">{tr(d)}</span>
          <Star className="ab-mq-sep" />
        </Fragment>
      ))}
    </div>
  )
  // Four copies: the track loops by sliding exactly half its width.
  const track = [0, 1, 2, 3].map(group)
  return (
    <div className="ab-bands" aria-hidden="true" dir="ltr">
      <div className="ab-bands-in">
        <div className="ab-band ab-band-a">
          <div className="ab-mq">{track}</div>
        </div>
        <div className="ab-band ab-band-b">
          <div className="ab-mq">{track}</div>
        </div>
      </div>
    </div>
  )
}
export function About() {
  const { tr, lang, rtl } = useLang()
  const ready = useReady()
  const root = useRef<HTMLElement>(null)
  const title = ui.about.title[lang]
  const perLetter = lang !== 'ar'
  const lead = tr(ui.about.lead).split(' ')
  // Loops hold still while the section is off screen.
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => el.toggleAttribute('data-off', !e.isIntersecting), {
      rootMargin: '200px 0px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // Heading, watermark and lead: their letters/words are split per language, so these rebuild
  // on a switch (and land on their finished state when already scrolled past).
  useGsap(
    root,
    () => {
      if (!ready || prefersReduced()) return
      const el = root.current!
      const q = gsap.utils.selector(el)
      const one = (sel: string) => q(sel)[0] as HTMLElement
      const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true })
      /* ---- eyebrow + heading ---- */
      gsap.set(q('.ab-eb-dot'), { scale: 0 })
      gsap.set(q('.ab-eb-line'), { scaleX: 0 })
      gsap.set(q('.ab-eb-text'), { clipPath: rtl ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' })
      gsap.set(q('.ab-ch'), { yPercent: 118, rotate: rtl ? -5 : 7 })
      gsap.set(q('.ab-l2 .ab-ch'), { color: 'rgba(255,255,255,0)' })
      gsap.set(q('.ab-dotp'), { scale: 0, rotate: -40 })
      gsap
        .timeline({ scrollTrigger: once(one('.ab-head')) })
        .to(q('.ab-eb-dot'), { scale: 1, duration: 0.7, ease: 'back.out(3.5)' })
        .to(q('.ab-eb-line'), { scaleX: 1, duration: 0.8, ease: 'expo.out' }, 0.12)
        .to(q('.ab-eb-text'), { clipPath: 'inset(0 0% 0 0%)', duration: 0.9, ease: 'expo.out' }, 0.25)
        .to(q('.ab-l1 .ab-ch'), { yPercent: 0, rotate: 0, duration: 1.15, ease: 'expo.out', stagger: 0.035 }, 0.2)
        .to(q('.ab-l2 .ab-ch'), { yPercent: 0, rotate: 0, duration: 1.15, ease: 'expo.out', stagger: 0.028 }, 0.45)
        .to(q('.ab-l2 .ab-ch'), { color: '#fff', duration: 0.55, ease: 'power1.out', stagger: 0.035 }, 0.95)
        .to(q('.ab-dotp'), { scale: 1, rotate: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, 1.25)
      // The outlined MIND drifts across behind the heading.
      gsap.fromTo(
        q('.ab-wm'),
        { xPercent: rtl ? -8 : 8 },
        { xPercent: rtl ? 10 : -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      /* ---- lead: lights up word by word with the scroll ---- */
      gsap.fromTo(
        q('.ab-lw'),
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: one('.ab-lead'), start: 'top 85%', end: 'bottom 55%', scrub: 0.4 },
        },
      )
    },
    [ready, lang],
  )
  useGsap(
    root,
    () => {
      if (!ready || prefersReduced()) return
      const el = root.current!
      const q = gsap.utils.selector(el)
      const one = (sel: string) => q(sel)[0] as HTMLElement
      const once = (trigger: Element, start = 'top 85%') => ({ trigger, start, once: true })
      const fine = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)').matches
      const cleanups: (() => void)[] = []
      /* ---- portrait ---- */
      const stage = one('.ab-stage')
      const card = one('.ab-card')
      const AT = 'at 43% 30%' // the visor
      gsap.set(card, { clipPath: `circle(0% ${AT})` })
      gsap.set(q('.ab-imgbox'), { scale: 1.55 })
      gsap.set(q('.ab-visor'), { opacity: 0 })
      gsap.set(q('.ab-corner'), { opacity: 0, scale: 0.3 })
      gsap.set(q('.ab-hud-top, .ab-stat'), { opacity: 0, y: 16 })
      gsap.set(q('.ab-hud-link'), { scaleX: 0 })
      gsap.set(q('.ab-link'), { strokeDashoffset: 1 })
      gsap.set(q('.ab-pulse, .ab-node'), { opacity: 0 })
      gsap.set(q('.ab-chip'), { opacity: 0, scale: 0.2, z: 60 })
      gsap.set(q('.ab-cap > *'), { opacity: 0, y: 18 })
      const counters = q('[data-count]') as HTMLElement[]
      const counting = gsap.timeline()
      counters.forEach((n) => {
        const to = Number(n.dataset.count)
        const box = { v: 0 }
        n.textContent = pad(0)
        counting.to(box, { v: to, duration: 1.5, ease: 'power2.out', onUpdate: () => void (n.textContent = pad(Math.round(box.v))) }, 0)
      })
      cleanups.push(() => counters.forEach((n) => (n.textContent = pad(Number(n.dataset.count)))))
      gsap
        .timeline({ scrollTrigger: once(stage, 'top 80%') })
        .to(card, {
          clipPath: `circle(110% ${AT})`,
          duration: 1.7,
          ease: 'expo.inOut',
          onComplete: () => void gsap.set(card, { clearProps: 'clipPath' }),
        })
        .to(q('.ab-imgbox'), { scale: 1.06, duration: 2.4, ease: 'expo.out' }, 0.3)
        .fromTo(q('.ab-scan'), { yPercent: -100, opacity: 1 }, { yPercent: 470, duration: 1.5, ease: 'power2.inOut' }, 0.55)
        .to(q('.ab-scan'), { opacity: 0, duration: 0.4 }, 1.7)
        .to(q('.ab-visor'), { opacity: 1, duration: 1.4, ease: 'power2.out' }, 1)
        .to(q('.ab-corner'), { opacity: 1, scale: 1, duration: 1, ease: 'expo.out', stagger: 0.08 }, 0.95)
        .to(q('.ab-hud-top, .ab-stat'), { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out', stagger: 0.12 }, 1.25)
        .to(q('.ab-hud-link'), { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 1.4)
        .add(counting, 1.35)
        .to(q('.ab-node'), { opacity: 1, duration: 0.4, stagger: 0.06 }, 1.2)
        .to(q('.ab-link'), { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut', stagger: 0.07 }, 1.25)
        .to(q('.ab-chip'), { opacity: 1, scale: 1, duration: 1, ease: 'back.out(2.2)', stagger: 0.07 }, 1.7)
        .to(q('.ab-pulse'), { opacity: 1, duration: 0.6, stagger: 0.07 }, 2.3)
        .to(q('.ab-cap > *'), { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.1 }, 1.5)
      // Parallax inside the card, and the A drawn as the portrait scrolls through.
      gsap.fromTo(
        q('.ab-par'),
        { yPercent: -4 },
        { yPercent: 4, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.fromTo(
        q('.ab-aline path'),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: stage, start: 'top 85%', end: 'center 40%', scrub: 0.6 } },
      )
      // Mouse: the stage tilts in 3D, the chips float in front of it.
      const pointerMotion = gsap.matchMedia()
      pointerMotion.add('(min-width: 1024px) and (hover: hover) and (pointer: fine)', () => {
        const wrap = one('.ab-stage-wrap')
        const rx = gsap.quickTo(stage, 'rotationX', { duration: 0.9, ease: 'power3.out' })
        const ry = gsap.quickTo(stage, 'rotationY', { duration: 0.9, ease: 'power3.out' })
        const move = (e: PointerEvent) => {
          const r = wrap.getBoundingClientRect()
          ry(((e.clientX - r.left) / r.width - 0.5) * 16)
          rx(-((e.clientY - r.top) / r.height - 0.5) * 12)
        }
        const leave = () => {
          rx(0)
          ry(0)
        }
        wrap.addEventListener('pointermove', move)
        wrap.addEventListener('pointerleave', leave)
        return () => {
          wrap.removeEventListener('pointermove', move)
          wrap.removeEventListener('pointerleave', leave)
        }
      })
      cleanups.push(() => pointerMotion.revert())
      // Phones use a gentle automatic tilt; native scrolling stays untouched.
      const mobileMotion = gsap.matchMedia()
      mobileMotion.add(
        '(prefers-reduced-motion: no-preference) and (max-width: 1023px)',
        () => {
          gsap.fromTo(stage,
            { rotationX: -1.5, rotationY: -2 },
            {
              rotationX: 1.5,
              rotationY: 2,
              duration: 3.8,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
              scrollTrigger: {
                trigger: stage,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play pause resume pause',
              },
            },
          )
        },
      )
      cleanups.push(() => mobileMotion.revert())
      /* ---- principles ---- */
      const twoCols = window.matchMedia('(min-width: 640px)').matches
      q('.ab-pr-cell').forEach((cell, i) => {
        const c = gsap.utils.selector(cell)
        gsap.set(cell, { opacity: 0, y: 56, rotateX: fine ? -14 : 0, transformPerspective: 900, transformOrigin: '50% 0%' })
        gsap.set(c('.ab-pr-rule'), { scaleX: 0 })
        gsap.set(c('.ab-pr-num'), { yPercent: 110 })
        gsap.set(c('.ab-pr-t'), { yPercent: 115 })
        gsap.set(c('.ab-pr-d'), { opacity: 0, y: 14 })
        gsap.set(c('.ab-pr-dot'), { scale: 0 })
        gsap
          .timeline({ delay: twoCols ? (i % 2) * 0.14 : 0, scrollTrigger: once(cell, 'top 90%') })
          .to(cell, { opacity: 1, y: 0, rotateX: 0, duration: 1.2, ease: 'expo.out' })
          .to(c('.ab-pr-rule'), { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.1)
          .to(c('.ab-pr-num'), { yPercent: 0, duration: 1, ease: 'expo.out' }, 0.25)
          .to(c('.ab-pr-dot'), { scale: 1, duration: 0.8, ease: 'back.out(3)' }, 0.45)
          .to(c('.ab-pr-t'), { yPercent: 0, duration: 1.05, ease: 'expo.out' }, 0.32)
          .to(c('.ab-pr-d'), { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out' }, 0.5)
      })
      /* ---- bands: they cross as they scroll in ---- */
      const bands = one('.ab-bands')
      const [bandA, bandB] = q('.ab-band')
      const crossing = { trigger: bands, start: 'top bottom', end: 'center 55%', scrub: 0.5 }
      gsap.fromTo(bandA, { rotate: 0, xPercent: -6 }, { rotate: -3, xPercent: 0, ease: 'none', scrollTrigger: crossing })
      gsap.fromTo(bandB, { rotate: 0, xPercent: 6 }, { rotate: 4, xPercent: 0, ease: 'none', scrollTrigger: { ...crossing } })
      // Desktop: scroll speed pushes the bands faster and leans them.
      if (fine) {
        const skew = gsap.quickTo(one('.ab-bands-in'), 'skewX', { duration: 0.45, ease: 'power3.out' })
        const loops = q('.ab-mq').flatMap((m) => m.getAnimations())
        let boost = 0
        let lean = 0
        const st = ScrollTrigger.create({
          trigger: bands,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const v = self.getVelocity()
            boost = Math.max(boost, Math.min(5, Math.abs(v) / 450))
            lean = gsap.utils.clamp(-7, 7, -v / 260)
          },
        })
        const tick = () => {
          boost *= 0.93
          lean *= 0.9
          loops.forEach((a) => (a.playbackRate = 1 + boost))
          skew(lean)
        }
        gsap.ticker.add(tick)
        cleanups.push(() => {
          st.kill()
          gsap.ticker.remove(tick)
          loops.forEach((a) => (a.playbackRate = 1))
        })
      }
      return () => cleanups.forEach((f) => f())
    },
    // Same elements in both languages: a language switch only swaps their text.
    [ready],
  )
  return (
    <section ref={root} className="ab" aria-labelledby="about-title">
      <div className="ab-grid" aria-hidden="true" />
      <span className="ab-wm latin" aria-hidden="true">
        MIND
      </span>
      <div className="wrap ab-layout">
        <header className="ab-head">
          <p className="ab-eb">
            <span className="ab-eb-dot sphere" aria-hidden="true" />
            <span className="ab-eb-line" aria-hidden="true" />
            <span className="ab-eb-text">{tr(ui.about.eyebrow)}</span>
          </p>
          <h2 id="about-title" className="sr-only">
            {title.join(' ')}
          </h2>
          <p className="ab-title" aria-hidden="true">
            <span className="ab-line ab-l1">
              <Split text={title[0]} perLetter={perLetter} />
            </span>
            <span className="ab-line ab-l2">
              <Split text={title[1]} perLetter={perLetter} />
            </span>
          </p>
        </header>
        <Portrait />
        <p className="ab-lead">
          {lead.map((w, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              <span className="ab-lw">{w}</span>
            </Fragment>
          ))}
        </p>
        <Principles />
      </div>
      <Bands />
    </section>
  )
}
