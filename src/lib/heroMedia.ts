import type { Lang } from './i18n'

/**
 * Hero film posters. English uses the originals, Arabic the horizontally mirrored copies.
 * `portrait` matches the Hero's '(max-width: 1023px) and (orientation: portrait)' query.
 */
export function heroPoster(lang: Lang, portrait: boolean) {
  if (portrait) return lang === 'ar' ? '/media/hero-poster-mobile-ar.webp' : '/media/hero-poster-mobile.webp'
  return lang === 'ar' ? '/media/hero-poster-ar.webp' : '/media/hero-poster.webp'
}

const warmed = new Map<string, HTMLImageElement>()

const slowLink = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
  return !!c && (c.saveData === true || /(^|-)2g$/.test(c.effectiveType ?? ''))
}

/**
 * Fetches and decodes the hero poster for `lang` ahead of a language switch, so the new film's
 * poster is on screen in the same frame as the new text (no navy flash while it downloads).
 * Each file is fetched once; nothing is fetched on Save-Data or 2G connections.
 */
export function warmHeroPoster(lang: Lang) {
  if (typeof window === 'undefined' || slowLink()) return
  const portrait = window.matchMedia('(max-width: 1023px) and (orientation: portrait)').matches
  const src = heroPoster(lang, portrait)
  if (warmed.has(src)) return
  const img = new Image()
  img.decoding = 'async'
  img.src = src
  img.decode?.().catch(() => {})
  // Kept referenced so the decoded picture stays in memory.
  warmed.set(src, img)
}
