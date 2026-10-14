import { useLang } from '../lib/i18n'
import { useSeo } from '../lib/seo'
import { ui } from '../content/ui'
import { Hero } from '../sections/Hero'
import { Belief } from '../sections/Belief'
import { Symbols } from '../sections/Symbols'
import { Services } from '../sections/Services'
import { Work } from '../sections/Work'
import { Process } from '../sections/Process'
import { About } from '../sections/About'
import { Insights } from '../sections/Insights'
import { Contact } from '../sections/Contact'

/**
 * The whole site: one landing page.
 *
 * The header links scroll to these ids (see `nav` in src/content/site.ts):
 *   #belief, #symbols, #services, #selected-work, #about, #contact
 * Symbols, Work and Contact set their own id; the others get one from a wrapper here.
 */
export default function Home() {
  const { tr, lang } = useLang()
  useSeo(lang === 'ar' ? 'كرييتف مايند — نجعل الفكر مرئيًّا' : 'Creative Mind — Mind Made Visible', tr(ui.hero.sub))
  return (
    <>
      <div id="top">
        <Hero />
      </div>
      <div id="belief">
        <Belief />
      </div>
      <Symbols />
      <div id="services">
        <Services />
      </div>
      <Work />
      <Process />
      <div id="about">
        <About />
      </div>
      <Insights />
      <Contact />
    </>
  )
}
