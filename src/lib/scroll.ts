import { getLenis, prefersReduced } from './gsap'

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

  history.replaceState(null, '', toTop ? window.location.pathname : `#${id}`)
}
