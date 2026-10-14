import { useMemo, useRef } from 'react'
import { useLang } from '../lib/i18n'
import { ScrollTrigger, prefersReduced, useGsap, useMedia } from '../lib/gsap'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'

const VB = { w: 1200, h: 420 }
const pts = Array.from({ length: 6 }, (_, i) => ({ x: 70 + i * 204, y: 340 - i * 52 }))

function journeyPath(mirror: boolean) {
  const mx = (x: number) => (mirror ? VB.w - x : x)
  let d = `M${mx(-20)} 352 L${mx(pts[0].x)} ${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    d += ` C${mx(a.x + 110)} ${a.y} ${mx(b.x - 110)} ${b.y} ${mx(b.x)} ${b.y}`
  }
  const l = pts[pts.length - 1]
  return d + ` C${mx(l.x + 70)} ${l.y} ${mx(l.x + 90)} ${l.y - 30} ${mx(VB.w + 20)} ${l.y - 60}`
}

/** From thinking to impact: one signal travels a rising path through six stages. */
export function Process() {
  const { tr, lang, rtl } = useLang()
  const root = useRef<HTMLElement>(null)
  const desktop = useMedia('(min-width: 1024px)')
  const d = useMemo(() => journeyPath(rtl), [rtl])
  const stages = ui.process.stages

  useGsap(
    root,
    () => {
      const el = root.current!
      const items = Array.from(el.querySelectorAll<HTMLElement>('.pr-stage'))
      const ball = el.querySelector<HTMLElement>('.pr-ball')!
      const set = (p: number) => {
        if (desktop) {
          const path = el.querySelector<SVGPathElement>('.pr-path')!
          const len = path.getTotalLength()
          const pt = path.getPointAtLength(p * len)
          const clip = el.querySelector<SVGRectElement>('.pr-clip')!
          clip.setAttribute('x', String(rtl ? pt.x : -40))
          clip.setAttribute('width', String(rtl ? VB.w + 40 - pt.x : pt.x + 40))
          ball.style.left = `${(pt.x / VB.w) * 100}%`
          ball.style.top = `${(pt.y / VB.h) * 100}%`
          const travelled = rtl ? VB.w - pt.x : pt.x
          items.forEach((it, i) => it.classList.toggle('is-on', travelled >= pts[i].x - 4))
        } else {
          el.querySelector<HTMLElement>('.pr-fill')!.style.transform = `scaleY(${p})`
          ball.style.top = `${p * 100}%`
          items.forEach((it, i) => it.classList.toggle('is-on', p >= (i + 0.35) / items.length))
        }
      }
      if (prefersReduced()) {
        set(1)
        return
      }
      set(0)
      ScrollTrigger.create({
        trigger: el.querySelector('.pr-stagebox'),
        start: desktop ? 'top 78%' : 'top 70%',
        end: desktop ? 'bottom 55%' : 'bottom 60%',
        scrub: 0.8,
        onUpdate: (s) => set(s.progress),
      })
    },
    [desktop, lang],
  )

  const stageCls =
    'pr-stage transition-[opacity,transform] duration-700 ease-cine opacity-35 [&.is-on]:opacity-100 [&_.pr-num]:transition-colors [&.is-on_.pr-num]:text-signal'

  return (
    <section ref={root} className="section on-white overflow-hidden">
      <div className="wrap">
        <Eyebrow className="mb-7">{tr(ui.process.eyebrow)}</Eyebrow>
        <h2 className="sr-only">{ui.process.title[lang].join(' ')}</h2>
        <Lines as="p" className="t-display" lines={[<span className="thin">{ui.process.title[lang][0]}</span>, dot(ui.process.title[lang][1])]} />

        {desktop ? (
          <div className="pr-stagebox relative mt-10 mb-44 h-[420px]">
            <svg viewBox={`0 0 ${VB.w} ${VB.h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
              <path d={d} fill="none" stroke="#051746" strokeOpacity=".16" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              <clipPath id="pr-clip">
                <rect className="pr-clip" x="0" y="-100" width="0" height={VB.h + 200} />
              </clipPath>
              <path d={d} clipPath="url(#pr-clip)" fill="none" stroke="#F6620D" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              <path className="pr-path" d={d} fill="none" stroke="none" />
            </svg>
            <span className="pr-ball sphere absolute z-10 block h-5 w-5 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
            <ol>
              {stages.map((s, i) => (
                <li
                  key={s.t.en}
                  className={`${stageCls} absolute w-[15%] min-w-[150px] translate-y-2 [&.is-on]:translate-y-0`}
                  style={{ insetInlineStart: `${(pts[i].x / VB.w) * 100}%`, top: `${(pts[i].y / VB.h) * 100}%` }}
                >
                  <span className="absolute start-0 top-0 block h-3 w-3 -translate-y-1/2 rounded-full border-2 border-navy bg-white ltr:-translate-x-1/2 rtl:translate-x-1/2" aria-hidden="true" />
                  <p className="pr-num latin mt-7 text-xs font-medium tabular-nums">0{i + 1}</p>
                  <h3 className="mt-1 text-[clamp(1.1rem,1.5vw,1.5rem)] font-bold tracking-tight uppercase rtl:tracking-normal">{tr(s.t)}</h3>
                  <p className="muted mt-2 text-sm leading-snug rtl:leading-relaxed">{tr(s.d)}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="pr-stagebox relative mt-12 ps-10">
            <span className="absolute start-[7px] top-0 bottom-0 w-px bg-navy/15" aria-hidden="true">
              <span className="pr-fill absolute inset-0 block origin-top bg-signal" style={{ transform: 'scaleY(0)' }} />
              <span className="pr-ball sphere absolute left-1/2 block h-4 w-4 -translate-x-1/2 -translate-y-1/2" />
            </span>
            <ol className="space-y-10">
              {stages.map((s, i) => (
                <li key={s.t.en} className={stageCls}>
                  <p className="pr-num latin text-xs font-medium tabular-nums">0{i + 1}</p>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight uppercase rtl:tracking-normal">{tr(s.t)}</h3>
                  <p className="muted mt-2 max-w-[32ch] leading-snug rtl:leading-relaxed">{tr(s.d)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </section>
  )
}
