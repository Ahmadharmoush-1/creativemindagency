import { useEffect, useState, type RefObject } from 'react'

/**
 * Turns true (and stays true) once `ref` comes within `margin` of the screen, e.g. '150% 0px' is
 * one and a half screens ahead. Heavy below-the-fold media waits for it, so the first screen and
 * the hero film get the connection to themselves. The files themselves are never altered.
 *
 * `afterLoad`: also turn true once the page has finished loading and the browser is idle, for
 * media that should be ready before the reader can possibly scroll to it.
 */
export function useNear(ref: RefObject<Element | null>, margin = '150% 0px', afterLoad = false) {
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (near || !el) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setNear(true)
      },
      { rootMargin: margin },
    )
    io.observe(el)

    let idle = 0
    let timer = 0
    const whenIdle = () => {
      // A short pause after `load` lets the hero film's own buffering go first.
      timer = window.setTimeout(() => {
        if (window.requestIdleCallback) idle = window.requestIdleCallback(() => setNear(true), { timeout: 3000 })
        else setNear(true)
      }, 1500)
    }
    if (afterLoad) {
      if (document.readyState === 'complete') whenIdle()
      else window.addEventListener('load', whenIdle, { once: true })
    }
    return () => {
      io.disconnect()
      window.removeEventListener('load', whenIdle)
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback?.(idle)
    }
  }, [ref, margin, afterLoad, near])
  return near
}
