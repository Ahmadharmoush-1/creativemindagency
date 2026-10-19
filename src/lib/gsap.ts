import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import type Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)
gsap.defaults({ ease: 'power3.out' })
// Mobile browsers resize the viewport as the address bar hides; re-measuring on that makes scroll scenes jump.
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger }

export const CINE = 'expo.out'

export const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let lenis: Lenis | null = null
export const setLenis = (l: Lenis | null) => {
  lenis = l
}
export const getLenis = () => lenis

/**
 * True only while React commits a language change (set by LangProvider in ./i18n).
 * Animation code that rebuilds because the language changed checks it to land on the state the
 * current scroll position calls for, instead of replaying entrances or re-scrubbing from zero.
 */
let langCommit = false
export const setLangSwitch = (on: boolean) => {
  langCommit = on
}

/** A trigger's progress for the current scroll position, valid even before its first update. */
export function liveProgress(st: ScrollTrigger) {
  if (!st.start && !st.end) st.refresh()
  return clamp01((st.scroll() - st.start) / Math.max(1, st.end - st.start))
}

const rebuilt: gsap.Context[] = []

/**
 * Marks a context as rebuilt by a language switch. LangProvider calls `flushRebuilds()` right
 * after its single ScrollTrigger.refresh(), in the same frame, so these are settled against
 * fresh measurements without measuring each trigger separately.
 */
export function settleRebuild(ctx: gsap.Context) {
  if (langCommit) rebuilt.push(ctx)
}

/**
 * Every scrubbed animation from a rebuilt context jumps to the scroll position's progress, and
 * every one-shot entrance the reader has already scrolled past jumps to its end (no replay).
 * Entrances still ahead of the reader are untouched and play as normal.
 */
export function flushRebuilds() {
  for (const ctx of rebuilt.splice(0)) {
    for (const item of ctx.data as unknown[]) {
      if (!(item instanceof ScrollTrigger)) continue
      const st = item
      const anim = st.animation
      if (!anim) continue
      if (st.vars.scrub) {
        anim.progress(liveProgress(st))
      } else if (anim.repeat() !== -1 && st.scroll() >= st.start && (st.vars.once || !st.vars.toggleActions)) {
        anim.progress(1)
      }
    }
  }
}

/** Scoped GSAP context that reverts on unmount or when deps change. */
export function useGsap(
  scope: RefObject<HTMLElement | null>,
  fn: () => void | (() => void),
  deps: unknown[] = [],
) {
  useLayoutEffect(() => {
    let cleanup: void | (() => void)
    const ctx = gsap.context(() => {
      cleanup = fn()
    }, scope.current ?? undefined)
    settleRebuild(ctx)
    return () => {
      cleanup?.()
      ctx.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/**
 * Canvas that draws only while on screen, sized to its box at device pixel ratio.
 * With reduced motion it paints a single frame (and repaints on resize).
 *
 * The canvas, its observers and its draw loop are set up once. The loop always calls the latest
 * `draw`, so a change in `deps` (the language, say) shows on the very next frame instead of
 * tearing the canvas down, which blanked it for a frame.
 */
export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void,
  deps: unknown[] = [],
) {
  const ref = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  drawRef.current = draw
  // Still canvases (reduced motion) have no loop: paint once more when what they show changes.
  useEffect(() => {
    ref.current?.dispatchEvent(new Event('repaint'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  useEffect(() => {
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => drawRef.current(ctx, w, h, t)
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let w = 0
    let h = 0
    let raf = 0
    let visible = false
    const still = prefersReduced()
    const resize = () => {
      // Phones redraw fewer pixels: lighter frames while scrolling.
      const dpr = Math.min(window.devicePixelRatio || 1, isTouch() ? 1.5 : 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (still) draw(ctx, w, h, 0)
    }
    const loop = (t: number) => {
      if (!visible) return
      draw(ctx, w, h, t / 1000)
      raf = requestAnimationFrame(loop)
    }
    // A still canvas has no loop: let callers ask for one more frame (an image finished loading).
    const repaint = () => {
      if (still) draw(ctx, w, h, 0)
    }
    canvas.addEventListener('repaint', repaint)
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      cancelAnimationFrame(raf)
      if (visible && !still) raf = requestAnimationFrame(loop)
    })
    io.observe(canvas)
    resize()
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('repaint', repaint)
      ro.disconnect()
      io.disconnect()
    }
  }, [])
  return ref
}

export const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * Touch screens only. Holds a stage perfectly still while its tall track scrolls past.
 *
 * `position: sticky` follows the scroll position, and on phones that position is updated on a
 * different thread from the page's animations, so a sticky stage full of scroll-driven
 * animation can visibly shake. `position: fixed` is attached to the screen itself and cannot.
 * The stage is absolute at the top of the track before the pin, fixed during it, and absolute
 * at the bottom after it. Desktop keeps CSS sticky.
 * Pass `null` as the selector for a layout that has no pin (and list what decides it in `deps`).
 */
export function useFixedPin(track: RefObject<HTMLElement | null>, stageSelector: string | null, deps: unknown[] = []) {
  useLayoutEffect(() => {
    const el = track.current
    if (!el || !stageSelector || prefersReduced() || !isTouch()) return
    const stage = el.querySelector<HTMLElement>(stageSelector)
    if (!stage) return

    let mode = ''
    const apply = (next: 'before' | 'fixed' | 'after') => {
      if (next === mode) return
      mode = next
      stage.style.position = next === 'fixed' ? 'fixed' : 'absolute'
      stage.style.left = '0'
      stage.style.right = '0'
      stage.style.width = '100%'
      stage.style.top = next === 'after' ? 'auto' : '0'
      stage.style.bottom = next === 'after' ? '0' : 'auto'
    }
    const sync = (self: ScrollTrigger) => apply(self.isActive ? 'fixed' : self.progress > 0.5 ? 'after' : 'before')

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      // The pin lasts exactly as long as the track is taller than the stage.
      end: () => `+=${Math.max(1, el.offsetHeight - stage.offsetHeight)}`,
      invalidateOnRefresh: true,
      onToggle: sync,
      onUpdate: sync,
      onRefresh: sync,
    })
    sync(trigger)

    return () => {
      trigger.kill()
      for (const prop of ['position', 'left', 'right', 'width', 'top', 'bottom'] as const) stage.style[prop] = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/** Deterministic PRNG so generated visuals are stable between renders. */
export function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
