import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ScrollTrigger, flushRebuilds, getLenis, setLangSwitch } from './gsap'

export type Lang = 'en' | 'ar'
/** A localised string. Every piece of content is stored in both languages. */
export type L = Record<Lang, string>

type Ctx = {
  lang: Lang
  rtl: boolean
  setLang: (l: Lang) => void
  tr: (s: L) => string
}

const LangCtx = createContext<Ctx | null>(null)

const initial = (): Lang => (document.documentElement.lang === 'ar' ? 'ar' : 'en')

/** Writes lang/dir on <html>. Done before React re-renders, so every layout read sees the new direction. */
function applyDocumentLang(lang: Lang) {
  const d = document.documentElement
  d.lang = lang
  d.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

type Anchor = { el: Element; offset: number } | null

/**
 * The block of the page under the middle of the screen, and how far through it the reader is.
 * Arabic lines are taller, so pixel offsets change with the language; this keeps the reader on
 * the same part of the same section instead.
 */
function readAnchor(): Anchor {
  const blocks = [...(document.getElementById('main')?.children ?? []), document.querySelector('footer')]
  const mid = window.innerHeight / 2
  for (const el of blocks) {
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.height > 0 && r.top <= mid && r.bottom > mid) return { el, offset: (mid - r.top) / r.height }
  }
  return null
}

function restoreAnchor(anchor: Anchor) {
  if (!anchor || !anchor.el.isConnected) return
  const r = anchor.el.getBoundingClientRect()
  const delta = Math.round(r.top + anchor.offset * r.height - window.innerHeight / 2)
  if (Math.abs(delta) < 2) return
  const y = window.scrollY + delta
  getLenis()?.scrollTo(y, { immediate: true, force: true })
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
}

/**
 * Arabic text is set in Noto Kufi Arabic, including its Latin letters, digits and symbols, which
 * live in separate small font files (latin, latin-ext, symbols, math). The browser only fetches a
 * file when a character needs it, so the first switch to Arabic used to lay the page out again as
 * each file arrived. Fetch the other language's files once the page is idle (about 85 KB).
 */
function warmOtherFonts() {
  const fonts = document.fonts
  if (!fonts) return
  if (document.documentElement.lang === 'ar') {
    void fonts.load('1em "Montserrat Variable"', 'Aa1').catch(() => {})
    return
  }
  fonts.forEach((face) => {
    if (face.family.replace(/["']/g, '') === 'Noto Kufi Arabic Variable' && face.status === 'unloaded') {
      void face.load().catch(() => {})
    }
  })
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial)
  const anchor = useRef<Anchor>(null)
  const first = useRef(true)

  // Runs after every child's layout effects for this commit and before the browser paints,
  // so no frame is ever shown with stale scroll positions.
  useLayoutEffect(() => {
    applyDocumentLang(lang)
    try {
      localStorage.setItem('cm-lang', lang)
    } catch {
      /* storage unavailable */
    }
    if (first.current) {
      first.current = false
      return
    }
    // Text metrics changed with the language: keep the reader on the same spot, then
    // re-measure every scroll scene against the new layout (forced, even mid-scroll).
    getLenis()?.resize()
    restoreAnchor(anchor.current)
    anchor.current = null
    ScrollTrigger.refresh(true)
    // Scenes rebuilt for the new language land on their current state (no replayed entrances).
    flushRebuilds()
    setLangSwitch(false)
    // A very short settle-in that never delays the new text: it is already on screen.
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      for (const el of [document.getElementById('main'), document.querySelector('footer')]) {
        el?.animate?.([{ opacity: 0.72 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' })
      }
    }
  }, [lang])

  useEffect(() => {
    let idle = 0
    const later = () => {
      if (window.requestIdleCallback) idle = window.requestIdleCallback(warmOtherFonts, { timeout: 5000 })
      else window.setTimeout(warmOtherFonts, 2000)
    }
    if (document.readyState === 'complete') later()
    else window.addEventListener('load', later, { once: true })
    return () => {
      window.removeEventListener('load', later)
      if (idle) window.cancelIdleCallback?.(idle)
    }
  }, [])

  // The text changes in the same frame as the click. No fade-out, no timers.
  const setLang = useCallback((next: Lang) => {
    if (next === document.documentElement.lang) return
    anchor.current = readAnchor()
    setLangSwitch(true)
    applyDocumentLang(next)
    set(next)
  }, [])

  const value = useMemo<Ctx>(() => ({ lang, rtl: lang === 'ar', setLang, tr: (s) => s[lang] }), [lang, setLang])
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang must be used inside LangProvider')
  return c
}
