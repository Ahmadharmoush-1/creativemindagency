import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useLang } from '../lib/i18n'
import { useSeo } from '../lib/seo'
import { projectBySlug, projects } from '../content/projects'
import { serviceById } from '../content/services'
import { ui } from '../content/ui'
import { Arrow, Cta, Eyebrow, Lines, dot } from '../components/Brand'
import { PageHero } from '../components/PageHero'
import { ProjectCard, ProjectMedia } from '../sections/Work'
import { NotFound } from './StaticPages'

export function WorkPage() {
  const { tr, lang } = useLang()
  useSeo(`${tr(ui.work.eyebrow)} — Creative Mind`, `${ui.work.title[lang].join(' ')} ${tr(ui.work.intro)}`)
  const [filter, setFilter] = useState<string | null>(null)
  const cats = useMemo(() => Array.from(new Map(projects.map((p) => [p.category.en, p.category])).values()), [])
  const list = filter ? projects.filter((p) => p.category.en === filter) : projects

  return (
    <>
      <PageHero eyebrow={tr(ui.work.eyebrow)} title={ui.work.title[lang]} lead={tr(ui.work.intro)} symbol="A" />
      <section className="pb-[clamp(5rem,12vw,11rem)]">
        <div className="wrap">
          <div className="mb-12 flex flex-wrap gap-2.5" role="group" aria-label={tr(ui.work.eyebrow)}>
            <button type="button" className="chip" aria-pressed={filter === null} onClick={() => setFilter(null)}>
              {tr(ui.work.allFilter)}
            </button>
            {cats.map((c) => (
              <button key={c.en} type="button" className="chip" aria-pressed={filter === c.en} onClick={() => setFilter(c.en)}>
                {tr(c)}
              </button>
            ))}
          </div>
          {/* Staggered editorial grid: the second column sits lower than the first. */}
          <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:gap-x-14 lg:gap-y-20">
            {list.map((p, i) => (
              <div key={`${filter}-${p.slug}`} className={`page-enter ${i % 2 === 1 ? 'md:translate-y-24' : ''}`} style={{ animationDelay: `${i * 0.08}s` }}>
                <ProjectCard project={p} index={projects.indexOf(p)} />
              </div>
            ))}
          </div>
          <div className="h-24" />
        </div>
      </section>
    </>
  )
}

export function CaseStudy() {
  const { slug } = useParams()
  const { tr } = useLang()
  const p = projectBySlug(slug)
  useSeo(p ? `${tr(p.name)} — ${tr(p.category)} — Creative Mind` : 'Creative Mind', p ? tr(p.challenge) : undefined)
  if (!p) return <NotFound />
  const next = projects[(projects.indexOf(p) + 1) % projects.length]
  const blocks = [
    { k: ui.work.challenge, v: p.challenge },
    { k: ui.work.approach, v: p.approach },
    { k: ui.work.outcome, v: p.outcome },
  ]

  return (
    <article>
      <header className="wrap pt-[clamp(9rem,20vh,14rem)]">
        <div className="mb-7 flex flex-wrap items-center gap-4">
          <Eyebrow className="text-signal">{tr(p.category)}</Eyebrow>
          {p.placeholder && (
            <span className="eyebrow rounded-full border border-white/25 px-3 py-1.5 !text-[0.6rem] text-white/70 rtl:!text-[0.7rem]">{tr(ui.work.concept)}</span>
          )}
        </div>
        <Lines as="h1" className="t-display" lines={[tr(p.name)]} />
        <dl className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2" data-reveal="up">
          <div>
            <dt className="eyebrow mb-2 text-white/45">{tr(ui.work.industry)}</dt>
            <dd className="text-lg">{tr(p.industry)}</dd>
          </div>
          <div>
            <dt className="eyebrow mb-3 text-white/45">{tr(ui.work.disciplines)}</dt>
            <dd className="flex flex-wrap gap-2">
              {p.disciplines.map((d) => (
                <Link key={d} to={`/services#${d}`} className="rounded-full border border-white/25 px-4 py-2 text-sm transition-colors duration-300 hover:border-signal hover:bg-signal">
                  {tr(serviceById(d).title)}
                </Link>
              ))}
            </dd>
          </div>
        </dl>
      </header>

      <div className="wrap mt-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] md:aspect-[16/8]" data-reveal="clip">
          <ProjectMedia project={p} className="h-full w-full" />
        </div>
      </div>

      <div className="wrap section !pt-20">
        <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
          {blocks.map((b, i) => (
            <section key={b.k.en} data-reveal="up" data-delay={i * 0.08}>
              <h2 className="eyebrow mb-5 flex items-center gap-3 text-white/55">
                <span className="latin text-signal">0{i + 1}</span>
                {tr(b.k)}
              </h2>
              <p className="t-lead">{tr(b.v)}</p>
            </section>
          ))}
        </div>
      </div>

      <Link to={`/work/${next.slug}`} className="group block border-t border-white/12 bg-navy-deep">
        <div className="wrap flex items-center justify-between gap-8 py-16 md:py-24">
          <div>
            <p className="eyebrow mb-4 text-white/55">{tr(ui.work.next)}</p>
            <p className="t-display transition-colors duration-500 group-hover:text-signal">{dot(tr(next.name) + '.')}</p>
          </div>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/30 transition-all duration-500 ease-cine group-hover:scale-110 group-hover:border-signal group-hover:bg-signal md:h-24 md:w-24" aria-hidden="true">
            <Arrow className="!h-5 !w-5 rtl:-scale-x-100" />
          </span>
        </div>
      </Link>
      <div className="wrap py-10">
        <Cta to="/work" variant="ghost">
          {tr(ui.work.all)}
        </Cta>
      </div>
    </article>
  )
}
