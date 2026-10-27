import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import Lenis from 'lenis'
import { ScrollTrigger, gsap, prefersReduced, setLenis, useGsap } from './lib/gsap'
import { useLang } from './lib/i18n'
import { ReadyCtx } from './lib/ready'
import { initHistory, jumpTo, keepScrollCacheFresh, popEntry, pushEntry, scrollToHash } from './lib/scroll'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Loader } from './components/Loader'
import { JourneyRail } from './components/JourneyRail'
import Home from './pages/Home'
import { Work, workCategories } from './sections/Work'
import { BackToTop } from './components/BackToTop'

function useReveals(scope: RefObject<HTMLElement | null>, deps: unknown[], enabled: boolean) {
  useGsap(scope, () => {
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
  }, deps)
}

type AppLocation = {
  path: string
  search: string
  hash: string
  /** Saved scroll position to return to (Back/Forward); null opens the page at its top. */
  restoreY: number | null
}

function readLocation(restoreY: number | null = null): AppLocation {
  if (typeof window === 'undefined') return { path: '/', search: '', hash: '', restoreY }
  return {
    path: window.location.pathname.replace(/\/+$/, '') || '/',
    search: window.location.search,
    hash: window.location.hash,
    restoreY,
  }
}

// Keep App mounted while switching pages, so the intro only runs once.
export default function App() {
  const { tr, rtl } = useLang()
  const [ready, setReady] = useState(false)
  const main = useRef<HTMLElement>(null)
  const [location, setLocation] = useState(readLocation)
  const { path } = location
  const smoothScroll = useRef<Lenis | null>(null)
  const isHome = path === '/'
  const match = path.match(/^\/work\/([^/]+)$/)
  const category = workCategories.find((item) => item.id === match?.[1])
  const collectionId = new URLSearchParams(location.search).get('collection') ?? undefined

  useEffect(() => {
    if (prefersReduced() || window.matchMedia('(pointer: coarse)').matches) return
    const lenis = new Lenis({ duration: 1.1 })
    smoothScroll.current = lenis
    setLenis(lenis)
    if (import.meta.env.DEV) (window as unknown as { __lenis: Lenis }).__lenis = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      smoothScroll.current = null
      setLenis(null)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const refresh = () => { if (!cancelled) ScrollTrigger.refresh() }
    const id = window.setTimeout(refresh, 350)
    document.fonts?.ready.then(refresh)
    window.addEventListener('load', refresh)
    return () => {
      cancelled = true
      window.clearTimeout(id)
      window.removeEventListener('load', refresh)
    }
  }, [])

  // Intercept ordinary internal page links without reloading the document, including the
  // Branding subcollections (/work/branding?collection=bags), so every page change goes through
  // the one scroll reset below. Modifier clicks, downloads and new-tab links retain browser behavior.
  useEffect(() => {
    initHistory()
    const stopScrollCache = keepScrollCacheFresh()
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href]') : null
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return
      const href = link.getAttribute('href')!
      const url = new URL(href, window.location.href)
      if (url.origin !== window.location.origin) return
      const current = readLocation()
      // A section link in the shared header/footer belongs to the home page.
      if (current.path !== '/' && href.startsWith('#') && href !== '#main' && !main.current?.contains(link)) {
        url.pathname = '/'
        url.search = ''
      }
      const destination = url.pathname.replace(/\/+$/, '') || '/'
      if (destination !== '/' && !/^\/work\/[^/]+$/.test(destination)) return
      // Existing same-page section scrolling continues to handle its own links.
      if (destination === current.path && url.hash) return
      event.preventDefault()
      event.stopPropagation()
      if (url.href !== window.location.href) pushEntry(url.pathname + url.search + url.hash)
      setLocation(readLocation())
    }
    const onPopState = () => setLocation(readLocation(popEntry()))
    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', onPopState)
    return () => {
      stopScrollCache()
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPopState)
    }
  }, [])

  // Runs once the new page is in the DOM and before it is painted: a new page opens at its top,
  // a Back/Forward visit returns to where that entry was left, a link with a hash then glides there.
  useLayoutEffect(() => {
    if (!ready) return
    const { restoreY, hash } = location
    smoothScroll.current?.resize()
    jumpTo(restoreY ?? 0)
    main.current?.focus({ preventScroll: true })
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh()
      // Pin spacers added by the refresh can make the page taller than at first jump.
      if (restoreY !== null) jumpTo(restoreY)
      else if (hash) scrollToHash(hash)
    })
    // Re-measure the scroll scenes when the page's height really changes (an image without a
    // reserved box, an opened article), once it has settled. Refreshing on every image load
    // re-measured everything dozens of times and snapped scrubbed scenes mid-glide.
    const el = main.current
    let measured = el?.offsetHeight ?? 0
    let timer = 0
    const onRefresh = () => {
      measured = el?.offsetHeight ?? 0
    }
    ScrollTrigger.addEventListener('refresh', onRefresh)
    const ro = new ResizeObserver(() => {
      if (!el || Math.abs(el.offsetHeight - measured) < 2) return
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        smoothScroll.current?.resize()
        ScrollTrigger.refresh()
      }, 200)
    })
    if (el) ro.observe(el)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      ro.disconnect()
      ScrollTrigger.removeEventListener('refresh', onRefresh)
    }
  }, [location, ready])

  useReveals(main, [ready, path], ready)
  return (
    <ReadyCtx.Provider value={ready}>
      <div id="page-top" aria-hidden="true" />

      <Loader onDone={() => setReady(true)} />

      <Header />

      <main
        ref={main}
        id="main"
        tabIndex={-1}
        className="page-enter outline-none"
      >
        {isHome ? (
          <Home />
        ) : category ? (
          <Work key={category.id} categoryId={category.id} collectionId={collectionId} />
        ) : (
          <section
            dir={rtl ? 'rtl' : 'ltr'}
            className="min-h-[70vh] bg-[#051746] px-6 pb-24 pt-40 text-center text-white"
          >
            <h1 className="text-4xl font-semibold">
              {tr({
                en: 'Page not found',
                ar: 'الصفحة غير موجودة',
              })}
            </h1>

            <a
              href="/"
              className="mt-8 inline-flex gap-3 rounded-full bg-[#f6620d] px-6 py-3"
            >
              <span aria-hidden="true">{rtl ? '→' : '←'}</span>
              {tr({
                en: 'Back to home',
                ar: 'العودة إلى الصفحة الرئيسية',
              })}
            </a>
          </section>
        )}
      </main>

      <Footer />

      {isHome && <JourneyRail />}

      {ready && <BackToTop />}
    </ReadyCtx.Provider>
  )
}
