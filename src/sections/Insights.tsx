import { useState } from 'react'
import { useLang } from '../lib/i18n'
import { ScrollTrigger } from '../lib/gsap'
import {
  categoryLabel,
  insights,
  type Insight,
} from '../content/insights'
import { ui } from '../content/ui'
import { Eyebrow, Lines } from '../components/Brand'
import { ProjectArt } from '../visuals/ProjectArt'

/** Article that expands beneath its headline. */
export function InsightRow({ item }: { item: Insight }) {
  const { tr, lang } = useLang()
  const [open, setOpen] = useState(false)
  const panel = `insight-${item.slug}`

  const toggle = () => {
    setOpen((value) => !value)
    window.setTimeout(() => ScrollTrigger.refresh(), 750)
  }

  return (
    <article
      className={`group border-t transition-colors duration-500 hover:border-signal ${
        open ? 'border-signal' : 'border-navy/15'
      }`}
    >
      <div className="relative grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 py-5 md:grid-cols-[9rem_1fr_auto] md:gap-x-8 md:gap-y-4 md:py-10">
        {/* Category */}
        <p className="eyebrow col-start-1 row-start-1 flex items-center gap-2 !text-[0.6875rem] !font-bold !tracking-[0.1em] text-navy/85 md:col-auto md:row-auto md:gap-3 md:!text-[0.85rem] lg:!text-[0.95rem] rtl:!tracking-normal">
          <span
            className="block h-1 w-1 shrink-0 rounded-full bg-signal transition-transform duration-500 ease-cine md:h-1.5 md:w-1.5 md:group-hover:translate-x-2 md:group-hover:scale-[1.8] rtl:md:group-hover:-translate-x-2"
            aria-hidden="true"
          />

          {tr(categoryLabel(item.category))}
        </p>

        {/* Title and excerpt */}
        <div className="col-span-2 col-start-1 row-start-2 min-w-0 transition-transform duration-700 ease-cine md:col-span-1 md:col-auto md:row-auto md:group-hover:translate-x-3 rtl:md:group-hover:-translate-x-3">
          <h3 className="text-[1.125rem] font-bold leading-[1.3] tracking-tight md:text-[clamp(1.4rem,2.7vw,2.6rem)] md:leading-[1.15] rtl:leading-[1.5] rtl:tracking-normal md:rtl:leading-[1.45]">
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={panel}
              className="text-start font-inherit after:absolute after:inset-0 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
            >
              {tr(item.title)}
            </button>
          </h3>

          <p className="mt-2 max-w-[56ch] text-[0.8125rem] font-medium leading-[1.6] text-navy/90 md:mt-3 md:text-[1.0625rem] md:font-semibold md:leading-relaxed lg:text-[1.125rem]">
            {tr(item.excerpt)}
          </p>
        </div>

        {/* Reading time and arrow */}
        <div className="col-start-2 row-start-1 flex items-center gap-2 md:col-auto md:row-auto md:gap-6">
          <div
            className="hidden h-24 w-36 overflow-hidden rounded-xl transition-[clip-path] duration-700 ease-cine [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)] lg:block"
            aria-hidden="true"
          >
            <ProjectArt
              kind={item.art}
              className="h-full w-full scale-125 transition-transform duration-[1.2s] ease-cine group-hover:scale-100"
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <p className="whitespace-nowrap text-[0.6875rem] font-semibold text-navy/85 md:text-sm md:font-bold lg:text-base">
              <span className={lang === 'en' ? 'latin' : ''}>
                {item.minutes} {tr(ui.insights.min)}
              </span>
            </p>

            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={panel}
              aria-label={tr({
                en: `${open ? 'Collapse' : 'Expand'}: ${item.title.en}`,
                ar: `${open ? 'طي المقال' : 'عرض المقال'}: ${item.title.ar}`,
              })}
              className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-[background-color,border-color,color] duration-300 hover:border-signal hover:bg-signal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal md:h-14 md:w-14 md:border-2 ${
                open
                  ? 'border-signal bg-signal text-white'
                  : 'border-navy/30 text-navy'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none md:h-7 md:w-7 ${
                  open ? 'rotate-180' : 'rotate-0'
                }`}
                aria-hidden="true"
              >
                <path d="M12 4v16" />
                <path d="m5 13 7 7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable article */}
      <div
        id={panel}
        className="grid transition-[grid-template-rows] duration-700 ease-cine"
        style={{
          gridTemplateRows: open ? '1fr' : '0fr',
        }}
        {...({ inert: open ? undefined : '' } as object)}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="grid gap-x-8 pb-6 md:grid-cols-[9rem_1fr] md:pb-10">
            <span className="hidden md:block" aria-hidden="true" />

            <div className="max-w-[64ch]">
              {item.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-3 text-[0.875rem] font-medium leading-[1.75] text-navy/90 last:mb-0 md:mb-5 md:text-[1.125rem] md:font-semibold md:leading-[1.8] lg:text-[1.1875rem]"
                >
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
    <section
      id="insights"
      className="section on-white scroll-mt-20 !py-10 md:!py-20"
    >
      <div className="wrap">
        <div className="mb-6 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-8">
          <div>
            <Eyebrow className="mb-3 !text-[0.75rem] !font-bold md:mb-7 md:!text-[0.95rem] lg:!text-[1rem]">
              {tr(ui.insights.eyebrow)}
            </Eyebrow>

            <Lines
              className="t-display !text-[1.75rem] !font-bold !leading-[1.15] md:!text-[clamp(1.75rem,5.5vw,2.75rem)] lg:!text-[clamp(2rem,3.9vw,4rem)] rtl:!leading-[1.45]"
              lines={[
                <span key="title" className="!font-bold">
                  {ui.insights.title[lang][0]}
                  <span className="text-signal">.</span>
                </span>,
              ]}
            />
          </div>

          <p
            className="t-lead max-w-[38ch] !text-[0.875rem] !font-medium !leading-[1.6] text-navy/90 md:max-w-[32ch] md:!text-[1.25rem] md:!font-semibold md:!leading-[1.65] lg:!text-[1.375rem]"
            data-reveal="up"
          >
            {tr(ui.insights.intro)}
          </p>
        </div>

        <div className="border-b border-navy/15">
          {insights.slice(0, 4).map((item) => (
            <div key={item.slug} data-reveal="up">
              <InsightRow item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}