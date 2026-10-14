import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { useSeo } from '../lib/seo'
import { categoryLabel, insightBySlug, insightCategories, insights } from '../content/insights'
import { ui } from '../content/ui'
import { Arrow, Lines } from '../components/Brand'
import { PageHero } from '../components/PageHero'
import { InsightRow } from '../sections/Insights'
import { ProjectArt } from '../visuals/ProjectArt'
import { NotFound } from './StaticPages'

export function InsightsPage() {
  const { tr, lang } = useLang()
  useSeo(`${ui.insights.title[lang][0]} — Creative Mind`, tr(ui.insights.intro))
  const [cat, setCat] = useState<string | null>(null)
  const list = cat ? insights.filter((i) => i.category === cat) : insights
  return (
    <>
      <PageHero eyebrow={tr(ui.insights.eyebrow)} title={[ui.insights.title[lang][0] + '.']} lead={tr(ui.insights.intro)} symbol="V" />
      <section className="on-white pt-12 pb-[clamp(5rem,12vw,11rem)]">
        <div className="wrap">
          <div className="mb-10 flex flex-wrap gap-2.5" role="group" aria-label={tr(ui.insights.eyebrow)}>
            <button type="button" className="chip" aria-pressed={cat === null} onClick={() => setCat(null)}>
              {tr(ui.work.allFilter)}
            </button>
            {insightCategories.map((c) => (
              <button key={c.id} type="button" className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
                {tr(c.label)}
              </button>
            ))}
          </div>
          <div className="border-b border-navy/15" aria-live="polite">
            {list.map((it, i) => (
              <div key={`${cat}-${it.slug}`} className="page-enter" style={{ animationDelay: `${i * 0.06}s` }}>
                <InsightRow item={it} />
              </div>
            ))}
            {list.length === 0 && <p className="muted border-t border-navy/15 py-12">{tr(ui.insights.empty)}</p>}
          </div>
        </div>
      </section>
    </>
  )
}

export function Article() {
  const { slug } = useParams()
  const { tr, lang } = useLang()
  const a = insightBySlug(slug)
  useSeo(a ? `${tr(a.title)} — Creative Mind` : 'Creative Mind', a ? tr(a.excerpt) : undefined)
  if (!a) return <NotFound />
  const next = insights[(insights.indexOf(a) + 1) % insights.length]
  return (
    <article>
      <header className="wrap pt-[clamp(9rem,20vh,14rem)] pb-14">
        <Link to="/insights" className="link-signal eyebrow mb-10 text-white/70 hover:text-white">
          {tr(ui.insights.back)}
        </Link>
        <p className="eyebrow mt-8 mb-6 text-signal">
          {tr(categoryLabel(a.category))} · <span className={lang === 'en' ? 'latin' : ''}>{a.minutes} {tr(ui.insights.min)}</span>
        </p>
        <Lines as="h1" className="t-display max-w-[18ch] !text-[clamp(2.2rem,5.6vw,5.6rem)] !normal-case" lines={[tr(a.title)]} />
      </header>
      <div className="on-white">
        <div className="wrap grid gap-12 py-[clamp(4rem,9vw,8rem)] lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] lg:sticky lg:top-28 lg:self-start" data-reveal="clip">
            <ProjectArt kind={a.art} className="h-full w-full" />
          </div>
          <div className="max-w-[62ch]">
            <p className="t-title !text-[clamp(1.4rem,2.2vw,2rem)] !leading-snug rtl:!leading-relaxed" data-reveal="up">
              {tr(a.excerpt)}
            </p>
            {a.body.map((p, i) => (
              <p key={i} className="mt-7 text-lg leading-relaxed text-navy/80 rtl:leading-loose" data-reveal="up">
                {tr(p)}
              </p>
            ))}
          </div>
        </div>
      </div>
      <Link to={`/insights/${next.slug}`} className="group block bg-navy-deep">
        <div className="wrap flex items-center justify-between gap-8 py-16 md:py-20">
          <div>
            <p className="eyebrow mb-4 text-white/55">{tr(ui.insights.read)}</p>
            <p className="t-title max-w-[24ch] transition-colors duration-500 group-hover:text-signal">{tr(next.title)}</p>
          </div>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/30 transition-all duration-500 ease-cine group-hover:border-signal group-hover:bg-signal" aria-hidden="true">
            <Arrow className="!h-5 !w-5 rtl:-scale-x-100" />
          </span>
        </div>
      </Link>
    </article>
  )
}
