import { useEffect, useMemo, useRef } from 'react'
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

/**
 * Seven independent signals settle into one connected system.
 * Images follow the original animated node positions.
 */
export function Belief() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)
  useFixedPin(root, '.scrolly-pin')
  const lastFrame = useRef('')
  const progress = useRef(prefersReduced() ? 1 : 0)
  const nodeImages = useRef<HTMLImageElement[]>([])

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

  useGsap(root, () => {
    if (prefersReduced()) return

    ScrollTrigger.create({
      trigger: root.current,
      start: 'top 60%',
      end: 'bottom bottom',
      onUpdate: (s) => {
        progress.current = s.progress
      },
    })
  })

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
      const p = progress.current
      const mobile = w < 900

      // Touch screens: repaint only when something actually changed (scroll position,
      // size, language or an image finishing loading), not sixty times a second.
      if (window.matchMedia('(pointer: coarse)').matches) {
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

      const pts = seeds.map((s, i) => {
        const a =
          -Math.PI / 2 +
          (i / n) * Math.PI * 2 +
          t * 0.06 * e * idle

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

      // Orange core.
      const core = easeInOut(clamp01((p - 0.7) / 0.25))

      if (core > 0) {
        const r = (mobile ? 16 : 24) * core

        const glow = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          r * 5,
        )

        glow.addColorStop(0, 'rgba(246,98,13,0.45)')
        glow.addColorStop(1, 'rgba(246,98,13,0)')

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(cx, cy, r * 5, 0, Math.PI * 2)
        ctx.fill()

        const g = ctx.createRadialGradient(
          cx - r * 0.3,
          cy - r * 0.35,
          0,
          cx,
          cy,
          r,
        )

        g.addColorStop(0, '#FFC296')
        g.addColorStop(0.45, '#F6620D')
        g.addColorStop(1, '#B8430A')

        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()

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

      ctx.font = `500 ${mobile ? (w < 600 ? 9.5 : 11) : 12}px ${
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

        ctx.fillStyle = 'rgba(255,255,255,0.78)'

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
    [lang, rtl, seeds],
  )

    return (
    <section
      ref={root}
      className="scrolly"
      style={{ ['--scrolly-h' as string]: '230vh' }}
    >
      <div
        // The background image and its phone crop are set by .belief-bg in index.css.
        className="scrolly-pin belief-bg"
        style={{ isolation: 'isolate' }}
      >
        <canvas
          ref={canvas}
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          aria-hidden="true"
        />

        <div className="wrap relative z-20 flex h-full flex-col justify-start pt-24 lg:justify-center lg:pt-0">
          <div
            className="lg:max-w-[50%]"
            style={{
              textShadow: '0 2px 16px rgba(0, 0, 0, 0.65)',
            }}
          >
            <Eyebrow className="mb-4 text-white/80 lg:mb-6 lg:text-white/70">
              {tr(ui.belief.eyebrow)}
            </Eyebrow>

            <Lines
              className="t-title lg:!text-[clamp(2.2rem,4.4vw,4.6rem)]"
              lines={[
                <span key="belief-line-1" className="font-light">
                  {tr(ui.belief.l1)}
                </span>,

                <span key="belief-line-2">
                  {tr(ui.belief.l2a)}
                  <span className="text-signal">
                    {tr(ui.belief.l2b)}
                  </span>
                </span>,
              ]}
            />

            <p
              className="mt-4 max-w-[44ch] font-medium lg:mt-9 lg:text-lg"
              data-reveal="up"
            >
              {tr(ui.belief.p1)}
            </p>

            <p
              className="mt-3 max-w-[50ch] text-sm leading-relaxed text-white/85 max-lg:[@media(max-height:760px)]:hidden lg:text-base lg:text-white/65 rtl:leading-loose"
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
