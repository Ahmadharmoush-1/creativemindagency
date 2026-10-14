import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ScrollTrigger } from './gsap'

export type Lang = 'en' | 'ar'
/** A localised string. Every piece of content is stored in both languages. */
export type L = Record<Lang, string>

type Ctx = {
  lang: Lang
  rtl: boolean
  switching: boolean
  setLang: (l: Lang) => void
  tr: (s: L) => string
}

const LangCtx = createContext<Ctx | null>(null)

const initial = (): Lang => (document.documentElement.lang === 'ar' ? 'ar' : 'en')

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, set] = useState<Lang>(initial)
  const [switching, setSwitching] = useState(false)

  useEffect(() => {
    const d = document.documentElement
    d.lang = lang
    d.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem('cm-lang', lang)
    } catch {
      /* storage unavailable */
    }
    // Text metrics change with the language, so every scroll position must be re-measured.
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 60)
    return () => window.clearTimeout(id)
  }, [lang])

  // Fade the page out, swap the language, fade back in. No reload.
  const setLang = useCallback(
    (next: Lang) => {
      if (next === lang || switching) return
      setSwitching(true)
      window.setTimeout(() => {
        set(next)
        window.setTimeout(() => setSwitching(false), 80)
      }, 280)
    },
    [lang, switching],
  )

  const value = useMemo<Ctx>(
    () => ({ lang, rtl: lang === 'ar', switching, setLang, tr: (s) => s[lang] }),
    [lang, switching, setLang],
  )
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>
}

export function useLang() {
  const c = useContext(LangCtx)
  if (!c) throw new Error('useLang must be used inside LangProvider')
  return c
}
