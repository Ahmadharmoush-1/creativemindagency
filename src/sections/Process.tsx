import { useMemo, useRef } from 'react'
import { useLang } from '../lib/i18n'
import {
  ScrollTrigger,
  liveProgress,
  prefersReduced,
  useGsap,
  useMedia,
} from '../lib/gsap'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'

const VB = { w: 1200, h: 420 }

const pts = Array.from({ length: 6 }, (_, i) => ({
  x: 70 + i * 204,
  y: 340 - i * 52,
}))

function journeyPath(mirror: boolean) {
  const mx = (x: number) => (mirror ? VB.w - x : x)

  let d = `M${mx(-20)} 352 L${mx(pts[0].x)} ${pts[0].y}`

  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]

    d += ` C${mx(a.x + 110)} ${a.y} ${mx(b.x - 110)} ${b.y} ${mx(b.x)} ${b.y}`
  }

  const last = pts[pts.length - 1]

  return (
    d +
    ` C${mx(last.x + 70)} ${last.y} ${mx(last.x + 90)} ${last.y - 30} ${mx(VB.w + 20)} ${last.y - 60}`
  )
}

/** One signal travels a rising path through six stages. */
export function Process() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)
  const desktop = useMedia('(min-width: 1024px)')
  const d = useMemo(() => journeyPath(rtl), [rtl])
  // Read live by the scroll scene, so a language switch updates it without a rebuild.
  const rtlRef = useRef(rtl)
  rtlRef.current = rtl
  const stages = ui.process.stages

  useGsap(
    root,
    () => {
      const el = root.current
      if (!el) return

      const items = Array.from(
        el.querySelectorAll<HTMLElement>('.pr-stage'),
      )

      const ball = el.querySelector<HTMLElement>('.pr-ball')
      if (!ball) return

      const set = (p: number) => {
        const rtl = rtlRef.current
        if (desktop) {
          const path =
            el.querySelector<SVGPathElement>('.pr-path')
          const clip =
            el.querySelector<SVGRectElement>('.pr-clip')

          if (!path || !clip) return

          const length = path.getTotalLength()
          const point = path.getPointAtLength(p * length)

          clip.setAttribute(
            'x',
            String(rtl ? point.x : -40),
          )

          clip.setAttribute(
            'width',
            String(
              rtl
                ? VB.w + 40 - point.x
                : point.x + 40,
            ),
          )

          ball.style.left = `${(point.x / VB.w) * 100}%`
          ball.style.top = `${(point.y / VB.h) * 100}%`

          const travelled = rtl
            ? VB.w - point.x
            : point.x

          items.forEach((item, i) => {
            item.classList.toggle(
              'is-on',
              travelled >= pts[i].x - 4,
            )
          })
        } else {
          const fill =
            el.querySelector<HTMLElement>('.pr-fill')

          if (fill) {
            fill.style.transform = `scaleY(${p})`
          }

          ball.style.top = `${p * 100}%`

          items.forEach((item, i) => {
            item.classList.toggle(
              'is-on',
              p >= (i + 0.35) / items.length,
            )
          })
        }
      }

      if (prefersReduced()) {
        set(1)
        return
      }

      set(0)

      const trigger = ScrollTrigger.create({
        trigger: el.querySelector('.pr-stagebox'),
        start: desktop ? 'top 78%' : 'top 70%',
        end: desktop ? 'bottom 55%' : 'bottom 60%',
        scrub: 0.8,
        onUpdate: (self) => set(self.progress),
        // After a language switch's refresh: redraw along the mirrored path at once.
        onRefresh: (self) => set(self.progress),
      })
      // Rebuilt mid-page (a language switch): start where the scroll already is, not at zero.
      set(liveProgress(trigger))

      return () => trigger.kill()
    },
    [desktop],
  )

  const stageCls =
    'pr-stage transition-[opacity,transform] duration-700 ease-cine opacity-60 [&.is-on]:opacity-100 [&_.pr-num]:transition-colors [&.is-on_.pr-num]:text-signal'

  return (
    <section
      ref={root}
      className="section on-white overflow-hidden"
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <div className="wrap">
        {/* Section label — larger and bold */}
        <Eyebrow className="mb-7 !text-[0.95rem] !font-bold lg:!text-[1rem]">
          {tr(ui.process.eyebrow)}
        </Eyebrow>

        <h2 className="sr-only">
          {ui.process.title[lang].join(' ')}
        </h2>

        {/* Smaller heading with both lines bold */}
        <Lines
          as="p"
          className="t-display !text-[clamp(1.75rem,5.5vw,2.75rem)] !font-bold lg:!text-[clamp(2rem,3.9vw,4rem)]"
          lines={[
            <span key="first" className="!font-bold">
              {ui.process.title[lang][0]}
            </span>,
            <span key="second" className="!font-bold">
              {dot(ui.process.title[lang][1])}
            </span>,
          ]}
        />

        {desktop ? (
          <div className="pr-stagebox relative mt-10 mb-52 h-[420px]">
            <svg
              viewBox={`0 0 ${VB.w} ${VB.h}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                d={d}
                fill="none"
                stroke="#051746"
                strokeOpacity=".16"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
              />

              <clipPath id="pr-clip">
                <rect
                  className="pr-clip"
                  x="0"
                  y="-100"
                  width="0"
                  height={VB.h + 200}
                />
              </clipPath>

              <path
                d={d}
                clipPath="url(#pr-clip)"
                fill="none"
                stroke="#F6620D"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />

              <path
                className="pr-path"
                d={d}
                fill="none"
                stroke="none"
              />
            </svg>

            <span
              className="pr-ball sphere absolute z-10 block h-5 w-5 -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            />

            <ol>
              {stages.map((stage, i) => (
                <li
                  key={stage.t.en}
                  className={`${stageCls} absolute w-[15%] min-w-[150px] translate-y-2 [&.is-on]:translate-y-0`}
                  style={{
                    insetInlineStart: `${
                      (pts[i].x / VB.w) * 100
                    }%`,
                    top: `${(pts[i].y / VB.h) * 100}%`,
                  }}
                >
                  <span
                    className="absolute start-0 top-0 block h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-white ltr:-translate-x-1/2 rtl:translate-x-1/2"
                    aria-hidden="true"
                  />

                  {/* Stage number */}
                  <p className="pr-num latin mt-7 text-base font-bold tabular-nums">
                    0{i + 1}
                  </p>

                  {/* Stage title */}
                  <h3 className="mt-1 text-[clamp(1.2rem,1.6vw,1.6rem)] font-bold uppercase leading-snug tracking-tight rtl:tracking-normal">
                    {tr(stage.t)}
                  </h3>

                  {/* Stage description */}
                  <p className="mt-3 text-base font-semibold leading-relaxed text-navy/90 xl:text-[1.0625rem]">
                    {tr(stage.d)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="pr-stagebox relative mt-12 ps-10">
            <span
              className="absolute start-[7px] top-0 bottom-0 w-px bg-navy/15"
              aria-hidden="true"
            >
              <span
                className="pr-fill absolute inset-0 block origin-top bg-signal"
                style={{ transform: 'scaleY(0)' }}
              />

              <span className="pr-ball sphere absolute left-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
            </span>

            <ol className="space-y-12">
              {stages.map((stage, i) => (
                <li
                  key={stage.t.en}
                  className={stageCls}
                >
                  {/* Stage number */}
                  <p className="pr-num latin text-base font-bold tabular-nums">
                    0{i + 1}
                  </p>

                  {/* Stage title */}
                  <h3 className="mt-2 text-2xl font-bold uppercase leading-snug tracking-tight sm:text-[1.75rem] rtl:tracking-normal">
                    {tr(stage.t)}
                  </h3>

                  {/* Stage description */}
                  <p className="mt-3 max-w-[32ch] text-[1.125rem] font-semibold leading-relaxed text-navy/90 sm:text-xl">
                    {tr(stage.d)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}