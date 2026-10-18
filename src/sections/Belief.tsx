import { useEffect, useMemo, useRef, type CSSProperties, type RefObject } from 'react'
import { useLang } from '../lib/i18n'
import {
  ScrollTrigger,
  clamp01,
  easeInOut,
  lerp,
  prefersReduced,
  rng,
  useCanvas,
  useFixedPin,
  useGsap,
  useMedia,
} from '../lib/gsap'
import { ui } from '../content/ui'
import { Eyebrow, Lines } from '../components/Brand'
// Match this order to ui.belief.signals.
// Files belong in public/images/signals/.
// Each image ships as WebP in two sizes (288 px for phones, 560 px for larger
// screens). The full-size PNG originals are kept in assets-src/signals/.
const SIGNAL_IMAGES = [
  'strategy',
  'branding',
  'marketing',
  'advertising',
  'digital',
  'automation',
  'content',
]
// Place your looping background video at public/videos/belief-mountain.mp4.
const BELIEF_VIDEO = '/videos/belief-mountain.mp4'
// Sparks leaving the sun: angle, distance (in sun radii), size, seconds.
const SPARKS = [0, 55, 120, 190, 250, 310].map((deg, i) => ({
  deg,
  dist: 3.2 + (i % 3) * 0.9,
  size: 2 + (i % 2),
  dur: 5.5 + i * 0.7,
  delay: -i * 1.9,
}))
// Below the site's lg breakpoint the ring is not scroll-driven: it is drawn fully assembled
// and turns slowly around the sun (radians per second, about two minutes a turn).
const MOBILE_QUERY = '(max-width: 1023px)'
const ORBIT_SPEED = 0.05
/**
 * Seven independent signals settle into one connected system.
 * Images follow the original animated node positions.
 */
export function Belief() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)
  const mobile = useMedia(MOBILE_QUERY)
  // Phones: no pin and no tall track, the section is one screen of normal page.
  useFixedPin(root, mobile ? null : '.scrolly-pin', [mobile])
  const lastFrame = useRef('')
  const progress = useRef(prefersReduced() ? 1 : 0)
  const nodeImages = useRef<HTMLImageElement[]>([])
  const sun = useRef<HTMLDivElement>(null!)
  const sunCore = useRef(-1)
  // Pause decorative sun CSS off screen; the background video keeps looping.
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-off', !entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // Load each image once, outside the animation loop, and only once the section is within
  // half a screen of the viewport, so they never compete with the hero film during the first load.
  useEffect(() => {
    const el = root.current
    const load = () => {
      if (nodeImages.current.length) return
      const size = window.innerWidth < 900 ? 288 : 560
      nodeImages.current = SIGNAL_IMAGES.map((name) => {
        const image = new Image()
        image.decoding = 'async'
        // Without a draw loop (reduced motion) the canvas must be told to paint the new image.
        image.onload = () => canvas.current?.dispatchEvent(new Event('repaint'))
        image.src = `/images/signals/${name}-${size}.webp`
        return image
      })
    }
    if (!el || !('IntersectionObserver' in window)) {
      load()
      return () => {
        nodeImages.current = []
      }
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        load()
        io.disconnect()
      },
      { rootMargin: '50% 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      nodeImages.current = []
    }
  }, [])
  useGsap(
    root,
    () => {
      // Phones and reduced motion: the ring is always fully assembled; scrolling never moves it.
      if (mobile || prefersReduced()) {
        progress.current = 1
        return
      }
      const trigger = ScrollTrigger.create({
        trigger: root.current,
        start: 'top 60%',
        end: 'bottom bottom',
        onUpdate: (s) => {
          progress.current = s.progress
        },
      })
      progress.current = trigger.progress
    },
    [mobile],
  )
  const seeds = useMemo(() => {
    const r = rng(11)
    return ui.belief.signals.map((_, i) => ({
      sx: r() * 2 - 1,
      sy: r() * 2 - 1,
      ph: r() * Math.PI * 2,
      edge: i % 4,
      th: 0.38 + (i / 7) * 0.3,
    }))
  }, [])
  const canvas = useCanvas(
    (ctx, w, h, t) => {
      const p = mobile ? 1 : progress.current
      // Touch screens with the scroll-driven ring (tablets at desktop width): repaint only when
      // something actually changed (scroll position, size, language or an image finishing
      // loading), not sixty times a second. The phone ring turns, so every frame is new.
      if (!mobile && window.matchMedia('(pointer: coarse)').matches) {
        const loaded = nodeImages.current.filter((image) => image.complete).length
        const frame = `${w}|${h}|${p.toFixed(4)}|${loaded}|${lang}`
        if (frame === lastFrame.current) return
        lastFrame.current = frame
      }
      // Touch screens: no idle drift. The scene moves only with the scroll.
      const idle = window.matchMedia('(pointer: coarse)').matches ? 0 : 1
      const cx = mobile ? w * 0.5 : w * (rtl ? 0.3 : 0.7)
      const cy = mobile ? h * 0.755 : h * 0.52
      const R = mobile
        ? Math.min(w * 0.335, h * 0.17, 230)
        : Math.min(w * 0.17, h * 0.31)
      const e = easeInOut(clamp01((p - 0.08) / 0.55))
      ctx.clearRect(0, 0, w, h)
      const n = seeds.length
      if (n === 0) return
      // Phones: the whole ring turns together, so it stays evenly spaced. `t` is 0 under
      // reduced motion (one still frame), which leaves it at rest.
      const orbit = mobile ? t * ORBIT_SPEED : t * 0.06 * e * idle
      const pts = seeds.map((s, i) => {
        const a =
          -Math.PI / 2 +
          (i / n) * Math.PI * 2 +
          orbit
        const fx = cx + Math.cos(a) * R
        const fy = cy + Math.sin(a) * R * (mobile ? 0.92 : 1)
        const spreadX = mobile ? w * 0.42 : w * 0.24
        const spreadY = mobile ? h * 0.22 : h * 0.4
        const hx =
          cx +
          s.sx * spreadX +
          Math.sin(t * 0.5 + s.ph) * 14 * idle
        const hy =
          cy +
          s.sy * spreadY +
          Math.cos(t * 0.4 + s.ph * 1.7) * 14 * idle
        return {
          x: lerp(hx, fx, e),
          y: lerp(hy, fy, e),
          s,
        }
      })
      // Entry trails: each signal arrives from its own edge.
      const trail = 1 - clamp01(p / 0.4)
      if (trail > 0.01) {
        pts.forEach(({ x, y, s }) => {
          const tx =
            s.edge === 0
              ? x - w
              : s.edge === 2
                ? x + w
                : x
          const ty =
            s.edge === 1
              ? y - h
              : s.edge === 3
                ? y + h
                : y
          const g = ctx.createLinearGradient(
            x,
            y,
            lerp(x, tx, 0.35),
            lerp(y, ty, 0.35),
          )
          g.addColorStop(0, `rgba(255,255,255,${0.35 * trail})`)
          g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.strokeStyle = g
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(tx, ty)
          ctx.stroke()
        })
      }
      // Connections: ring first, then spokes to the core.
      const seg = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        k: number,
        orange: boolean,
      ) => {
        if (k <= 0) return
        ctx.strokeStyle = orange
          ? 'rgba(246,98,13,0.75)'
          : 'rgba(255,255,255,0.3)'
        ctx.lineWidth = orange ? 1.4 : 1
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(lerp(ax, bx, k), lerp(ay, by, k))
        ctx.stroke()
      }
      pts.forEach((a, i) => {
        const b = pts[(i + 1) % n]
        seg(
          a.x,
          a.y,
          b.x,
          b.y,
          clamp01((p - a.s.th) / 0.14),
          false,
        )
        seg(
          a.x,
          a.y,
          cx,
          cy,
          clamp01((p - a.s.th - 0.16) / 0.14),
          true,
        )
      })
      // Orange core: the sun is a DOM element (BeliefSun) sitting at (cx, cy);
      // the canvas only tells it how far it has formed.
      const core = easeInOut(clamp01((p - 0.7) / 0.25))
      if (core !== sunCore.current && sun.current) {
        sunCore.current = core
        sun.current.style.setProperty('--core', core.toFixed(3))
      }
      if (core > 0) {
        // A pulse runs around the connected ring.
        const u = (t * 0.12) % 1
        const i0 = Math.floor(u * n)
        const k = u * n - i0
        const a = pts[i0]
        const b = pts[(i0 + 1) % n]
        ctx.fillStyle = `rgba(246,98,13,${core})`
        ctx.beginPath()
        ctx.arc(
          lerp(a.x, b.x, k),
          lerp(a.y, b.y, k),
          3.5,
          0,
          Math.PI * 2,
        )
        ctx.fill()
      }
      // Images and labels.
      ctx.save()
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.font = `700 ${mobile ? (w < 600 ? 11 : 12) : 14}px ${
        lang === 'ar'
          ? '"Noto Kufi Arabic Variable"'
          : '"Montserrat Variable"'
      }, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.direction = rtl ? 'rtl' : 'ltr'
      // Reset spacing when switching between English and Arabic.
      const spacedContext = ctx as unknown as {
        letterSpacing: string
      }
      spacedContext.letterSpacing = lang === 'en' ? (mobile ? '1.2px' : '2px') : '0px'
      pts.forEach(({ x, y }, i) => {
        const image = nodeImages.current[i]
        // Adjust these values to change the image size.
        // On phones the images scale with the ring so neighbours never collide.
        const size = mobile ? Math.max(58, Math.min(w < 600 ? 96 : 150, R * 0.66)) : 180
        if (
          image?.complete &&
          image.naturalWidth > 0 &&
          image.naturalHeight > 0
        ) {
          // Preserve the original image proportions.
          const scale =
            size / Math.max(image.naturalWidth, image.naturalHeight)
          const imageWidth = image.naturalWidth * scale
          const imageHeight = image.naturalHeight * scale
          ctx.drawImage(
            image,
            x - imageWidth / 2,
            y - imageHeight / 2,
            imageWidth,
            imageHeight,
          )
        } else {
          // Fallback while loading, or if the file is missing.
          ctx.fillStyle = '#fff'
          ctx.beginPath()
          ctx.arc(x, y, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
        const label =
          lang === 'ar'
            ? ui.belief.signals[i].ar
            : ui.belief.signals[i].en.toUpperCase()
        const right = x >= cx
        const labelOffset = size / 2 + 12
        ctx.fillStyle = 'rgba(255,255,255,1)'
        if (mobile) {
          // No room beside the images on a phone: the label sits underneath.
          ctx.textAlign = 'center'
          ctx.fillText(label, x, y + size / 2 + 9)
        } else {
          ctx.textAlign = right ? 'left' : 'right'
          ctx.fillText(
            label,
            x + (right ? labelOffset : -labelOffset),
            y,
          )
        }
      })
      ctx.restore()
    },
    [lang, rtl, seeds, mobile],
  )
    return (
    <section
      ref={root}
      className="scrolly"
      // Phones: the track collapses to the stage itself, with no scroll spent on assembly.
      style={{ ['--scrolly-h' as string]: mobile ? 'auto' : '230vh' }}
    >
      <div
        // Keep the existing image as a fallback beneath the looping video.
        className="scrolly-pin belief-bg"
        style={{ isolation: 'isolate' }}
      >
        <BeliefVideo />
        <BeliefFxStyle />
        <canvas
          ref={canvas}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden="true"
        />
        <BeliefSun sunRef={sun} rtl={rtl} />
        <div className="wrap relative z-20 flex h-full flex-col justify-start pt-24 lg:justify-center lg:pt-0">
          <div
            className="lg:max-w-[50%]"
            style={{
              textShadow: '0 2px 16px rgba(0, 0, 0, 0.65)',
            }}
          >
            <Eyebrow className="mb-4 !text-[0.85rem] !font-bold !text-white sm:!text-[0.95rem] lg:mb-6 lg:!text-[1rem]">
              {tr(ui.belief.eyebrow)}
            </Eyebrow>
            <Lines
              className="t-title !text-[clamp(1.75rem,5.5vw,2.75rem)] !font-bold lg:!text-[clamp(2rem,3.9vw,4rem)]"
              lines={[
                <span key="belief-line-1" className="!font-bold">
                  {tr(ui.belief.l1)}
                </span>,
                <span key="belief-line-2" className="!font-bold">
                  {tr(ui.belief.l2a)}
                  <span className="text-signal !font-bold">
                    {tr(ui.belief.l2b)}
                  </span>
                </span>,
              ]}
            />
            <p
              className="mt-4 max-w-[44ch] !text-[1.125rem] !font-bold !leading-[1.65] text-white sm:!text-[1.25rem] lg:mt-7 lg:!text-[1.375rem]"
              data-reveal="up"
            >
              {tr(ui.belief.p1)}
            </p>
            <p
              className="mt-3 max-w-[50ch] !text-[1rem] !font-semibold !leading-[1.75] text-white/95 max-lg:[@media(max-height:760px)]:hidden sm:!text-[1.0625rem] lg:!text-[1.125rem]"
              data-reveal="up"
            >
              {tr(ui.belief.p2)}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
function BeliefVideo() {
  return (
    <video
      className="belief-video"
      src={BELIEF_VIDEO}
      poster="/images/belief-mountain.webp"
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    />
  )
}
function BeliefSun({ sunRef, rtl }: { sunRef: RefObject<HTMLDivElement>; rtl: boolean }) {
  return (
    <div
      ref={sunRef}
      className="belief-sun"
      style={{ '--sun-x': rtl ? '30%' : '70%' } as CSSProperties}
      aria-hidden="true"
    >
      <span className="sun-halo" />
      <span className="sun-rays sun-rays-a" />
      <span className="sun-rays sun-rays-b" />
      <span className="sun-corona" />
      <span className="sun-flare" />
      <span className="sun-disc" />
      {SPARKS.map((spark, i) => (
        <span
          key={i}
          className="sun-spark"
          style={
            {
              width: spark.size,
              height: spark.size,
              '--deg': `${spark.deg}deg`,
              '--dist': `calc(var(--r) * ${spark.dist})`,
              animationDuration: `${spark.dur}s`,
              animationDelay: `${spark.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
function BeliefFxStyle() {
  return (
    <style>{`
      .belief-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        object-fit: cover;
        object-position: left center;
        pointer-events: none;
        display: block;
      }
      @media (max-width: 1023px) and (orientation: portrait) {
        .belief-video { object-position: 53% center; }
      }
      /* ---- the sun at the heart of the ring ---- */
      .belief-sun {
        --r: 24px;
        --core: 0;
        position: absolute;
        z-index: 15;
        left: var(--sun-x);
        top: 52%;
        width: 0;
        height: 0;
        pointer-events: none;
        opacity: var(--core);
        transform: scale(calc(0.55 + 0.45 * var(--core)));
      }
      @media (max-width: 1023px) {
        .belief-sun {
          --r: 16px;
          left: 50%;
          top: 75.5%;
          /* The canvas is 100svh tall inside a 100lvh stage: follow the canvas, not the stage. */
          top: 75.5svh;
        }
      }
      .belief-sun > span {
        position: absolute;
        left: 50%;
        top: 50%;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .sun-halo {
        width: calc(var(--r) * 14);
        height: calc(var(--r) * 14);
        background: radial-gradient(circle at center, rgba(246,98,13,0.5) 0%, rgba(246,98,13,0.2) 28%, rgba(246,98,13,0) 68%);
        mix-blend-mode: screen;
        animation: sunHalo 5.5s ease-in-out infinite alternate;
      }
      .sun-rays {
        mix-blend-mode: screen;
        -webkit-mask-image: radial-gradient(circle at center, transparent 11%, #000 20%, rgba(0,0,0,0.6) 45%, transparent 70%);
        mask-image: radial-gradient(circle at center, transparent 11%, #000 20%, rgba(0,0,0,0.6) 45%, transparent 70%);
        will-change: transform;
      }
      .sun-rays-a {
        width: calc(var(--r) * 12);
        height: calc(var(--r) * 12);
        background: repeating-conic-gradient(from 0deg, rgba(255,170,90,0) 0deg 7deg, rgba(255,175,95,0.55) 10deg, rgba(255,170,90,0) 13deg 24deg);
        opacity: 0.4;
        animation: sunTurn 90s linear infinite;
      }
      .sun-rays-b {
        width: calc(var(--r) * 9);
        height: calc(var(--r) * 9);
        background: repeating-conic-gradient(from 15deg, rgba(255,200,140,0) 0deg 20deg, rgba(255,200,140,0.5) 25deg, rgba(255,200,140,0) 30deg 45deg);
        opacity: 0.3;
        animation: sunTurn 60s linear infinite reverse;
      }
      .sun-corona {
        width: calc(var(--r) * 3.4);
        height: calc(var(--r) * 3.4);
        background: radial-gradient(circle at center, transparent 50%, rgba(255,190,120,0.85) 60%, rgba(255,120,40,0.35) 74%, transparent 100%);
        filter: blur(2px);
        animation: sunPulse 3.2s ease-in-out infinite alternate;
      }
      .sun-flare {
        width: calc(var(--r) * 18);
        height: 2px;
        border-radius: 2px;
        background: linear-gradient(90deg, transparent, rgba(255,215,170,0.85) 50%, transparent);
        mix-blend-mode: screen;
        animation: sunFlare 6s ease-in-out infinite alternate;
      }
      .sun-disc {
        width: calc(var(--r) * 2);
        height: calc(var(--r) * 2);
        background: radial-gradient(circle at 35% 32%, #FFE3B8 0%, #FFB070 22%, #F6620D 56%, #B8430A 100%);
        box-shadow:
          0 0 calc(var(--r) * 1.2) rgba(255,140,60,0.9),
          0 0 calc(var(--r) * 3) rgba(246,98,13,0.5);
        overflow: hidden;
      }
      /* a sheen turning over the surface */
      .sun-disc::after {
        content: '';
        position: absolute;
        inset: -30%;
        background: conic-gradient(from 0deg, rgba(255,255,255,0) 0deg, rgba(255,240,220,0.35) 60deg, rgba(255,255,255,0) 120deg, rgba(120,30,0,0.25) 200deg, rgba(255,255,255,0) 260deg, rgba(255,240,220,0.2) 320deg, rgba(255,255,255,0) 360deg);
        mix-blend-mode: soft-light;
        animation: sunSpin 14s linear infinite;
      }
      .sun-spark {
        background: #ffd9a0;
        box-shadow: 0 0 6px 2px rgba(255,150,60,0.8);
        opacity: 0;
        animation: sunSpark 6s ease-out infinite;
      }
      @keyframes sunHalo {
        from { opacity: 0.7; transform: translate(-50%, -50%) scale(1); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
      }
      @keyframes sunTurn {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes sunSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes sunPulse {
        from { opacity: 0.55; transform: translate(-50%, -50%) scale(0.94); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
      }
      @keyframes sunFlare {
        from { opacity: 0.3; transform: translate(-50%, -50%) scaleX(0.7); }
        to { opacity: 0.85; transform: translate(-50%, -50%) scaleX(1.1); }
      }
      @keyframes sunSpark {
        0% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--deg)) translateX(calc(var(--r) * 0.8)); }
        15% { opacity: 0.9; }
        100% { opacity: 0; transform: translate(-50%, -50%) rotate(calc(var(--deg) + 25deg)) translateX(var(--dist)); }
      }
      /* off screen: stop the clock */
      section[data-off] .belief-sun * {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .belief-sun *,
        .sun-disc::after {
          animation: none !important;
        }
        .sun-spark {
          display: none;
        }
      }
    `}</style>
  )
}
