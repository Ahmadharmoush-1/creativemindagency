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
  useFixedPin,
} from '../lib/gsap'

/**
 * Creative Mind — one unified, scroll-driven A / V brand composition.
 *
 * Replaces the previous separate SceneA / SceneV / Symbols components.
 * Keeps the public export `Symbols` and the existing i18n/GSAP integration.
 *
 * Add the four art assets from the companion ZIP to:
 *   public/images/brand/av-a.webp
 *   public/images/brand/av-v.webp
 *   public/images/brand/av-sphere.webp
 *   public/images/brand/av-finished.webp
 * (av-a, av-v and av-sphere are lossless WebP copies of the PNG originals,
 *  pixel-identical and about 55% smaller; the PNGs live in assets-src/brand/.)
 *
 * The letters and sphere are separate *textured layers* from the supplied
 * mood board, so they physically assemble before resolving into the faithful
 * final image. All typography is actual HTML and remains selectable.
 */

const ASSETS = {
  a: '/images/brand/av-a.webp',
  v: '/images/brand/av-v.webp',
  sphere: '/images/brand/av-sphere.webp',
  finished: '/images/brand/av-finished.webp',
} as const

// The artwork sits two screens below the hero: fetch it after the critical assets, not alongside them.
const deferred = { fetchpriority: 'low' } as Record<string, string>

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
  --cm-blue: #051746;
  --cm-orange: #f6620d;
  --cm-paper: #fcfcfe;
  position: relative;
  height: 275svh;
  background: var(--cm-blue);
  color: var(--cm-paper);
  font-family: Montserrat, Arial, sans-serif;
}
.cm-identity-scroll[dir='rtl'] { font-family: 'Noto Kufi Arabic Variable', 'Noto Kufi Arabic', Montserrat, sans-serif; }
.cm-identity-scroll *, .cm-identity-scroll *::before, .cm-identity-scroll *::after { box-sizing: border-box; }
.cm-identity-screen {
  position: sticky;
  top: 0;
  height: 100svh;
  min-height: 570px;
  isolation: isolate;
  overflow: hidden;
  /* When a phone hides its address bar the screen is taller than 100svh:
     continue the stage's bottom colour below it instead of showing a strip. */
  box-shadow: 0 16vh 0 0 #030f30;
  background:
    radial-gradient(ellipse at 74% 39%, rgba(19, 52, 112, .56), transparent 44%),
    radial-gradient(ellipse at 59% 78%, rgba(22, 48, 88, .35), transparent 48%),
    linear-gradient(160deg, #061840 0%, #051746 54%, #030f30 100%);
}
.cm-identity-screen::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.026) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.026) 1px, transparent 1px);
  background-size: 94px 94px;
  mask-image: linear-gradient(to bottom, rgba(0,0,0,.2), black 45%, transparent 100%);
}
.cm-identity-screen::after {
  content: '';
  position: absolute;
  left: 24%;
  right: 0;
  bottom: 10%;
  height: 25%;
  pointer-events: none;
  background: radial-gradient(ellipse at 68% 92%, rgba(141,170,213,.105), transparent 69%);
}
.cm-id-topline, .cm-id-bottomline, .cm-id-body, .cm-id-caption-row, .cm-id-services {
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
.cm-id-topline .cm-muted { color: rgba(255,255,255,.67); }
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
.cm-id-title span { display: block; white-space: nowrap; }
.cm-id-arabic {
  margin: clamp(18px, 2.6vh, 33px) 0 0;
  font-family: 'Noto Kufi Arabic Variable', 'Noto Kufi Arabic', sans-serif;
  font-size: clamp(1.05rem, 2.05vw, 2.2rem);
  line-height: 1.9;
  color: rgba(255,255,255,.96);
}
.cm-identity-scroll[dir='ltr'] .cm-id-arabic { text-align: left; }
.cm-identity-scroll[dir='rtl'] .cm-id-arabic { text-align: right; font-family: 'Montserrat Variable', Montserrat, sans-serif; }
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
  bottom: 16.0%;
  max-width: 560px;
  color: rgba(255,255,255,.80);
  font-size: clamp(.66rem, .83vw, .84rem);
  letter-spacing: .16em;
  line-height: 1.9;
}
.cm-id-services p { margin: 0; }
.cm-id-caption-row {
  bottom: 12.7%;
  inset-inline-end: 4.6%;
  width: min(40.2%, 585px);
  display: grid;
  grid-template-columns: repeat(3,minmax(0,1fr));
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
.cm-id-caption + .cm-id-caption { border-inline-start: 1px solid rgba(255,255,255,.25); }
.cm-id-caption svg { width: 30px; height: 30px; fill: none; stroke: var(--cm-orange); stroke-width: 1.8; }
.cm-id-bottomline {
  bottom: clamp(17px, 3.2vh, 34px);
  inset-inline: clamp(22px, 3.5vw, 74px);
  border-top: 1px solid rgba(255,255,255,.25);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  color: rgba(255,255,255,.57);
  font-size: clamp(9px, .70vw, 11px);
  letter-spacing: .19em;
  line-height: 1.5;
}
.cm-id-swatches { display: flex; align-items: center; gap: 18px; }
.cm-id-swatch { display: inline-flex; align-items: center; gap: 7px; white-space: nowrap; }
.cm-id-swatch i { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(255,255,255,.2); display: block; }
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
.cm-id-stage img { user-select: none; -webkit-user-drag: none; }
.cm-id-stage .cm-id-asset {
  position: absolute;
  height: auto;
  will-change: transform, opacity;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}
.cm-id-stage .cm-id-a { left: 2.12%; top: 37.18%; width: 48.81%; }
.cm-id-stage .cm-id-v { left: 56.45%; top: 51.28%; width: 41.17%; }
.cm-id-stage .cm-id-sphere { left: 32.51%; top: 4.23%; width: 38.71%; filter: drop-shadow(0 20px 28px rgba(10,6,2,.24)); }
.cm-id-stage .cm-id-orbit-svg, .cm-id-stage .cm-id-a-svg, .cm-id-stage canvas {
  position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible;
}
.cm-id-stage .cm-id-a-svg { z-index: 2; }
.cm-id-stage canvas { z-index: 2; }
.cm-id-stage .cm-id-a { z-index: 3; }
.cm-id-stage .cm-id-v { z-index: 4; }
.cm-id-stage .cm-id-orbit-svg { z-index: 5; }
.cm-id-stage .cm-id-sphere { z-index: 6; }
.cm-id-stage .cm-id-front-orbit { z-index: 7; }
.cm-id-stage .cm-id-signal {
  position: absolute;
  left: 0; top: 0;
  width: 11%;
  aspect-ratio: 1;
  margin: -5.5% 0 0 -5.5%;
  border-radius: 50%;
  z-index: 5;
  opacity: 0;
  visibility: hidden;
  background: radial-gradient(circle, rgba(246,98,13,.75) 0%, rgba(246,98,13,.28) 34%, rgba(246,98,13,0) 68%);
  will-change: transform, opacity;
}
.cm-id-stage .cm-id-finished {
  position: absolute;
  inset: 0;
  z-index: 8;
  height: 100%; width: 100%;
  object-fit: cover;
  mask-image: linear-gradient(to right, transparent 0%, #000 4%, #000 100%);
  will-change: opacity;
}
.cm-id-stage .cm-id-horizon {
  position: absolute;
  width: 105%; height: 17%;
  left: -4%; bottom: -5%;
  border-radius: 50%;
  background: radial-gradient(ellipse at 60% 30%,rgba(122,149,195,.19),transparent 63%);
  filter: blur(20px);
  pointer-events: none;
}
.cm-id-arabic-title .cm-id-title { letter-spacing: 0; line-height: 1.3; }
.cm-id-arabic-title .cm-id-title span { white-space: normal; }
.cm-identity-scroll[dir='rtl'] .cm-id-stage { inset-inline-end: auto; inset-inline-start: -1.5%; }
.cm-identity-scroll[dir='rtl'] .cm-id-body { width: 48%; }
.cm-identity-scroll[dir='rtl'] .cm-id-kicker { letter-spacing: 0; }
.cm-identity-scroll[dir='rtl'] .cm-id-services { letter-spacing: 0; }
.cm-identity-scroll[dir='rtl'] .cm-id-caption { letter-spacing: 0; }
.cm-identity-scroll[dir='rtl'] .cm-id-topline,
.cm-identity-scroll[dir='rtl'] .cm-id-bottomline { letter-spacing: .10em; }
@media (min-width: 1800px) {
  .cm-id-stage { top: 6%; width: min(57.5vw, 1178px); }
  .cm-id-body { top: 17%; }
}
@media (max-width: 1150px) {
  .cm-id-body { width: 56%; top: 20%; }
  .cm-id-title { font-size: clamp(3rem, 6.15vw, 5.4rem); }
  .cm-id-description { max-width: 390px; }
  .cm-id-stage { width: 62vw; inset-inline-end: 0%; top: 19%; }
  .cm-id-caption-row { width: 45%; }
}
@media (max-width: 767px) {
  .cm-identity-scroll { height: 215svh; }
  .cm-identity-screen { min-height: 0; }
  .cm-id-topline { top: 20px; font-size: 9px; letter-spacing: .19em; }
  .cm-id-topline .cm-muted { font-size: 8px; letter-spacing: .08em; }
  .cm-id-body { inset-inline-start: 6%; width: 88%; top: 13%; }
  .cm-id-title { font-size: clamp(2.6rem, 9.6vw, 4.6rem); letter-spacing: -.064em; line-height: 1.02; }
  .cm-id-arabic { margin-top: 12px; font-size: clamp(.9rem, 3.8vw, 1.25rem); line-height: 1.6; }
  .cm-id-kicker { font-size: 9px; letter-spacing: .12em; margin-top: 13px; }
  .cm-id-description { margin-top: 14px; font-size: clamp(.75rem, 3vw, .95rem); max-width: 370px; line-height: 1.5; }
  .cm-id-stage { top: 40%; left: -1%; right: auto; width: 103%; }
  .cm-identity-scroll[dir='rtl'] .cm-id-stage { left: -1%; right: auto; }
  .cm-id-services { left: 6%; right: 6%; bottom: 12%; max-width: none; font-size: 9px; line-height: 1.6; letter-spacing: .08em; }
  .cm-id-caption-row { bottom: 5%; left: 6%; right: 6%; width: auto; }
  .cm-id-caption { gap: 4px; font-size: 9px; min-height: 52px; }
  .cm-id-caption svg { width: 22px; height: 22px; }
  .cm-id-bottomline { display: none; }
  .cm-identity-scroll[dir='rtl'] .cm-id-body { width: 88%; }
}
@media (max-width: 390px) {
  .cm-id-body { top: 11%; }
  .cm-id-title { font-size: clamp(2.25rem, 9vw, 3.4rem); }
  .cm-id-description { font-size: .75rem; margin-top: 8px; }
  .cm-id-stage { top: 43%; }
  .cm-id-services { bottom: 13%; }
}
@media (max-height: 720px) and (min-width: 768px) {
  .cm-id-body { top: 14%; }
  .cm-id-title { font-size: clamp(2.9rem, 5.5vw, 5.4rem); }
  .cm-id-arabic { margin-top: 12px; }
  .cm-id-description { margin-top: 15px; }
  .cm-id-stage { top: 2%; width: min(58vw, 980px); }
  .cm-id-services { bottom: 15%; }
}
@media (prefers-reduced-motion: reduce) {
  .cm-id-stage .cm-id-asset, .cm-id-stage .cm-id-finished { will-change: auto; }
  .cm-identity-scroll { height: 100svh; }
}
`

export function Symbols() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)
  useFixedPin(root, '.cm-identity-screen')
  const a = useRef<HTMLImageElement>(null)
  const v = useRef<HTMLImageElement>(null)
  const sphere = useRef<HTMLImageElement>(null)
  const finished = useRef<HTMLImageElement>(null)
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

  // The earlier V particle convergence becomes the reveal of the V itself.
  // Seeded points are deterministic across renders and SSR-safe.
  const particles = useMemo<Particle[]>(() => {
    const random = rng(17)
    return Array.from({ length: 220 }, () => ({
      hx: random(),
      hy: random(),
      side: random() < .5 ? -1 : 1,
      t: random(),
      seed: random() * Math.PI * 2,
      delay: random() * .16,
      orange: random() < .25,
      radius: .7 + random() * 1.6,
    }))
  }, [])

  const particlesCanvas = useCanvas((ctx, width, height, time) => {
    ctx.clearRect(0, 0, width, height)
    const p = progress.current
    if (p < .26 || p > .72) return
    const mobile = width < 540
    // Touch screens: the points move only with the scroll, never on their own.
    const idle = window.matchMedia('(pointer: coarse)').matches ? 0 : 1
    const appear = clamp01((p - .26) / .05)
    const reveal = clamp01((p - .30) / .24)
    const vanish = 1 - clamp01((p - .56) / .14)

    for (let i = 0; i < particles.length; i++) {
      if (mobile && i % 2) continue
      const q = particles[i]
      const amount = easeInOut(clamp01((reveal - q.delay) / (1 - q.delay)))
      const targetX = width * (q.side < 0 ? .58 + q.t * .19 : .97 - q.t * .20)
      const targetY = height * (.53 + q.t * .41)
      const floatingX = width * (.55 + q.hx * .43) + Math.sin(time * .8 + q.seed) * 17 * idle
      const floatingY = height * (.15 + q.hy * .66) + Math.cos(time * .7 + q.seed) * 10 * idle
      const x = lerp(floatingX, targetX, amount)
      const y = lerp(floatingY, targetY, amount)
      const alpha = (.2 + .65 * amount) * vanish * appear
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
    if (!section || !a.current || !v.current || !sphere.current || !finished.current) return
    let cleanup = () => {}
    const context = gsap.context(() => {
      const letterA = a.current!
      const letterV = v.current!
      const globe = sphere.current!
      const finalImage = finished.current!
      const paths = [aTrace.current, aTraceRight.current].filter((path): path is SVGPathElement => Boolean(path))
      const orbitPaths = [orbitBack.current, orbitFront.current].filter((path): path is SVGPathElement => Boolean(path))
      const textIntro = headline.current
      const labels = captions.current

      if (prefersReduced()) {
        // Static reference composition is visible by default, including without JS.
        progress.current = 1
        gsap.set(finalImage, { autoAlpha: 1 })
        gsap.set([letterA, letterV, globe, signal.current, flyTrace.current, baseline.current, ...paths, ...orbitPaths], { autoAlpha: 0 })
        return
      }

      /*
       * One orange signal carries the whole scene.
       *   1. It appears at the foot of the A and climbs the left edge; the A is
       *      unveiled from the ground up exactly as far as the signal has climbed.
       *   2. At the apex it leaves the letter, arcs across the stage and swells
       *      into the sphere as it lands.
       *   3. While it is in flight, scattered points gather and the V is unveiled
       *      from its wide top down to its tip.
       *   4. The orbit is drawn, the captions arrive one by one, and the layers
       *      resolve into the finished artwork.
       * Nothing ends anywhere new: every layer finishes at its CSS position.
       */
      const box = stage.current!
      const glow = signal.current!
      const ride = ridePath.current!
      const fly = flyPath.current!
      const rideLength = ride.getTotalLength()
      const flyLength = fly.getTotalLength()
      const titleLines = textIntro ? Array.from(textIntro.querySelectorAll<HTMLElement>('.cm-id-title span')) : []
      const bodyCopy = textIntro ? Array.from(textIntro.querySelectorAll<HTMLElement>(':scope > p')) : []
      const labelItems = labels ? Array.from(labels.children) : []

      // Stage artwork is authored on a 1178 x 780 board; the sphere rests at (611, 265).
      const HOME = { x: 611, y: 265 }
      const DOT = 0.075 // the signal is the sphere itself, at 7.5 % of its size
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

        // The A image spans y 290-761 on the board: show only what the signal has passed.
        const climbed = flying ? 1 : clamp01((761 - point.y) / 471 + 0.03)
        letterA.style.clipPath = `inset(${((1 - climbed) * 100).toFixed(2)}% 0% 0% 0%)`
        letterV.style.clipPath = `inset(0% 0% ${((1 - state.v) * 100).toFixed(2)}% 0%)`
      }

      gsap.set(finalImage, { autoAlpha: 0 })
      gsap.set([letterA, letterV], { autoAlpha: 1 })
      const light = window.matchMedia('(pointer: coarse)').matches
      gsap.set(letterV, light ? { yPercent: -6 } : { yPercent: -6, filter: 'blur(10px)' })
      gsap.set(globe, { transformOrigin: '50% 50%' })
      gsap.set(paths, { autoAlpha: 0, attr: { 'stroke-dashoffset': 1 } })
      gsap.set(orbitPaths, { autoAlpha: 0, attr: { 'stroke-dashoffset': 1 } })
      gsap.set([flyTrace.current, baseline.current], { autoAlpha: 0, attr: { 'stroke-dashoffset': 1 } })
      gsap.set(box, { scale: 1.07, yPercent: 2.5, transformOrigin: '50% 70%' })
      gsap.set(titleLines, { autoAlpha: .35, yPercent: 26 })
      gsap.set(bodyCopy, { autoAlpha: .45, y: 14 })
      gsap.set(labelItems, { autoAlpha: 0, y: 22 })
      render()

      // Line drawing animates the SVG attribute: as a CSS length GSAP snaps it to whole pixels,
      // which made the lines pop in instead of drawing.
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: render })

      // Copy settles, the camera eases in for the whole scene.
      timeline.to(titleLines, { autoAlpha: 1, yPercent: 0, duration: .14, stagger: .035, ease: 'power2.out' }, 0)
      timeline.to(bodyCopy, { autoAlpha: 1, y: 0, duration: .12, stagger: .02, ease: 'power2.out' }, .04)
      timeline.to(box, { scale: 1, yPercent: 0, duration: .86, ease: 'power1.out' }, 0)

      // 01 - The signal appears on the ground line and climbs. The A rises with it.
      timeline.to(baseline.current, { autoAlpha: .5, attr: { 'stroke-dashoffset': 0 }, duration: .12, ease: 'power1.out' }, .01)
      timeline.to(state, { dot: 1, duration: .04, ease: 'power2.out' }, .03)
      timeline.to(state, { ride: 1, duration: .25, ease: 'power1.inOut' }, .05)
      if (aTrace.current) timeline.to(aTrace.current, { autoAlpha: 1, attr: { 'stroke-dashoffset': 0 }, duration: .25, ease: 'power1.inOut' }, .05)
      if (aTraceRight.current) timeline.to(aTraceRight.current, { autoAlpha: .9, attr: { 'stroke-dashoffset': 0 }, duration: .1, ease: 'power1.out' }, .28)

      // 02 - It leaves the apex, arcs over the stage and becomes the sphere.
      timeline.to(state, { fly: 1, duration: .24, ease: 'power1.inOut' }, .30)
      timeline.to(flyTrace.current, { autoAlpha: .8, attr: { 'stroke-dashoffset': 0 }, duration: .24, ease: 'power1.inOut' }, .30)
      timeline.to(paths, { autoAlpha: 0, duration: .1 }, .42)
      timeline.to([flyTrace.current, baseline.current], { autoAlpha: 0, duration: .08 }, .56)

      // 03 - Scattered attention gathers; the V is unveiled from its wide top to its point.
      timeline.to(state, { v: 1, duration: .22, ease: 'power2.inOut' }, .46)
      timeline.to(letterV, light ? { yPercent: 0, duration: .2, ease: 'power2.out' } : { yPercent: 0, filter: 'blur(0px)', duration: .2, ease: 'power2.out' }, .46)

      // 04 - The orbit is drawn around the sphere and the captions arrive in turn.
      if (orbitBack.current) timeline.to(orbitBack.current, { autoAlpha: .92, attr: { 'stroke-dashoffset': 0 }, duration: .17, ease: 'power1.inOut' }, .62)
      if (orbitFront.current) timeline.to(orbitFront.current, { autoAlpha: .80, attr: { 'stroke-dashoffset': 0 }, duration: .12, ease: 'power1.inOut' }, .72)
      timeline.to(labelItems, { autoAlpha: 1, y: 0, duration: .1, stagger: .045, ease: 'power2.out' }, .66)

      // 05 - Resolve into the photographically faithful finished mood board.
      // Crossfading avoids a visible seam between the separate 3D fragments.
      timeline.to(finalImage, { autoAlpha: 1, duration: .1 }, .88)
      timeline.to([letterA, letterV, ...orbitPaths], { autoAlpha: 0, duration: .1 }, .88)
      timeline.to(state, { dot: 0, duration: .1 }, .88)
      timeline.to({}, { duration: .02 }, .98)

      ScrollTrigger.addEventListener('refresh', render)
      cleanup = () => {
        ScrollTrigger.removeEventListener('refresh', render)
        letterA.style.clipPath = ''
        letterV.style.clipPath = ''
      }

      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        scrub: .65,
        animation: timeline,
        invalidateOnRefresh: true,
        onUpdate: self => { progress.current = self.progress },
      })

      // Reloads at a saved scroll position should show the appropriate frame.
      requestAnimationFrame(() => trigger.update())
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
          <span className="cm-muted">{tr({ en: 'BRAND EXPERIENCE / 01', ar: 'تجربة العلامة / 01' })}</span>
        </header>

        <div className={`cm-id-body${isArabic ? ' cm-id-arabic-title' : ''}`} ref={headline}>
          <h2 className="cm-id-title" id="symbols-title">
            <span>{tr({ en: 'Creativity.', ar: 'الإبداع.' })}</span>
            <span>{tr({ en: 'With direction.', ar: 'برؤية واضحة.' })}</span>
          </h2>
          <p className="cm-id-arabic" dir={isArabic ? 'ltr' : 'rtl'}>
            {isArabic ? 'Creativity with direction.' : 'إبداع يقوده التفكير الاستراتيجي'}
          </p>
          <p className="cm-id-kicker">
            {tr({ en: 'Premium  ·  Strategic  ·  Editorial  ·  Cinematic', ar: 'راقٍ · استراتيجي · تحريري · سينمائي' })}
          </p>
          <p className="cm-id-description">
            {tr({
              en: 'A distinctive digital presence connecting brand thinking, creative expression and measurable growth.',
              ar: 'حضور رقمي متفرّد يجمع بين التفكير الاستراتيجي للعلامات التجارية والتعبير الإبداعي والنمو القابل للقياس.',
            })}
          </p>
        </div>

        {/* Layered real-material artwork: independently animated A, V and sphere. */}
        <div
          className="cm-id-stage"
          ref={stage}
          dir="ltr"
          aria-hidden="true"
        >
          <div className="cm-id-horizon" />
          <svg className="cm-id-a-svg" viewBox="0 0 1178 780" fill="none" preserveAspectRatio="xMidYMid meet">
            {/* Ground line the signal starts from, and the two legs of its journey (ride, then flight). */}
            <path ref={baseline} pathLength={1} d="M-40 748 H1150" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="1" strokeDasharray="1" strokeDashoffset="1" />
            <path ref={ridePath} d="M43 746 298 303" />
            <path ref={flyPath} d="M298 303 C 413 104 560 60 611 265" />
            <path ref={flyTrace} pathLength={1} d="M298 303 C 413 104 560 60 611 265" stroke="#F6620D" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <path ref={aTrace} pathLength={1} d="M43 746 298 303" stroke="#F6620D" strokeWidth="5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
            <path ref={aTraceRight} pathLength={1} d="M373 305 588 729" stroke="#FFF8EF" strokeWidth="5" strokeLinecap="round" strokeDasharray="1" strokeDashoffset="1" />
          </svg>
          <canvas ref={particlesCanvas} />
          <img ref={a} src={ASSETS.a} className="cm-id-asset cm-id-a" alt="" width={575} height={471} draggable={false} decoding="async" {...deferred} />
          <img ref={v} src={ASSETS.v} className="cm-id-asset cm-id-v" alt="" width={485} height={366} draggable={false} decoding="async" {...deferred} />
          <svg className="cm-id-orbit-svg" viewBox="0 0 1178 780" fill="none" preserveAspectRatio="xMidYMid meet">
            <path ref={orbitBack} d="M213 146 C 175 70 262 21 395 25 C 594 30 802 86 966 205 C 1081 286 1144 382 1040 415 C 897 465 620 350 425 298 C 306 266 218 197 213 146" pathLength={1} stroke="#F6620D" strokeWidth="1.6" strokeDasharray="1" strokeDashoffset="1" />
          </svg>
          <span ref={signal} className="cm-id-signal" />
          <img ref={sphere} src={ASSETS.sphere} className="cm-id-asset cm-id-sphere" alt="" width={456} height={464} draggable={false} decoding="async" {...deferred} />
          <svg className="cm-id-orbit-svg cm-id-front-orbit" viewBox="0 0 1178 780" fill="none" preserveAspectRatio="xMidYMid meet">
            <path ref={orbitFront} d="M 394 267 C 543 356 792 420 1010 415" pathLength={1} stroke="#FF9A50" strokeOpacity=".65" strokeWidth="1.2" strokeDasharray="1" strokeDashoffset="1" />
          </svg>
          {/* Exact artwork finish, only after the A, V and sphere assemble. */}
          <img ref={finished} src={ASSETS.finished} className="cm-id-finished" alt="" width={1178} height={780} draggable={false} decoding="async" loading="lazy" />
        </div>

        <div className="cm-id-services">
          <p>{tr({ en: 'Brands / Campaigns / Systems / Funnels', ar: 'العلامات التجارية / الحملات / الأنظمة / مسارات التحويل' })}</p>
          <p>{tr({ en: 'Automations / Digital Experiences / Growth Engines', ar: 'الأتمتة / التجارب الرقمية / محركات النمو' })}</p>
        </div>

        <div className="cm-id-caption-row" ref={captions} aria-label={tr({ en: 'Brand symbolism', ar: 'رموز العلامة' })}>
          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="13" /></svg>
            <span>{tr({ en: 'Sphere /', ar: 'الكرة /' })}<br />{tr({ en: 'Creative energy', ar: 'الطاقة الإبداعية' })}</span>
          </div>
          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M 3 29 16 4 29 29" /></svg>
            <span>A /<br />{tr({ en: 'Growth', ar: 'النمو' })}</span>
          </div>
          <div className="cm-id-caption">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M 3 4 16 29 29 4 Z" /></svg>
            <span>V /<br />{tr({ en: 'Conversion', ar: 'التحويل' })}</span>
          </div>
        </div>

      
      </div>
    </section>
  )
}
