import { useLayoutEffect, useMemo, useRef } from 'react'
import { useLang } from '../lib/i18n'
import {
  ScrollTrigger,
  clamp01,
  easeInOut,
  gsap,
  lerp,
  prefersReduced,
  rng,
  useCanvas,
} from '../lib/gsap'

const ASSETS = {
  a: '/images/brand/av-a.webp',
  v: '/images/brand/av-v.webp',
  sphere: '/images/brand/av-sphere.webp',
} as const

const SYMBOLS_AT_TOP = 0.8

const deferred = {
  fetchpriority: 'low',
} as Record<string, string>

type Particle = {
  hx: number
  hy: number
  side: number
  t: number
  seed: number
  delay: number
  orange: boolean
  radius: number
}

const styles = `
.cm-identity-scroll {
  --cm-blue: #06193a;
  --cm-orange: #f6620d;
  --cm-paper: #fcfcfe;
  position: relative;
  height: auto;
  background: var(--cm-blue);
  color: var(--cm-paper);
  font-family: Montserrat, Arial, sans-serif;
}

.cm-identity-scroll[dir='rtl'] {
  font-family: 'Noto Kufi Arabic Variable', 'Noto Kufi Arabic', Montserrat, sans-serif;
}

.cm-identity-scroll *,
.cm-identity-scroll *::before,
.cm-identity-scroll *::after {
  box-sizing: border-box;
}

/* Normal document flow: no sticky positioning or pinning. */
.cm-identity-screen {
  position: relative;
  height: 100svh;
  min-height: 570px;
  isolation: isolate;
  overflow: hidden;
  background: var(--cm-blue);
}

.cm-id-topline,
.cm-id-body,
.cm-id-caption-row,
.cm-id-services {
  position: absolute;
  z-index: 4;
}

.cm-id-topline {
  inset-inline: clamp(22px, 3.5vw, 74px);
  top: clamp(22px, 4.5vh, 54px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  font-size: clamp(9px, .8vw, 12px);
  font-weight: 650;
  letter-spacing: .32em;
  line-height: 1.5;
}

.cm-id-topline .cm-muted {
  color: rgba(255,255,255,.67);
}

.cm-id-body {
  inset-inline-start: clamp(22px, 3.5vw, 74px);
  top: 16.8%;
  width: 50%;
  max-width: 835px;
}

.cm-id-title {
  margin: 0;
  font-size: clamp(3.45rem, 6.3vw, 8.2rem);
  line-height: .99;
  letter-spacing: -.082em;
  font-weight: 800;
  text-wrap: balance;
}

.cm-id-title span {
  display: block;
  white-space: nowrap;
}

.cm-id-arabic {
  margin: clamp(18px, 2.6vh, 33px) 0 0;
  font-family: 'Noto Kufi Arabic Variable', 'Noto Kufi Arabic', sans-serif;
  font-size: clamp(1.05rem, 2.05vw, 2.2rem);
  line-height: 1.9;
  color: rgba(255,255,255,.96);
}

.cm-identity-scroll[dir='ltr'] .cm-id-arabic {
  text-align: left;
}

.cm-identity-scroll[dir='rtl'] .cm-id-arabic {
  text-align: right;
  font-family: 'Montserrat Variable', Montserrat, sans-serif;
}

.cm-id-kicker {
  margin: 16px 0 0;
  color: rgba(255,255,255,.78);
  font-size: clamp(.65rem, .98vw, .95rem);
  line-height: 1.75;
  font-weight: 520;
  letter-spacing: .25em;
}

.cm-id-description {
  margin: clamp(28px, 4.4vh, 52px) 0 0;
  max-width: 490px;
  color: rgba(255,255,255,.83);
  font-size: clamp(.85rem, 1.2vw, 1.16rem);
  line-height: 1.8;
  font-weight: 420;
}

.cm-id-services {
  inset-inline-start: clamp(22px, 3.5vw, 74px);
  bottom: 16%;
  max-width: 560px;
  color: rgba(255,255,255,.80);
  font-size: clamp(.66rem, .83vw, .84rem);
  letter-spacing: .16em;
  line-height: 1.9;
}

.cm-id-services p {
  margin: 0;
}

.cm-id-caption-row {
  bottom: 12.7%;
  inset-inline-end: 4.6%;
  width: min(40.2%, 585px);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: end;
  gap: 0;
}

.cm-id-caption {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
  min-height: 80px;
  color: rgba(255,255,255,.88);
  font-size: clamp(.60rem, .82vw, .86rem);
  line-height: 1.4;
  letter-spacing: .09em;
}

.cm-id-caption + .cm-id-caption {
  border-inline-start: 1px solid rgba(255,255,255,.25);
}

.cm-id-caption svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: var(--cm-orange);
  stroke-width: 1.8;
}

.cm-id-stage {
  position: absolute;
  width: min(59.2vw, 1178px);
  aspect-ratio: 1178 / 780;
  top: 9.5%;
  inset-inline-end: -1.5%;
  z-index: 2;
  direction: ltr;
  perspective: 1200px;
  pointer-events: none;
}

.cm-id-stage img {
  user-select: none;
  -webkit-user-drag: none;
}

.cm-id-stage .cm-id-asset {
  position: absolute;
  height: auto;
  will-change: transform, opacity;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.cm-id-stage .cm-id-a {
  left: 2.12%;
  top: 37.18%;
  width: 48.81%;
  z-index: 3;
}

.cm-id-stage .cm-id-v {
  left: 56.45%;
  top: 51.28%;
  width: 41.17%;
  z-index: 4;
}

.cm-id-stage .cm-id-sphere {
  left: 32.51%;
  top: 4.23%;
  width: 38.71%;
  filter: drop-shadow(0 20px 28px rgba(10,6,2,.24));
  z-index: 6;
}

.cm-id-stage .cm-id-orbit-svg,
.cm-id-stage .cm-id-a-svg,
.cm-id-stage canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.cm-id-stage .cm-id-a-svg,
.cm-id-stage canvas {
  z-index: 2;
}

.cm-id-stage .cm-id-orbit-svg {
  z-index: 5;
}

.cm-id-stage .cm-id-front-orbit {
  z-index: 7;
}

.cm-id-stage .cm-id-signal {
  position: absolute;
  left: 0;
  top: 0;
  width: 11%;
  aspect-ratio: 1;
  margin: -5.5% 0 0 -5.5%;
  border-radius: 50%;
  z-index: 5;
  opacity: 0;
  visibility: hidden;
  background: radial-gradient(
    circle,
    rgba(246,98,13,.75) 0%,
    rgba(246,98,13,.28) 34%,
    rgba(246,98,13,0) 68%
  );
  will-change: transform, opacity;
}

.cm-id-arabic-title .cm-id-title {
  letter-spacing: 0;
  line-height: 1.3;
}

.cm-id-arabic-title .cm-id-title span {
  white-space: normal;
}

.cm-identity-scroll[dir='rtl'] .cm-id-stage {
  inset-inline-end: auto;
  inset-inline-start: -1.5%;
}

.cm-identity-scroll[dir='rtl'] .cm-id-body {
  width: 48%;
}

.cm-identity-scroll[dir='rtl'] .cm-id-kicker,
.cm-identity-scroll[dir='rtl'] .cm-id-services,
.cm-identity-scroll[dir='rtl'] .cm-id-caption {
  letter-spacing: 0;
}

.cm-identity-scroll[dir='rtl'] .cm-id-topline {
  letter-spacing: .10em;
}

@media (min-width: 1800px) {
  .cm-id-stage {
    top: 6%;
    width: min(57.5vw, 1178px);
  }

  .cm-id-body {
    top: 17%;
  }
}

@media (max-width: 1150px) {
  .cm-id-body {
    width: 56%;
    top: 20%;
  }

  .cm-id-title {
    font-size: clamp(3rem, 6.15vw, 5.4rem);
  }

  .cm-id-description {
    max-width: 390px;
  }

  .cm-id-stage {
    width: 62vw;
    inset-inline-end: 0%;
    top: 19%;
  }

  .cm-id-caption-row {
    width: 45%;
  }
}

@media (max-width: 767px) {
  .cm-identity-screen {
    min-height: 0;
  }

  .cm-id-topline {
    top: 20px;
    font-size: 9px;
    letter-spacing: .19em;
  }

  .cm-id-topline .cm-muted {
    font-size: 8px;
    letter-spacing: .08em;
  }

  .cm-id-body {
    inset-inline-start: 6%;
    width: 88%;
    top: 13%;
  }

  .cm-id-title {
    font-size: clamp(2.6rem, 9.6vw, 4.6rem);
    letter-spacing: -.064em;
    line-height: 1.02;
  }

  .cm-id-arabic {
    margin-top: 12px;
    font-size: clamp(.9rem, 3.8vw, 1.25rem);
    line-height: 1.6;
  }

  .cm-id-kicker {
    font-size: 9px;
    letter-spacing: .12em;
    margin-top: 13px;
  }

  .cm-id-description {
    margin-top: 14px;
    font-size: clamp(.75rem, 3vw, .95rem);
    max-width: 370px;
    line-height: 1.5;
  }

  .cm-id-stage {
    top: 40%;
    left: -1%;
    right: auto;
    width: 103%;
  }

  .cm-identity-scroll[dir='rtl'] .cm-id-stage {
    left: -1%;
    right: auto;
  }

  .cm-id-services {
    left: 6%;
    right: 6%;
    bottom: 12%;
    max-width: none;
    font-size: 9px;
    line-height: 1.6;
    letter-spacing: .08em;
  }

  .cm-id-caption-row {
    bottom: 5%;
    left: 6%;
    right: 6%;
    width: auto;
  }

  .cm-id-caption {
    gap: 4px;
    font-size: 9px;
    min-height: 52px;
  }

  .cm-id-caption svg {
    width: 22px;
    height: 22px;
  }

  .cm-identity-scroll[dir='rtl'] .cm-id-body {
    width: 88%;
  }
}

@media (max-width: 390px) {
  .cm-id-body {
    top: 11%;
  }

  .cm-id-title {
    font-size: clamp(2.25rem, 9vw, 3.4rem);
  }

  .cm-id-description {
    font-size: .75rem;
    margin-top: 8px;
  }

  .cm-id-stage {
    top: 43%;
  }

  .cm-id-services {
    bottom: 13%;
  }
}

@media (max-height: 720px) and (min-width: 768px) {
  .cm-id-body {
    top: 14%;
  }

  .cm-id-title {
    font-size: clamp(2.9rem, 5.5vw, 5.4rem);
  }

  .cm-id-arabic {
    margin-top: 12px;
  }

  .cm-id-description {
    margin-top: 15px;
  }

  .cm-id-stage {
    top: 2%;
    width: min(58vw, 980px);
  }

  .cm-id-services {
    bottom: 15%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cm-id-stage .cm-id-asset {
    will-change: auto;
  }
}
`

export function Symbols() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)

  const a = useRef<HTMLImageElement>(null)
  const v = useRef<HTMLImageElement>(null)
  const sphere = useRef<HTMLImageElement>(null)

  const aTrace = useRef<SVGPathElement>(null)
  const aTraceRight = useRef<SVGPathElement>(null)
  const orbitBack = useRef<SVGPathElement>(null)
  const orbitFront = useRef<SVGPathElement>(null)

  const headline = useRef<HTMLDivElement>(null)
  const captions = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const signal = useRef<HTMLSpanElement>(null)

  const ridePath = useRef<SVGPathElement>(null)
  const flyPath = useRef<SVGPathElement>(null)
  const flyTrace = useRef<SVGPathElement>(null)
  const baseline = useRef<SVGPathElement>(null)

  const progress = useRef(0)

  const particles = useMemo<Particle[]>(() => {
    const random = rng(17)

    return Array.from({ length: 220 }, () => ({
      hx: random(),
      hy: random(),
      side: random() < 0.5 ? -1 : 1,
      t: random(),
      seed: random() * Math.PI * 2,
      delay: random() * 0.16,
      orange: random() < 0.25,
      radius: 0.7 + random() * 1.6,
    }))
  }, [])

  const particlesCanvas = useCanvas((ctx, width, height, time) => {
    ctx.clearRect(0, 0, width, height)

    const p = progress.current
    if (p < 0.26 || p > 0.72) return

    const mobile = width < 540
    const idle = window.matchMedia('(pointer: coarse)').matches ? 0 : 1

    const appear = clamp01((p - 0.26) / 0.05)
    const reveal = clamp01((p - 0.30) / 0.24)
    const vanish = 1 - clamp01((p - 0.56) / 0.14)

    for (let i = 0; i < particles.length; i++) {
      if (mobile && i % 2) continue

      const q = particles[i]
      const amount = easeInOut(
        clamp01((reveal - q.delay) / (1 - q.delay)),
      )

      const targetX =
        width * (q.side < 0 ? 0.58 + q.t * 0.19 : 0.97 - q.t * 0.20)

      const targetY = height * (0.53 + q.t * 0.41)

      const floatingX =
        width * (0.55 + q.hx * 0.43) +
        Math.sin(time * 0.8 + q.seed) * 17 * idle

      const floatingY =
        height * (0.15 + q.hy * 0.66) +
        Math.cos(time * 0.7 + q.seed) * 10 * idle

      const x = lerp(floatingX, targetX, amount)
      const y = lerp(floatingY, targetY, amount)
      const alpha = (0.2 + 0.65 * amount) * vanish * appear

      ctx.fillStyle = q.orange
        ? `rgba(246,98,13,${alpha})`
        : `rgba(255,255,255,${alpha})`

      ctx.beginPath()
      ctx.arc(x, y, q.radius, 0, Math.PI * 2)
      ctx.fill()
    }
  }, [particles])

  useLayoutEffect(() => {
    const section = root.current

    if (
      !section ||
      !a.current ||
      !v.current ||
      !sphere.current ||
      !stage.current ||
      !signal.current ||
      !ridePath.current ||
      !flyPath.current
    ) {
      return
    }

    let cleanup = () => {}

    const context = gsap.context(() => {
      const letterA = a.current!
      const letterV = v.current!
      const globe = sphere.current!
      const box = stage.current!
      const glow = signal.current!
      const ride = ridePath.current!
      const fly = flyPath.current!

      const paths = [aTrace.current, aTraceRight.current].filter(
        (path): path is SVGPathElement => Boolean(path),
      )

      const orbitPaths = [orbitBack.current, orbitFront.current].filter(
        (path): path is SVGPathElement => Boolean(path),
      )

      const textIntro = headline.current
      const labels = captions.current

      const titleLines = textIntro
        ? Array.from(
            textIntro.querySelectorAll<HTMLElement>('.cm-id-title span'),
          )
        : []

      const bodyCopy = textIntro
        ? Array.from(
            textIntro.querySelectorAll<HTMLElement>(':scope > p'),
          )
        : []

      const labelItems = labels ? Array.from(labels.children) : []

      if (prefersReduced()) {
        progress.current = 1

        gsap.set([letterA, letterV, globe], {
          autoAlpha: 1,
          clearProps: 'transform,filter,clipPath',
        })

        gsap.set(
          [glow, flyTrace.current, baseline.current, ...paths],
          { autoAlpha: 0 },
        )

        gsap.set(orbitPaths, {
          autoAlpha: 0.9,
          attr: { 'stroke-dashoffset': 0 },
        })

        return
      }

      const rideLength = ride.getTotalLength()
      const flyLength = fly.getTotalLength()

      const HOME = { x: 611, y: 265 }
      const DOT = 0.075
      const state = { dot: 0, ride: 0, fly: 0, v: 0 }

      const render = () => {
        const k = box.offsetWidth / 1178
        const flying = state.fly > 0

        const point = flying
          ? fly.getPointAtLength(state.fly * flyLength)
          : ride.getPointAtLength(state.ride * rideLength)

        const size = DOT + (1 - DOT) * Math.pow(state.fly, 2.4)

        gsap.set(globe, {
          x: (point.x - HOME.x) * k,
          y: (point.y - HOME.y) * k,
          scale: size * (0.4 + 0.6 * state.dot),
          rotate: -55 * (1 - state.fly),
          autoAlpha: state.dot,
        })

        gsap.set(glow, {
          x: point.x * k,
          y: point.y * k,
          scale: 1 + state.fly * 2.2,
          autoAlpha: state.dot * Math.pow(1 - state.fly, 1.6),
        })

        const climbed = flying
          ? 1
          : clamp01((761 - point.y) / 471 + 0.03)

        letterA.style.clipPath =
          `inset(${((1 - climbed) * 100).toFixed(2)}% 0% 0% 0%)`

        letterV.style.clipPath =
          `inset(0% 0% ${((1 - state.v) * 100).toFixed(2)}% 0%)`
      }

      const light = window.matchMedia('(pointer: coarse)').matches

      gsap.set([letterA, letterV], { autoAlpha: 1 })

      gsap.set(
        letterV,
        light
          ? { yPercent: -6 }
          : { yPercent: -6, filter: 'blur(10px)' },
      )

      gsap.set(globe, { transformOrigin: '50% 50%' })

      gsap.set(paths, {
        autoAlpha: 0,
        attr: { 'stroke-dashoffset': 1 },
      })

      gsap.set(orbitPaths, {
        autoAlpha: 0,
        attr: { 'stroke-dashoffset': 1 },
      })

      gsap.set([flyTrace.current, baseline.current], {
        autoAlpha: 0,
        attr: { 'stroke-dashoffset': 1 },
      })

      gsap.set(box, {
        scale: 1.07,
        yPercent: 2.5,
        transformOrigin: '50% 70%',
      })

      gsap.set(titleLines, { autoAlpha: 0.35, yPercent: 26 })
      gsap.set(bodyCopy, { autoAlpha: 0.45, y: 14 })
      gsap.set(labelItems, { autoAlpha: 0, y: 22 })

      render()

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'none' },
        onUpdate: render,
      })

      // Text and stage entrance.
      timeline.to(titleLines, {
        autoAlpha: 1,
        yPercent: 0,
        duration: 0.14,
        stagger: 0.035,
        ease: 'power2.out',
      }, 0)

      timeline.to(bodyCopy, {
        autoAlpha: 1,
        y: 0,
        duration: 0.12,
        stagger: 0.02,
        ease: 'power2.out',
      }, 0.04)

      timeline.to(box, {
        scale: 1,
        yPercent: 0,
        duration: 0.86,
        ease: 'power1.out',
      }, 0)

      // The signal climbs the A.
      timeline.to(baseline.current, {
        autoAlpha: 0.5,
        attr: { 'stroke-dashoffset': 0 },
        duration: 0.12,
        ease: 'power1.out',
      }, 0.01)

      timeline.to(state, {
        dot: 1,
        duration: 0.04,
        ease: 'power2.out',
      }, 0.03)

      timeline.to(state, {
        ride: 1,
        duration: 0.25,
        ease: 'power1.inOut',
      }, 0.05)

      if (aTrace.current) {
        timeline.to(aTrace.current, {
          autoAlpha: 1,
          attr: { 'stroke-dashoffset': 0 },
          duration: 0.25,
          ease: 'power1.inOut',
        }, 0.05)
      }

      if (aTraceRight.current) {
        timeline.to(aTraceRight.current, {
          autoAlpha: 0.9,
          attr: { 'stroke-dashoffset': 0 },
          duration: 0.1,
          ease: 'power1.out',
        }, 0.28)
      }

      // The signal becomes the sphere.
      timeline.to(state, {
        fly: 1,
        duration: 0.24,
        ease: 'power1.inOut',
      }, 0.30)

      timeline.to(flyTrace.current, {
        autoAlpha: 0.8,
        attr: { 'stroke-dashoffset': 0 },
        duration: 0.24,
        ease: 'power1.inOut',
      }, 0.30)

      timeline.to(paths, {
        autoAlpha: 0,
        duration: 0.1,
      }, 0.42)

      timeline.to([flyTrace.current, baseline.current], {
        autoAlpha: 0,
        duration: 0.08,
      }, 0.56)

      // Reveal the V.
      timeline.to(state, {
        v: 1,
        duration: 0.22,
        ease: 'power2.inOut',
      }, 0.46)

      timeline.to(
        letterV,
        light
          ? {
              yPercent: 0,
              duration: 0.2,
              ease: 'power2.out',
            }
          : {
              yPercent: 0,
              filter: 'blur(0px)',
              duration: 0.2,
              ease: 'power2.out',
            },
        0.46,
      )

      // Two matching semicircles form one precise circular ring.
      if (orbitBack.current) {
        timeline.to(orbitBack.current, {
          autoAlpha: 0.9,
          attr: { 'stroke-dashoffset': 0 },
          duration: 0.11,
          ease: 'none',
        }, 0.62)
      }

      if (orbitFront.current) {
        timeline.to(orbitFront.current, {
          autoAlpha: 0.9,
          attr: { 'stroke-dashoffset': 0 },
          duration: 0.11,
          ease: 'none',
        }, 0.73)
      }

      timeline.to(labelItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.1,
        stagger: 0.045,
        ease: 'power2.out',
      }, 0.66)

      // Preserve timing; the page continues scrolling normally.
      // The symbols remain visible after assembly.
      timeline.to({}, { duration: 0.14 }, 0.86)

      ScrollTrigger.addEventListener('refresh', render)

      const startAt = 0.5
      const endAt = startAt - startAt / SYMBOLS_AT_TOP

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: `top ${startAt * 100}%`,
        end: `top ${endAt * 100}%`,
        scrub: 0.4,
        pin: false,
        animation: timeline,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.current = self.progress
        },
      })

      const frame = requestAnimationFrame(() => trigger.update())

      cleanup = () => {
        cancelAnimationFrame(frame)
        ScrollTrigger.removeEventListener('refresh', render)
        letterA.style.clipPath = ''
        letterV.style.clipPath = ''
      }
    }, section)

    return () => {
      cleanup()
      context.revert()
    }
  }, [lang])

  const isArabic = lang === 'ar'

  return (
    <section
      id="symbols"
      ref={root}
      className="cm-identity-scroll"
      dir={rtl ? 'rtl' : 'ltr'}
      aria-labelledby="symbols-title"
    >
      <style>{styles}</style>

      <div className="cm-identity-screen">
        <header className="cm-id-topline">
          <span>CREATIVE MIND</span>

          <span className="cm-muted">
            {tr({
              en: 'BRAND EXPERIENCE / 01',
              ar: 'تجربة العلامة / 01',
            })}
          </span>
        </header>

        <div
          className={`cm-id-body${isArabic ? ' cm-id-arabic-title' : ''}`}
          ref={headline}
        >
          <h2 className="cm-id-title" id="symbols-title">
            <span>{tr({ en: 'Creativity.', ar: 'الإبداع.' })}</span>
            <span>
              {tr({ en: 'With direction.', ar: 'برؤية واضحة.' })}
            </span>
          </h2>

          {/* <p className="cm-id-arabic" dir={isArabic ? 'ltr' : 'rtl'}>
            {isArabic
              ? 'Creativity with direction.'
              : 'إبداع يقوده التفكير الاستراتيجي'}
          </p> */}

          <p className="cm-id-kicker">
            {tr({
              en: 'Premium · Strategic · Editorial · Cinematic',
              ar: 'راقٍ · استراتيجي · تحريري · سينمائي',
            })}
          </p>

          <p className="cm-id-description">
            {tr({
              en: 'A distinctive digital presence connecting brand thinking, creative expression and measurable growth.',
              ar: 'حضور رقمي متفرّد يجمع بين التفكير الاستراتيجي للعلامات التجارية والتعبير الإبداعي والنمو القابل للقياس.',
            })}
          </p>
        </div>

        <div
          className="cm-id-stage"
          ref={stage}
          dir="ltr"
          aria-hidden="true"
        >
          <svg
            className="cm-id-a-svg"
            viewBox="0 0 1178 780"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              ref={baseline}
              pathLength={1}
              d="M-40 748 H1150"
              stroke="#FFFFFF"
              strokeOpacity=".5"
              strokeWidth="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <path ref={ridePath} d="M43 746 298 303" />

            <path
              ref={flyPath}
              d="M298 303 C 413 104 560 60 611 265"
            />

            <path
              ref={flyTrace}
              pathLength={1}
              d="M298 303 C 413 104 560 60 611 265"
              stroke="#F6620D"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <path
              ref={aTrace}
              pathLength={1}
              d="M43 746 298 303"
              stroke="#F6620D"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />

            <path
              ref={aTraceRight}
              pathLength={1}
              d="M373 305 588 729"
              stroke="#FFF8EF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>

          <canvas ref={particlesCanvas} />

          <img
            ref={a}
            src={ASSETS.a}
            className="cm-id-asset cm-id-a"
            alt=""
            width={575}
            height={471}
            draggable={false}
            decoding="async"
            {...deferred}
          />

          <img
            ref={v}
            src={ASSETS.v}
            className="cm-id-asset cm-id-v"
            alt=""
            width={485}
            height={366}
            draggable={false}
            decoding="async"
            {...deferred}
          />

          {/* Upper half of the circle: center 611,265; radius 300. */}
          <svg
            className="cm-id-orbit-svg"
            viewBox="0 0 1178 780"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              ref={orbitBack}
              d="M 311 265 A 300 300 0 0 1 911 265"
              pathLength={1}
              stroke="#F6620D"
              strokeWidth="1.6"
              strokeLinecap="butt"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>

          <span ref={signal} className="cm-id-signal" />

          <img
            ref={sphere}
            src={ASSETS.sphere}
            className="cm-id-asset cm-id-sphere"
            alt=""
            width={456}
            height={464}
            draggable={false}
            decoding="async"
            {...deferred}
          />

          {/* Lower half joins the upper half without overlapping it. */}
          <svg
            className="cm-id-orbit-svg cm-id-front-orbit"
            viewBox="0 0 1178 780"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              ref={orbitFront}
              d="M 911 265 A 300 300 0 0 1 311 265"
              pathLength={1}
              stroke="#F6620D"
              strokeWidth="1.6"
              strokeLinecap="butt"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
          </svg>
        </div>

        <div className="cm-id-services">
          <p>
            {tr({
              en: 'Brands / Campaigns / Systems / Funnels',
              ar: 'العلامات التجارية / الحملات / الأنظمة / مسارات التحويل',
            })}
          </p>

          <p>
            {tr({
              en: 'Automations / Digital Experiences / Growth Engines',
              ar: 'الأتمتة / التجارب الرقمية / محركات النمو',
            })}
          </p>
        </div>

        <div
          className="cm-id-caption-row"
          ref={captions}
          aria-label={tr({
            en: 'Brand symbolism',
            ar: 'رموز العلامة',
          })}
        >
          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <circle cx="16" cy="16" r="13" />
            </svg>

            <span>
              {tr({ en: 'Sphere /', ar: 'الكرة /' })}
              <br />
              {tr({
                en: 'Creative energy',
                ar: 'الطاقة الإبداعية',
              })}
            </span>
          </div>

          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M 3 29 16 4 29 29" />
            </svg>

            <span>
              A /
              <br />
              {tr({ en: 'Growth', ar: 'النمو' })}
            </span>
          </div>

          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true">
              <path d="M 3 4 16 29 29 4 Z" />
            </svg>

            <span>
              V /
              <br />
              {tr({ en: 'Conversion', ar: 'التحويل' })}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}