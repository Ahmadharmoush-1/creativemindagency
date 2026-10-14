import { useLang } from '../lib/i18n'
import { useSeo } from '../lib/seo'
import { ui } from '../content/ui'
import { Cta, Lines, dot } from '../components/Brand'
import { PageHero } from '../components/PageHero'
import { ServiceRows } from '../sections/Services'
import { Process } from '../sections/Process'
import { Ecosystem } from '../sections/Ecosystem'
import { CharacterPortrait, Principles } from '../sections/About'
import { Contact } from '../sections/Contact'
import { Faq } from '../sections/Faq'

export function ServicesPage() {
  const { tr, lang } = useLang()
  useSeo(`${tr(ui.services.eyebrow)} — Creative Mind`, tr(ui.services.intro))
  return (
    <>
      <PageHero eyebrow={tr(ui.services.eyebrow)} title={[ui.services.title[lang][0], ui.services.title[lang][1] + '.']} lead={tr(ui.services.intro)} symbol="V" />
      <section className="pb-[clamp(4rem,9vw,8rem)]">
        <ServiceRows full />
      </section>
      <Process />
      <Ecosystem />
    </>
  )
}

export function AboutPage() {
  const { tr, lang } = useLang()
  useSeo(`${tr(ui.about.eyebrow)} — Creative Mind`, tr(ui.about.lead))
  return (
    <>
      <PageHero eyebrow={tr(ui.about.eyebrow)} title={ui.about.pageTitle[lang]} lead={tr(ui.about.lead)} symbol="A" />

      {/* Philosophy and approach, each anchored by one of the two symbols. */}
      <section className="pb-[clamp(4rem,9vw,8rem)]">
        <div className="wrap">
          {ui.about.blocks.map((b, i) => (
            <div key={b.k.en} className="grid items-center gap-8 border-t border-white/12 py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-20 lg:py-24">
              <div className={`relative mx-auto w-full max-w-[320px] ${i % 2 ? 'lg:order-2' : ''}`} data-reveal="blur" aria-hidden="true">
                <svg viewBox="0 0 320 300" className="w-full overflow-visible">
                  {i === 0 ? (
                    <>
                      <path d="M30 280 160 20 290 280" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="14" strokeLinejoin="miter" />
                      <path d="M30 280 160 20" fill="none" stroke="#F6620D" strokeWidth="14" />
                      <circle cx="160" cy="214" r="22" fill="#F6620D" />
                    </>
                  ) : (
                    <>
                      <path d="M30 20 160 280 290 20" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="14" />
                      <path d="M30 20 160 280" fill="none" stroke="#F6620D" strokeWidth="14" />
                      <circle cx="160" cy="80" r="22" fill="#F6620D" />
                    </>
                  )}
                </svg>
              </div>
              <div>
                <p className="eyebrow mb-5 text-signal" data-reveal="up">
                  {tr(b.k)}
                </p>
                <Lines className="t-title" lines={[tr(b.h)]} />
                <p className="t-lead muted mt-6 max-w-[52ch]" data-reveal="up">
                  {tr(b.p)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section overflow-x-clip bg-navy-deep">
        <div className="wrap grid items-start gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:gap-24">
          <div>
            <Lines className="t-display !text-[clamp(2.2rem,5vw,5rem)]" lines={[dot(tr(ui.about.principlesTitle) + '.')]} />
            <div className="mt-10">
              <Principles />
            </div>
          </div>
          <CharacterPortrait className="mx-auto w-full max-w-[380px]" />
        </div>
      </section>

      <Ecosystem />
      <Process />
    </>
  )
}

export function ContactPage() {
  const { tr } = useLang()
  useSeo(`${tr(ui.contact.eyebrow)} — Creative Mind`, tr(ui.contact.intro))
  return (
    <>
      <div className="h-24 bg-navy-lift/30" />
      <Contact heading="h1" />
      <Faq />
    </>
  )
}

export function NotFound() {
  const { tr, lang } = useLang()
  useSeo('404 — Creative Mind')
  return (
    <section className="wrap flex min-h-[90svh] flex-col justify-center pt-32 pb-20">
      <p className="latin eyebrow mb-6 text-signal">404</p>
      <h1 className="t-display">
        <span className="thin">{ui.notFound.title[lang][0]}</span>
        <br />
        {dot(ui.notFound.title[lang][1])}
      </h1>
      <p className="t-lead muted mt-6">{tr(ui.notFound.p)}</p>
      <div className="mt-8">
        <Cta to="/">{tr(ui.notFound.home)}</Cta>
      </div>
    </section>
  )
}
