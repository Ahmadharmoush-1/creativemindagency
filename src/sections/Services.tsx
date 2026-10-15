import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useLang } from '../lib/i18n'
import {
  ScrollTrigger,
  clamp01,
  getLenis,
  gsap,
  prefersReduced,
  useFixedPin,
  useGsap,
  useMedia,
} from '../lib/gsap'
import { num, services } from '../content/services'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'
import { ServiceVisual, buildVisual } from '../visuals/ServiceVisual'

const N = services.length

/*
  IMAGE PATHS

  Put your image here:
  public/images/services-background-1672.webp

  Then reference it without "/public".
*/
// Web copy of the PNG master in assets-src/backgrounds/services-background.png (same picture, about 15x smaller).
const DESKTOP_BACKGROUND = '/images/services-background-1672.webp'

// Optional portrait crop for phones.
// Leave empty to use DESKTOP_BACKGROUND.
const MOBILE_BACKGROUND = '/images/services-background-mobile.webp'

// 0 = original image, 1 = completely black.
const BACKGROUND_OVERLAY = 0.48

// Adjust these if the main subject needs repositioning.
// The animated lights (ServicesFx) assume 'center center'; move IMAGE_W/MOBILE_CROP_X with them if you change these.
const DESKTOP_BACKGROUND_POSITION = 'center center'
const MOBILE_BACKGROUND_POSITION = 'center center'

/*
  ANIMATED LIGHTS

  The picture is a still. ServicesFx draws a stage with the picture's exact
  geometry over it and animates the neon strips, the far-edge floor bars,
  their reflections in the wet floor, the mist and a few embers. Every
  element is placed in the picture's own pixels (1672 x 941) and the stage
  is sized like object-fit: cover, so the lights stay glued to the image at
  any viewport. The phone crop is the same picture from x = 330 to 1035.

  It is CSS only: no extra image bytes, animations pause off screen and are
  switched off for reduced motion.
*/
const IMAGE_W = 1672
const IMAGE_H = 941
const MOBILE_CROP_X = 330
const MOBILE_CROP_W = 705

type Glow = {
  x: number
  y: number
  w: number
  h: number
  dur: number // seconds per breath
  delay?: number
  lo?: number
  hi?: number
  tone?: 'orange' | 'amber' | 'cyan'
  flicker?: boolean
}

// Neon strips on the buildings and the orange ledges (picture pixels, centre + size).
const NEON: Glow[] = [
  { x: 160, y: 90, w: 80, h: 260, dur: 4.6, lo: 0.25, hi: 0.95 },
  { x: 156, y: 260, w: 80, h: 220, dur: 5.2, delay: -1.6, lo: 0.25, hi: 0.95 },
  { x: 118, y: 400, w: 100, h: 110, dur: 4.1, delay: -2.4, lo: 0.22, hi: 0.9 },
  { x: 55, y: 452, w: 100, h: 60, dur: 4.1, delay: -2.4, lo: 0.22, hi: 0.85 },
  { x: 6, y: 200, w: 50, h: 420, dur: 6, delay: -3, lo: 0.25, hi: 0.6 },
  { x: 212, y: 255, w: 40, h: 210, dur: 7.5, lo: 0.4, hi: 0.9, flicker: true },
  { x: 1642, y: 185, w: 56, h: 280, dur: 4.9, delay: -0.8, lo: 0.25, hi: 0.95 },
  { x: 1660, y: 370, w: 46, h: 150, dur: 4.3, delay: -2.9, lo: 0.22, hi: 0.9 },
  { x: 1455, y: 370, w: 34, h: 160, dur: 8.2, delay: -3.5, lo: 0.4, hi: 0.9, flicker: true },
  { x: 1600, y: 525, w: 160, h: 56, dur: 5.4, delay: -1.2, lo: 0.22, hi: 0.85 },
  { x: 65, y: 502, w: 160, h: 40, dur: 5.8, delay: -2.1, lo: 0.22, hi: 0.85 },
]

// Floor bars along the far edge of the plaza.
const BARS: Glow[] = [
  { x: 340, y: 600, w: 250, h: 38, dur: 3.8, lo: 0.22, hi: 0.95 },
  { x: 480, y: 605, w: 110, h: 32, dur: 4.4, delay: -1.1, lo: 0.22, hi: 0.9 },
  { x: 767, y: 617, w: 90, h: 28, dur: 3.5, delay: -0.7, lo: 0.22, hi: 0.95 },
  { x: 1022, y: 622, w: 80, h: 28, dur: 4.1, delay: -2.2, lo: 0.22, hi: 0.95 },
  { x: 1197, y: 606, w: 80, h: 28, dur: 3.9, delay: -1.5, lo: 0.22, hi: 0.95 },
  { x: 1355, y: 573, w: 90, h: 28, dur: 4.6, delay: -0.4, lo: 0.22, hi: 0.9 },
  { x: 1390, y: 603, w: 140, h: 32, dur: 3.7, delay: -2.8, lo: 0.22, hi: 0.95 },
  { x: 1505, y: 652, w: 180, h: 38, dur: 4.2, delay: -1.9, lo: 0.22, hi: 0.95 },
  { x: 1630, y: 672, w: 110, h: 32, dur: 4.8, delay: -0.9, lo: 0.22, hi: 0.9 },
  // the character's visor
  { x: 678, y: 510, w: 90, h: 80, dur: 3.2, delay: -1, lo: 0.1, hi: 0.4, tone: 'amber' },
  // cyan edge line at the foot of the far wall
  { x: 230, y: 652, w: 470, h: 12, dur: 5.6, delay: -2, lo: 0.15, hi: 0.5, tone: 'cyan' },
  { x: 1300, y: 652, w: 400, h: 12, dur: 5.6, delay: -4.3, lo: 0.15, hi: 0.5, tone: 'cyan' },
]

// Warm pools of light on the wet floor under the strongest reflections.
const POOLS: Glow[] = [
  { x: 140, y: 800, w: 170, h: 320, dur: 5.1, lo: 0.1, hi: 0.32 },
  { x: 660, y: 860, w: 170, h: 210, dur: 4.4, delay: -1.7, lo: 0.1, hi: 0.3 },
  { x: 1400, y: 790, w: 150, h: 260, dur: 5.5, delay: -2.6, lo: 0.1, hi: 0.3 },
  { x: 1636, y: 820, w: 110, h: 280, dur: 4.8, delay: -0.6, lo: 0.1, hi: 0.3 },
]

// Blue mist drifting across the middle distance, away from the character.
const MIST = [
  { x: 420, y: 470, w: 560, h: 250, dur: 24, delay: -6, lo: 0.1, hi: 0.22 },
  { x: 1080, y: 545, w: 620, h: 230, dur: 30, delay: -14, lo: 0.1, hi: 0.2 },
  { x: 1260, y: 480, w: 420, h: 170, dur: 21, delay: -3, lo: 0.08, hi: 0.18 },
]

// Embers rising from the neon: x, y of the start point, size, seconds per rise.
const EMBERS = [
  [150, 460, 3, 9], [185, 420, 2.5, 7.5], [130, 500, 3.5, 10.5], [215, 350, 2, 8],
  [90, 470, 2.5, 9.5], [1620, 400, 3, 8.5], [1655, 300, 2.5, 10], [1460, 420, 2, 7],
  [1570, 540, 3, 9], [1500, 600, 2.5, 8], [330, 600, 2, 7.5], [470, 606, 2.5, 8.5],
  [1200, 608, 2, 9], [1390, 605, 2.5, 7.8],
].map(([x, y, size, dur], index) => ({
  x,
  y,
  size,
  dur,
  delay: -((index * 2.7) % dur),
}))

const px = (value: number, total: number) => `${(value / total) * 100}%`

function glowStyle(glow: Glow): CSSProperties {
  return {
    left: px(glow.x - glow.w / 2, IMAGE_W),
    top: px(glow.y - glow.h / 2, IMAGE_H),
    width: px(glow.w, IMAGE_W),
    height: px(glow.h, IMAGE_H),
    animationDuration: `${glow.dur}s`,
    animationDelay: `${glow.delay ?? 0}s`,
    '--lo': glow.lo ?? 0.3,
    '--hi': glow.hi ?? 0.8,
  } as CSSProperties
}

/* A second, hidden copy of the picture used by the reflection and light-sweep layers. */
function FxPicture({ className }: { className: string }) {
  return (
    <picture>
      {MOBILE_BACKGROUND && (
        <source media="(max-width: 1023px)" srcSet={MOBILE_BACKGROUND} />
      )}
      <img
        src={DESKTOP_BACKGROUND}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        className={`svc-copy ${className}`}
      />
    </picture>
  )
}

function ServicesFx() {
  const root = useRef<HTMLDivElement>(null)

  // Animations run only while the section is on screen.
  useEffect(() => {
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-off', !entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={root} className="svc-fx" aria-hidden="true">
      <div className="svc-stage">
        {/* reflections in the wet floor: a brightened copy of the picture, only where
            it is brighter than the original, with a slow ripple crawling through it */}
        <div className="svc-floor">
          <div className="svc-ripple">
            <FxPicture className="svc-copy-wet" />
          </div>
        </div>

        {/* a band of light travelling along the far edge of the plaza */}
        <div className="svc-horizon">
          <div className="svc-sweep">
            <FxPicture className="svc-copy-hot" />
          </div>
        </div>

        <div className="svc-mist">
          {MIST.map((m, i) => (
            <span
              key={i}
              className="svc-cloud"
              style={{
                ...glowStyle({ ...m, w: m.w, h: m.h }),
                animationDuration: `${m.dur}s, ${m.dur * 0.37}s`,
                animationDelay: `${m.delay}s, ${m.delay * 0.5}s`,
              }}
            />
          ))}
        </div>

        <div className="svc-glows">
          {POOLS.map((g, i) => (
            <span key={`p${i}`} className="svc-glow svc-pool" style={glowStyle(g)} />
          ))}
          {NEON.map((g, i) => (
            <span
              key={`n${i}`}
              className={`svc-glow ${g.flicker ? 'svc-flicker' : ''}`}
              style={glowStyle(g)}
            />
          ))}
          {BARS.map((g, i) => (
            <span
              key={`b${i}`}
              className={`svc-glow ${g.tone === 'cyan' ? 'svc-cyan' : g.tone === 'amber' ? 'svc-amber' : ''}`}
              style={glowStyle(g)}
            />
          ))}
        </div>

        <div className="svc-embers">
          {EMBERS.map((e, i) => (
            <span
              key={i}
              className="svc-ember"
              style={{
                left: px(e.x, IMAGE_W),
                top: px(e.y, IMAGE_H),
                width: e.size,
                height: e.size,
                animationDuration: `${e.dur}s`,
                animationDelay: `${e.delay}s`,
                '--drift': `${((i % 3) - 1) * 14}px`,
              } as CSSProperties}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/*
  Decorative background:
  - Uses a mobile source when provided.
  - Does not capture clicks.
  - Uses no fixed background attachment on phones.
*/
function ServicesBackground({ pinned = false }: { pinned?: boolean }) {
  const picture = (
    <>
      <picture className="block h-full w-full">
        {MOBILE_BACKGROUND && (
          <source
            media="(max-width: 1023px)"
            srcSet={MOBILE_BACKGROUND}
          />
        )}

        <img
          src={DESKTOP_BACKGROUND}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          className="services-background-image block h-full w-full object-cover"
          style={
            {
              '--services-bg-desktop': DESKTOP_BACKGROUND_POSITION,
              '--services-bg-mobile': MOBILE_BACKGROUND_POSITION,
            } as CSSProperties
          }
        />
      </picture>

      <ServicesFx />

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: BACKGROUND_OVERLAY }}
      />

      {/* Phones: extra shade at the top and bottom, where the copy sits. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030e2e]/75 via-[#030e2e]/10 to-[#030e2e]/90 lg:hidden" />
    </>
  )

  /*
    pinned: the picture is drawn ONCE and stays in view while a long block
    scrolls over it. Use this instead of giving every row its own copy.
  */
  if (pinned) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#09111d]"
      >
        <div className="services-pinned-stage sticky top-0 overflow-hidden">
          {picture}
        </div>
      </div>
    )
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#09111d]"
    >
      {picture}
    </div>
  )
}

/*
  Keep these styles inside the component file.
  No separate CSS file is required.
*/
function ServicesStyles() {
  return (
    <style>{`
      .services-background-image {
        object-position: var(--services-bg-desktop, center);
      }

      /* Full screen even with the phone's address bar hidden; the content
         inside keeps to the smaller, always-visible height. */
      .services-pinned-stage {
        height: 100vh;
        height: 100lvh;
      }

      .services-pinned-stage > .wrap {
        height: 100vh;
        height: 100svh;
      }

      .services-pinned-visual {
        width: min(100%, 58vh, 620px);
      }

      .services-pinned-caption {
        max-width: min(58vh, 620px);
      }

      .services-mobile-visual {
        width: min(74vw, 100%, 38vh, 460px);
      }

      @supports (height: 100svh) {

        .services-pinned-visual {
          width: min(100%, 58svh, 620px);
        }

        .services-pinned-caption {
          max-width: min(58svh, 620px);
        }

        .services-mobile-visual {
          width: min(74vw, 100%, 38svh, 460px);
        }
      }

      @media (max-width: 1023px) {
        .services-background-image {
          object-position: var(--services-bg-mobile, center);
        }
      }

      /* ---------- animated lights over the still ---------- */

      .svc-fx {
        position: absolute;
        inset: 0;
        overflow: hidden;
        pointer-events: none;
        container-type: size;
      }

      /* The stage has the picture's exact geometry, sized like object-fit: cover
         (centre position), so percentages inside it are picture pixels. */
      .svc-stage {
        --sw: ${IMAGE_W};
        --sx: 0;
        --s: max(100cqw / var(--sw), 100cqh / ${IMAGE_H});
        position: absolute;
        width: calc(${IMAGE_W} * var(--s));
        height: calc(${IMAGE_H} * var(--s));
        left: calc((100cqw - var(--sw) * var(--s)) / 2 - var(--sx) * var(--s));
        top: calc((100cqh - ${IMAGE_H} * var(--s)) / 2);
      }

      .svc-copy {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        object-fit: fill;
        display: block;
      }

      @media (max-width: 1023px) {
        .svc-stage {
          --sw: ${MOBILE_CROP_W};
          --sx: ${MOBILE_CROP_X};
        }
        /* the phone file is a crop: put it back where it belongs on the stage */
        .svc-copy {
          left: ${(MOBILE_CROP_X / IMAGE_W) * 100}%;
          width: ${(MOBILE_CROP_W / IMAGE_W) * 100}%;
        }
      }

      /* wet floor: only the bright reflections survive the lighten blend */
      .svc-floor {
        position: absolute;
        inset: 0;
        mix-blend-mode: lighten;
        -webkit-mask-image: linear-gradient(to bottom, transparent 68%, #000 74%, #000 100%);
        mask-image: linear-gradient(to bottom, transparent 68%, #000 74%, #000 100%);
        animation: svcShimmer 5.5s ease-in-out infinite alternate;
      }
      .svc-ripple {
        position: absolute;
        inset: 0;
        -webkit-mask-image: repeating-linear-gradient(to bottom, #000 0, #000 5px, rgba(0,0,0,0.25) 9px, rgba(0,0,0,0.25) 11px, #000 16px);
        mask-image: repeating-linear-gradient(to bottom, #000 0, #000 5px, rgba(0,0,0,0.25) 9px, rgba(0,0,0,0.25) 11px, #000 16px);
        animation: svcCrawl 1.9s linear infinite;
      }
      .svc-copy-wet {
        filter: contrast(1.7) brightness(1.08) saturate(1.35);
        animation: svcSway 7s ease-in-out infinite alternate;
      }

      /* light band travelling along the far edge */
      .svc-horizon {
        position: absolute;
        inset: 0;
        mix-blend-mode: lighten;
        -webkit-mask-image: linear-gradient(to bottom, transparent 49%, #000 55%, #000 70%, transparent 75%);
        mask-image: linear-gradient(to bottom, transparent 49%, #000 55%, #000 70%, transparent 75%);
      }
      .svc-sweep {
        position: absolute;
        inset: 0;
        -webkit-mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 0%, rgba(0,0,0,0.7) 40%, transparent 72%);
        mask-image: radial-gradient(ellipse 50% 50% at 50% 50%, #000 0%, rgba(0,0,0,0.7) 40%, transparent 72%);
        -webkit-mask-size: 34% 100%;
        mask-size: 34% 100%;
        -webkit-mask-repeat: no-repeat;
        mask-repeat: no-repeat;
        animation: svcSweep 11s ease-in-out infinite;
      }
      .svc-copy-hot {
        filter: contrast(1.6) brightness(1.3) saturate(1.35);
      }

      .svc-mist,
      .svc-glows,
      .svc-embers {
        position: absolute;
        inset: 0;
        mix-blend-mode: screen;
      }

      .svc-cloud {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(150,190,255,0.9), rgba(110,150,230,0.45) 40%, transparent 70%);
        animation: svcDrift 24s ease-in-out infinite alternate, svcBreathe 9s ease-in-out infinite alternate;
      }

      .svc-glow {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(ellipse at center, rgba(255,170,80,0.95), rgba(255,120,40,0.45) 38%, rgba(255,100,30,0) 70%);
        animation: svcBreathe 4s ease-in-out infinite alternate;
      }
      .svc-pool {
        background: radial-gradient(ellipse at center, rgba(255,140,60,0.8), rgba(255,100,30,0.3) 45%, transparent 72%);
      }
      .svc-amber {
        background: radial-gradient(ellipse at center, rgba(255,220,140,0.95), rgba(255,170,70,0.4) 45%, transparent 70%);
      }
      .svc-cyan {
        background: radial-gradient(ellipse at center, rgba(140,230,255,0.9), rgba(60,170,255,0.4) 45%, transparent 75%);
      }
      .svc-flicker {
        animation-name: svcFlicker;
        animation-timing-function: steps(1, end);
        animation-direction: normal;
      }

      .svc-ember {
        position: absolute;
        border-radius: 50%;
        background: #ffd9a0;
        box-shadow: 0 0 6px 2px rgba(255,150,60,0.8);
        opacity: 0;
        animation: svcRise 8s linear infinite;
      }

      @keyframes svcBreathe {
        from { opacity: var(--lo, 0.3); }
        to { opacity: var(--hi, 0.8); }
      }
      @keyframes svcFlicker {
        0%, 100% { opacity: var(--hi, 0.8); }
        7% { opacity: calc(var(--lo, 0.3) * 0.6); }
        9% { opacity: var(--hi, 0.8); }
        11% { opacity: var(--lo, 0.3); }
        13% { opacity: var(--hi, 0.8); }
        46% { opacity: calc(var(--hi, 0.8) * 0.85); }
        48% { opacity: var(--lo, 0.3); }
        50% { opacity: var(--hi, 0.8); }
        78% { opacity: calc(var(--hi, 0.8) * 0.9); }
        79% { opacity: calc(var(--lo, 0.3) * 0.7); }
        80% { opacity: var(--hi, 0.8); }
      }
      @keyframes svcShimmer {
        from { opacity: 0.4; }
        to { opacity: 1; }
      }
      @keyframes svcCrawl {
        from { -webkit-mask-position: 0 0; mask-position: 0 0; }
        to { -webkit-mask-position: 0 16px; mask-position: 0 16px; }
      }
      @keyframes svcSway {
        from { transform: translateX(-0.25%); }
        to { transform: translateX(0.25%); }
      }
      @keyframes svcSweep {
        from { -webkit-mask-position: -70% 0; mask-position: -70% 0; }
        to { -webkit-mask-position: 170% 0; mask-position: 170% 0; }
      }
      @keyframes svcDrift {
        from { transform: translate3d(-3%, 0, 0) scale(1); }
        to { transform: translate3d(3%, -6%, 0) scale(1.1); }
      }
      @keyframes svcRise {
        0% { transform: translate3d(0, 0, 0); opacity: 0; }
        12% { opacity: 0.8; }
        70% { opacity: 0.5; }
        100% { transform: translate3d(var(--drift, 0px), -140px, 0); opacity: 0; }
      }

      /* off screen: stop the clock */
      .svc-fx[data-off] * {
        animation-play-state: paused;
      }

      @media (prefers-reduced-motion: reduce) {
        .services-surface *,
        .services-surface *::before,
        .services-surface *::after {
          transition: none !important;
        }
        .svc-fx * {
          animation: none !important;
        }
        .svc-glow,
        .svc-cloud {
          opacity: calc((var(--lo, 0.3) + var(--hi, 0.8)) / 2);
        }
        .svc-embers,
        .svc-sweep {
          display: none;
        }
      }
    `}</style>
  )
}

/*
  Shared by the desktop and phone layouts: the section is a tall track with a
  sticky stage. Scroll position picks the active service and drives its
  assembly animation. `--svc-p` (0 to 1) is how far through the active
  service the reader is; the phone progress bar reads it.
*/
function usePinnedServices(root: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0)

  useGsap(
    root,
    () => {
      const el = root.current
      if (!el) return

      const timelines = services.map((service) => {
        const visual = el.querySelector<HTMLElement>(
          `.sv-${service.id}`,
        )

        return visual
          ? buildVisual(service.id, visual).pause()
          : null
      })

      let current = -1

      const update = (progress: number) => {
        const position = progress * N
        const index = Math.min(N - 1, Math.floor(position))
        const timeline = timelines[index]

        el.style.setProperty(
          '--svc-p',
          clamp01(position - index).toFixed(3),
        )

        if (index !== current) {
          timelines.forEach((otherTimeline, otherIndex) => {
            if (!otherTimeline || otherIndex === index) return

            gsap.killTweensOf(otherTimeline)
            otherTimeline.progress(otherIndex < index ? 1 : 0)
          })

          current = index
          setActive(index)
        }

        if (timeline) {
          gsap.to(timeline, {
            progress: clamp01((position - index) / 0.72),
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true,
          })
        }
      }

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      })

      update(trigger.progress)

      return () => {
        trigger.kill()

        timelines.forEach((timeline) => {
          if (!timeline) return
          gsap.killTweensOf(timeline)
          timeline.kill()
        })
      }
    },
    [],
  )

  const go = (index: number) => {
    const el = root.current
    if (!el) return

    const top = el.getBoundingClientRect().top + window.scrollY
    const distance = Math.max(
      0,
      el.offsetHeight - window.innerHeight,
    )

    const y = top + ((index + 0.6) / N) * distance
    const lenis = getLenis()

    if (lenis) {
      lenis.scrollTo(y, { duration: 1.1 })
    } else {
      window.scrollTo({
        top: y,
        behavior: prefersReduced() ? 'auto' : 'smooth',
      })
    }
  }

  return { active, go }
}

/*
  Phones and tablets: one full-screen stage with ONE background.
  The reader scrolls and the services change in place: counter, visual,
  title and line, with a seven-part progress bar that can also be tapped.
*/
function ServicesPinnedMobile() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const { active, go } = usePinnedServices(root)
  useFixedPin(root, '.services-pinned-stage')

  return (
    <section
      ref={root}
      className="services-surface relative"
      style={{ height: `${N * 52 + 100}svh` }}
      aria-labelledby="services-title"
    >
      <ServicesStyles />

      <div className="services-pinned-stage sticky top-0 isolate overflow-hidden">
        <ServicesBackground />

        <div className="wrap relative z-10 flex h-full flex-col pt-[5.5rem] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow mb-3 flex items-center gap-3 text-white/75">
                <span
                  aria-hidden="true"
                  className="sphere-flat block h-1.5 w-1.5"
                />
                {tr(ui.services.eyebrow)}
              </p>

              <h2
                id="services-title"
                className="text-[clamp(1.5rem,6.6vw,2.4rem)] font-semibold uppercase leading-none tracking-tight rtl:leading-snug rtl:tracking-normal"
              >
                <span className="font-light">
                  {ui.services.title[lang][0]}
                </span>{' '}
                {ui.services.title[lang][1]}
                <span className="text-signal">.</span>
              </h2>
            </div>

            <p
              className="latin shrink-0 text-sm text-white/60 tabular-nums"
              aria-hidden="true"
            >
              <span className="text-[1.9rem] font-semibold leading-none text-signal">
                {num(active)}
              </span>
              <span className="mx-1.5">/</span>
              {num(N - 1)}
            </p>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <div className="services-mobile-visual relative aspect-square">
              <span
                aria-hidden="true"
                className="absolute -inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(3,14,46,0.72)_0%,rgba(3,14,46,0.45)_45%,transparent_70%)]"
              />

              {services.map((service, index) => (
                <div
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : index < active
                        ? 'pointer-events-none -translate-y-6 scale-90 opacity-0'
                        : 'pointer-events-none translate-y-6 scale-90 opacity-0'
                  }`}
                >
                  <ServiceVisual
                    id={service.id}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            className="relative min-h-[9.25rem] sm:min-h-[10.5rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {services.map((service, index) => (
              <div
                key={service.id}
                aria-hidden={index !== active}
                className={`absolute inset-x-0 top-0 transition-all duration-700 ease-cine ${
                  index === active
                    ? 'opacity-100'
                    : index < active
                      ? '-translate-y-4 opacity-0'
                      : 'translate-y-4 opacity-0'
                }`}
              >
                <h3 className="text-[clamp(1.7rem,8.4vw,3rem)] font-bold uppercase leading-none tracking-tight rtl:leading-snug rtl:tracking-normal">
                  {tr(service.title)}
                </h3>

                <p className="mt-3 max-w-[34ch] text-[1.02rem] leading-snug text-white/85 sm:text-lg rtl:leading-relaxed">
                  {tr(service.line)}
                </p>
              </div>
            ))}
          </div>

          <ol className="mt-3 flex gap-1.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {services.map((service, index) => (
              <li key={service.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`${num(index)} — ${tr(service.title)}`}
                  aria-current={index === active ? 'true' : undefined}
                  className="block w-full py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25">
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-signal rtl:origin-right"
                      style={{
                        transform:
                          index < active
                            ? 'scaleX(1)'
                            : index === active
                              ? 'scaleX(var(--svc-p, 0))'
                              : 'scaleX(0)',
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/*
  Desktop: sticky background, service list,
  and existing scroll-controlled assembly animations.
*/
function ServicesPinned() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const { active, go } = usePinnedServices(root)

  return (
    <section
      ref={root}
      className="services-surface relative"
      style={{ height: `${N * 62 + 100}vh` }}
      aria-labelledby="services-title"
    >
      <ServicesStyles />

      <div className="services-pinned-stage sticky top-0 isolate overflow-hidden">
        <ServicesBackground />

        <div className="wrap relative z-10 grid h-full grid-cols-[0.95fr_1.05fr] items-center gap-8 py-6 xl:gap-12">
          <div className="min-w-0">
            <Eyebrow className="mb-5 text-white/70">
              {tr(ui.services.eyebrow)}
            </Eyebrow>

            <h2 id="services-title" className="t-title uppercase">
              <span className="font-light">
                {ui.services.title[lang][0]}
              </span>{' '}
              {ui.services.title[lang][1]}
              <span className="text-signal">.</span>
            </h2>

            <p className="mt-4 max-w-[42ch] text-[0.95rem] leading-relaxed text-white/75">
              {tr(ui.services.intro)}
            </p>

            <div className="relative mt-8">
              <span
                aria-hidden="true"
                className="sphere pointer-events-none absolute -start-[5px] top-0 block h-2.5 w-2.5 transition-transform duration-700 ease-cine"
                style={
                  {
                    transform: `translateY(calc(${active} * var(--row) + var(--row) / 2 - 5px))`,
                    '--row': 'clamp(2.5rem, 5.6vh, 3.4rem)',
                  } as CSSProperties
                }
              />

              <ol className="border-s border-white/20">
                {services.map((service, index) => (
                  <li
                    key={service.id}
                    style={{
                      height: 'clamp(2.5rem, 5.6vh, 3.4rem)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => go(index)}
                      aria-current={
                        index === active ? 'true' : undefined
                      }
                      className={`group flex h-full w-full items-center gap-4 rounded-sm ps-7 text-start transition-all duration-500 ease-cine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${
                        index === active
                          ? 'text-white'
                          : 'text-white/55 hover:text-white/90'
                      }`}
                    >
                      <span
                        className={`latin shrink-0 text-[0.7rem] font-medium tabular-nums ${
                          index === active ? 'text-signal' : ''
                        }`}
                      >
                        {num(index)}
                      </span>

                      <span
                        className={`font-semibold uppercase transition-all duration-500 ease-cine rtl:tracking-normal ${
                          index === active
                            ? 'text-[clamp(1.3rem,2.1vw,2rem)] tracking-tight'
                            : 'text-base tracking-wide'
                        }`}
                      >
                        {tr(service.title)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="relative min-w-0">
            <span
              aria-hidden="true"
              className="latin absolute -top-6 end-0 text-[clamp(6rem,13vw,13rem)] font-bold leading-none text-white/[0.07] tabular-nums"
            >
              {num(active)}
            </span>

            <div className="services-pinned-visual relative mx-auto aspect-square">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : 'pointer-events-none scale-95 opacity-0'
                  }`}
                >
                  <ServiceVisual
                    id={service.id}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ))}
            </div>

            <div
              className="services-pinned-caption relative mx-auto mt-4 min-h-[6.5rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {services.map((service, index) => (
                <p
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`t-lead absolute inset-x-0 top-0 text-white transition-all duration-700 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : 'translate-y-3 opacity-0'
                  }`}
                >
                  {tr(service.line)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/*
  Stacked rows: the full Services page, and the fallback for reduced
  motion or very short windows.

  The rows share ONE background that stays pinned to the screen while
  they scroll over it. Pass background={false} when the parent already
  provides one.
*/
export function ServiceRows({
  full = false,
  background = true,
}: {
  full?: boolean
  background?: boolean
}) {
  const { tr } = useLang()
  const root = useRef<HTMLDivElement>(null)

  useGsap(
    root,
    () => {
      const el = root.current
      if (!el) return

      const still = prefersReduced()
      const phone = window.innerWidth < 1024
      const timelines: ReturnType<typeof buildVisual>[] = []
      const triggers: ScrollTrigger[] = []

      const rows = gsap.utils.toArray<HTMLElement>(
        '.svc-row',
        el,
      )

      rows.forEach((row, index) => {
        const service = services[index]
        const visual = row.querySelector<HTMLElement>('.sv')

        if (!service || !visual) return

        const timeline = buildVisual(service.id, visual).pause()
        timelines.push(timeline)

        if (still) {
          timeline.progress(1)
          return
        }

        triggers.push(
          ScrollTrigger.create({
            trigger: visual,
            start: phone ? 'top 96%' : 'top 88%',
            end: phone ? 'center 62%' : 'center 42%',
            scrub: 0.6,
            animation: timeline,
            invalidateOnRefresh: true,
          }),
        )
      })

      return () => {
        triggers.forEach((trigger) => trigger.kill())
        timelines.forEach((timeline) => timeline.kill())
      }
    },
    [],
  )

  return (
    <div ref={root} className="services-surface relative isolate">
      <ServicesStyles />

      {background && <ServicesBackground pinned />}

      {services.map((service, index) => (
        <article
          key={service.id}
          id={service.id}
          className="svc-row group relative z-10 scroll-mt-24 border-t border-white/15"
        >

          <div
            className={`wrap relative z-10 grid min-w-0 items-center gap-6 py-10 sm:gap-8 sm:py-14 lg:grid-cols-2 lg:gap-16 ${
              full ? 'lg:py-24' : 'lg:py-14'
            }`}
          >
            <div
              className={`min-w-0 ${
                full && index % 2 === 1 ? 'lg:order-2' : ''
              }`}
            >
              <p className="latin text-sm font-medium text-signal tabular-nums">
                {num(index)}
              </p>

              <h3 className="t-display mt-3 !text-[clamp(2rem,5vw,4.6rem)]">
                {tr(service.title)}
              </h3>

              <p className="t-lead mt-4 max-w-[30ch] text-white">
                {tr(service.line)}
              </p>

              {full && (
                <>
                  <p className="mt-5 max-w-[52ch] leading-relaxed text-white/75 rtl:leading-loose">
                    {tr(service.detail)}
                  </p>

                  <h4 className="eyebrow mb-3 mt-8 text-white/60">
                    {tr(ui.services.includes)}
                  </h4>

                  <ul className="flex max-w-[34rem] flex-wrap gap-2">
                    {service.includes.map((item) => (
                      <li
                        key={item.en}
                        className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm text-white/90"
                      >
                        {tr(item)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="relative mx-auto aspect-square w-full min-w-0 max-w-[340px] sm:max-w-[460px] lg:max-w-[520px]">
              <ServiceVisual
                id={service.id}
                className="relative h-full w-full transition-transform duration-700 ease-cine motion-safe:lg:group-hover:-translate-y-2"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export function Services() {
  const { tr, lang } = useLang()

  const desktop = useMedia('(min-width: 1024px)')
  const enoughHeight = useMedia('(min-height: 740px)')
  const reducedMotion = useMedia(
    '(prefers-reduced-motion: reduce)',
  )

  /*
    Short desktop windows use stacked rows too,
    preventing the sticky content from being clipped.
  */
  // Measured once, not live: a phone's viewport height changes every time its address bar
  // slides in or out, and switching layouts mid-scroll would make the page jump.
  const [tallEnoughForPhoneStage] = useState(
    () => window.innerHeight >= 520,
  )
  const motionAllowed = !reducedMotion && !prefersReduced()

  if (motionAllowed && desktop && enoughHeight) {
    return <ServicesPinned />
  }

  // Phones and tablets get their own single-screen stage.
  if (motionAllowed && !desktop && tallEnoughForPhoneStage) {
    return <ServicesPinnedMobile />
  }

  // Fallback (reduced motion, very short windows): stacked rows over one pinned background.
  return (
    <section
      className="services-surface relative isolate"
      aria-labelledby="services-title-m"
    >
      <ServicesStyles />

      <ServicesBackground pinned />

      <div className="wrap relative z-10 py-12 sm:py-16">
        <Eyebrow className="mb-6 text-white/70">
          {tr(ui.services.eyebrow)}
        </Eyebrow>

        <h2 id="services-title-m" className="sr-only">
          {ui.services.title[lang].join(' ')}
        </h2>

        <Lines
          as="p"
          className="t-display"
          lines={[
            <span key="first" className="thin">
              {ui.services.title[lang][0]}
            </span>,
            dot(ui.services.title[lang][1] + '.'),
          ]}
        />

        <p className="t-lead mt-6 max-w-[36ch] text-white/75">
          {tr(ui.services.intro)}
        </p>
      </div>

      <ServiceRows background={false} />

    </section>
  )
}
