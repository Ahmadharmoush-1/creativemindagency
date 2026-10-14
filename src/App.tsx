import { useEffect, useRef, useState, type RefObject } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger, gsap, prefersReduced, setLenis, useGsap } from './lib/gsap'
import { useLang } from './lib/i18n'
import { ReadyCtx } from './lib/ready'
import { scrollToHash } from './lib/scroll'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Loader } from './components/Loader'
import { JourneyRail } from './components/JourneyRail'
import Home from './pages/Home'

/** Scroll-triggered reveals for every [data-reveal] element on the current page. */
function useReveals(scope: RefObject<HTMLElement | null>, deps: unknown[], enabled: boolean) {
  useGsap(
    scope,
    () => {
      if (!enabled || prefersReduced()) return
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        const delay = Number(el.dataset.delay ?? 0)
        const scrollTrigger = { trigger: el, start: 'top 90%', once: true }
        switch (el.dataset.reveal) {
          case 'lines':
            gsap.to(el.querySelectorAll('.line-inner'), { y: 0, duration: 1.25, ease: 'expo.out', stagger: 0.1, delay, scrollTrigger })
            break
          case 'blur':
            gsap.to(el, { opacity: 1, filter: 'blur(0px)', scale: 1, duration: 1.3, ease: 'power3.out', delay, scrollTrigger })
            break
          case 'clip':
            gsap.to(el, { clipPath: 'inset(0 0 0% 0)', duration: 1.4, ease: 'expo.inOut', delay, scrollTrigger })
            break
          case 'rule':
            gsap.to(el, { scaleX: 1, duration: 1.2, ease: 'expo.out', delay, scrollTrigger })
            break
          default:
            gsap.to(el, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', delay, scrollTrigger })
        }
      })
    },
    deps,
  )
}

/** Single-page site: header, the landing page, footer. Navigation scrolls to sections. */
export default function App() {
  const { switching } = useLang()
  const [ready, setReady] = useState(false)
  const main = useRef<HTMLElement>(null)

  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    if (prefersReduced()) return
    // Touch screens keep their native scrolling. Scripted smoothing fights the browser's own
    // scroll thread there, which makes pinned (sticky) scenes shake.
    if (window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({ duration: 1.1 })
    setLenis(lenis)
    if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      setLenis(null)
    }
  }, [])

  // Re-measure once fonts and images have settled.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 350)
    document.fonts?.ready.then(() => ScrollTrigger.refresh())
    const on = () => ScrollTrigger.refresh()
    window.addEventListener('load', on)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('load', on)
    }
  }, [])

  // A link such as /#contact opens the page at that section once the intro has played.
  useEffect(() => {
    if (!ready || !window.location.hash) return
    const id = window.setTimeout(() => scrollToHash(window.location.hash), 400)
    return () => window.clearTimeout(id)
  }, [ready])

  useReveals(main, [ready], ready)

  return (
    <ReadyCtx.Provider value={ready}>
      <Loader onDone={() => setReady(true)} />
      <Header />
      <main ref={main} id="main" tabIndex={-1} className={`page-enter lang-fade outline-none ${switching ? 'is-switching' : ''}`}>
        <Home />
      </main>
      <div className={`lang-fade ${switching ? 'is-switching' : ''}`}>
        <Footer />
      </div>
      <JourneyRail />
    </ReadyCtx.Provider>
  )
}
