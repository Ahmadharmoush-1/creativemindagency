import { ScrollTrigger, getLenis, prefersReduced } from './gsap'

/**
 * Scrolls to a section of the landing page. `hash` is "#contact", "#top", etc.
 * Uses the smooth-scroll engine on desktop and the browser's own smooth scrolling on phones.
 */
export function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, '')
  const toTop = id === '' || id === 'top'
  const target = toTop ? null : document.getElementById(id)
  if (!toTop && !target) return

  // +1 so a pinned section is already engaged when the scroll lands on it.
  const y = target ? Math.round(target.getBoundingClientRect().top + window.scrollY) + 1 : 0
  const lenis = getLenis()
  if (lenis) lenis.scrollTo(y, { duration: 1.3 })
  else window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' })

  // Keep the entry's state: it carries the key that remembers this entry's scroll position.
  history.replaceState(history.state, '', toTop ? window.location.pathname : `#${id}`)
}

/**
 * Moves the page to `y` at once, keeping Lenis and ScrollTrigger in step with it.
 *
 * ScrollTrigger.refresh() records the scroll position, rebuilds, then puts the page back there,
 * and it reads that position from its own cache. Without Lenis (phones) nothing updates the cache
 * between a page swap and the next refresh, so the refresh dragged the new page down to the old
 * page's position. Writing through ScrollTrigger's scroll function keeps its cache current, and
 * clearing its memory drops any position recorded while the old page was being torn down.
 */
export function jumpTo(y: number) {
  getLenis()?.scrollTo(y, { immediate: true, force: true })
  window.scrollTo({ top: y, left: 0, behavior: 'instant' })
  ScrollTrigger.getScrollFunc(window)(y)
  ScrollTrigger.clearScrollMemory()
}

/*
 * Scroll memory for Back/Forward. The browser's own restoration is switched off because it
 * restores after our page swap and races it; instead each history entry carries a key, the
 * position is saved when the entry is left, and restored once the entry's page is mounted.
 */
type EntryState = { cmKey?: string } | null
const positions = new Map<string, number>()
let currentKey = ''
const newKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
const stateKey = () => (history.state as EntryState)?.cmKey

function keyCurrentEntry() {
  let key = stateKey()
  if (!key) {
    key = newKey()
    history.replaceState({ ...(history.state ?? {}), cmKey: key }, '')
  }
  currentKey = key
}

export function initHistory() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
  keyCurrentEntry()
}

/**
 * ScrollTrigger reads the page position from a cache that it only re-reads while it has scroll
 * scenes to update. On a page without any (the Work pages) the cache falls one scroll behind, and
 * the next ScrollTrigger.refresh() (after images load, a resize) "restores" that stale position,
 * throwing a reader back to where they were before. Reading it on every scroll keeps it current.
 * Returns the cleanup.
 */
export function keepScrollCacheFresh() {
  // Called without a value the function reads (and caches) the position; the typings omit that form.
  const scroll = ScrollTrigger.getScrollFunc(window) as unknown as () => number
  const read = () => {
    scroll()
  }
  window.addEventListener('scroll', read, { passive: true })
  return () => window.removeEventListener('scroll', read)
}

/** Navigates to `url` as a new history entry, remembering where the current entry was scrolled. */
export function pushEntry(url: string) {
  positions.set(currentKey, window.scrollY)
  currentKey = newKey()
  history.pushState({ cmKey: currentKey }, '', url)
}

/** Call from `popstate`: saves the entry being left, returns the saved position of the one arrived at. */
export function popEntry(): number | null {
  positions.set(currentKey, window.scrollY)
  keyCurrentEntry()
  return positions.get(currentKey) ?? null
}
