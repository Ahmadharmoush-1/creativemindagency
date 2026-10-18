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

    // Re-measure scroll scenes after the panel finishes resizing.
    window.setTimeout(() => ScrollTrigger.refresh(), 750)
  }

  return (
    <article
      className={`group border-t transition-colors duration-500 hover:border-signal ${
        open ? 'border-signal' : 'border-navy/15'
      }`}
    >
      <div className="relative grid items-center gap-x-8 gap-y-4 py-7 md:grid-cols-[9rem_1fr_auto] md:py-10">
        {/* Category — larger and bold */}
        <p className="eyebrow flex items-center gap-3 !text-[0.85rem] !font-bold text-navy/85 lg:!text-[0.95rem]">
          <span
            className="block h-1.5 w-1.5 shrink-0 rounded-full bg-signal transition-transform duration-500 ease-cine group-hover:translate-x-2 group-hover:scale-[1.8] rtl:group-hover:-translate-x-2"
            aria-hidden="true"
          />

          {tr(categoryLabel(item.category))}
        </p>

        <div className="min-w-0 transition-transform duration-700 ease-cine group-hover:translate-x-3 rtl:group-hover:-translate-x-3">
          {/* Article title — slightly smaller and bold */}
          <h3 className="text-[clamp(1.4rem,2.7vw,2.6rem)] font-bold leading-[1.15] tracking-tight rtl:leading-[1.45] rtl:tracking-normal">
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

          {/* Excerpt — larger and bolder */}
          <p className="mt-3 max-w-[56ch] text-[1.0625rem] font-semibold leading-relaxed text-navy/90 lg:text-[1.125rem]">
            {tr(item.excerpt)}
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div
            className="hidden h-24 w-36 overflow-hidden rounded-xl transition-[clip-path] duration-700 ease-cine [clip-path:inset(0_0_100%_0)] group-hover:[clip-path:inset(0_0_0_0)] lg:block"
            aria-hidden="true"
          >
            <ProjectArt
              kind={item.art}
              className="h-full w-full scale-125 transition-transform duration-[1.2s] ease-cine group-hover:scale-100"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Reading time — larger and bold */}
            <p className="whitespace-nowrap text-sm font-bold text-navy/85 lg:text-base">
              <span className={lang === 'en' ? 'latin' : ''}>
                {item.minutes} {tr(ui.insights.min)}
              </span>
            </p>

            {/* Separate clickable arrow: down when closed, up when open */}
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={panel}
              aria-label={tr({
                en: `${open ? 'Collapse' : 'Expand'}: ${item.title.en}`,
                ar: `${open ? 'طي المقال' : 'عرض المقال'}: ${item.title.ar}`,
              })}
              className={`relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 transition-[background-color,border-color,color] duration-300 hover:border-signal hover:bg-signal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:h-14 sm:w-14 ${
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
                className={`h-6 w-6 transition-transform duration-300 motion-reduce:transition-none sm:h-7 sm:w-7 ${
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
        <div className="overflow-hidden">
          <div className="grid gap-x-8 pb-10 md:grid-cols-[9rem_1fr]">
            <span aria-hidden="true" />

            <div className="max-w-[64ch]">
              {item.body.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-5 text-[1.125rem] font-semibold leading-[1.8] text-navy/90 last:mb-0 lg:text-[1.1875rem]"
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
      className="section on-white scroll-mt-20"
    >
      <div className="wrap">
        <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            {/* Section label */}
            <Eyebrow className="mb-7 !text-[0.95rem] !font-bold lg:!text-[1rem]">
              {tr(ui.insights.eyebrow)}
            </Eyebrow>

            {/* Smaller bold heading */}
            <Lines
              className="t-display !text-[clamp(1.75rem,5.5vw,2.75rem)] !font-bold lg:!text-[clamp(2rem,3.9vw,4rem)]"
              lines={[
                <span key="title" className="!font-bold">
                  {ui.insights.title[lang][0]}
                  <span className="text-signal">.</span>
                </span>,
              ]}
            />
          </div>

          {/* Larger, bolder introduction */}
          <p
            className="t-lead max-w-[32ch] !text-[1.125rem] !font-semibold !leading-[1.65] text-navy/90 sm:!text-[1.25rem] lg:!text-[1.375rem]"
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