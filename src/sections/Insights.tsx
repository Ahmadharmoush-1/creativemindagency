import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { ScrollTrigger } from '../lib/gsap'
import { categoryLabel, insights, type Insight } from '../content/insights'
import { ui } from '../content/ui'
import { Arrow, Eyebrow, Lines } from '../components/Brand'
import { ProjectArt } from '../visuals/ProjectArt'

/** One article. The site is a single page, so the text opens in place under its headline. */
export function InsightRow({ item }: { item: Insight }) {
  const { tr, lang } = useLang()
  const [open, setOpen] = useState(false)
  const panel = `insight-${item.slug}`

  const toggle = () => {
    setOpen((value) => !value)
    // The page gets taller or shorter; re-measure the scroll scenes below once it settles.
    window.setTimeout(() => ScrollTrigger.refresh(), 750)
  }

  return (
    <article className={`group border-t transition-colors duration-500 hover:border-signal ${open ? 'border-signal' : 'border-navy/15'}`}>
      <div className="relative grid items-center gap-x-8 gap-y-3 py-7 md:grid-cols-[9rem_1fr_auto] md:py-10">
        <p className="eyebrow flex items-center gap-3 text-navy/60">
          <span className="block h-1.5 w-1.5 rounded-full bg-signal transition-transform duration-500 ease-cine group-hover:translate-x-2 group-hover:scale-[1.8] rtl:group-hover:-translate-x-2" aria-hidden="true" />
          {tr(categoryLabel(item.category))}
        </p>
        <div className="transition-transform duration-700 ease-cine group-hover:translate-x-3 rtl:group-hover:-translate-x-3">
          <h3 className="text-[clamp(1.5rem,3.1vw,3rem)] leading-[1.05] font-semibold tracking-tight rtl:leading-[1.45] rtl:tracking-normal">
            <button type="button" onClick={toggle} aria-expanded={open} aria-controls={panel} className="text-start after:absolute after:inset-0 after:content-['']">
              {tr(item.title)}
            </button>
          </h3>
          <p className="muted mt-3 max-w-[56ch] text-[0.95rem] leading-snug rtl:leading-relaxed">{tr(item.excerpt)}</p>
        </div>
        <div className="flex items-center gap-6">
          <div
            className="hidden h-24 w-36 overflow-hidden rounded-xl transition-[clip-path] duration-700 ease-cine [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)] lg:block"
            aria-hidden="true"
          >
            <ProjectArt kind={item.art} className="h-full w-full scale-125 transition-transform duration-[1.2s] ease-cine group-hover:scale-100" />
          </div>
          <p className="flex items-center gap-3 text-xs whitespace-nowrap text-navy/60">
            <span className={lang === 'en' ? 'latin' : ''}>
              {item.minutes} {tr(ui.insights.min)}
            </span>
            <span
              className={`grid h-10 w-10 place-items-center rounded-full border transition-[background-color,border-color,color,transform] duration-500 ease-cine group-hover:border-signal group-hover:bg-signal group-hover:text-white ${
                open ? 'rotate-[135deg] border-signal bg-signal text-white' : 'border-navy/25 text-navy'
              }`}
              aria-hidden="true"
            >
              <Arrow className="rtl:-scale-x-100" />
            </span>
          </p>
        </div>
      </div>

      <div
        id={panel}
        className="grid transition-[grid-template-rows] duration-700 ease-cine"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
        {...({ inert: open ? undefined : '' } as object)}
      >
        <div className="overflow-hidden">
          <div className="grid gap-x-8 pb-10 md:grid-cols-[9rem_1fr]">
            <span aria-hidden="true" />
            <div className="max-w-[64ch]">
              {item.body.map((paragraph, index) => (
                <p key={index} className="mb-4 text-[1.02rem] leading-relaxed text-navy/80 last:mb-0 rtl:leading-loose">
                  {tr(paragraph)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Editorial list of the latest thinking. */
export function Insights() {
  const { tr, lang } = useLang()
  return (
    <section id="insights" className="section on-white scroll-mt-20">
      <div className="wrap">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow className="mb-7">{tr(ui.insights.eyebrow)}</Eyebrow>
            <Lines className="t-display" lines={[<>{ui.insights.title[lang][0]}<span className="text-signal">.</span></>]} />
          </div>
          <p className="t-lead muted max-w-[32ch]" data-reveal="up">
            {tr(ui.insights.intro)}
          </p>
        </div>
        <div className="border-b border-navy/15">
          {insights.slice(0, 4).map((it) => (
            <div key={it.slug} data-reveal="up">
              <InsightRow item={it} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
