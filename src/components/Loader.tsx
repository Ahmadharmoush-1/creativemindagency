import { useLayoutEffect, useRef, useState } from 'react'
import { gsap, prefersReduced } from '../lib/gsap'
import { Wordmark } from './Brand'

/**
 * Opening sequence:
 * A point draws the A, the A folds into the V,
 * then the wordmark arrives.
 */
export function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return

    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const finish = () => {
      document.documentElement.style.overflow = previousOverflow
      onDone()
    }

    if (prefersReduced()) {
      const id = window.setTimeout(() => {
        finish()
        setGone(true)
      }, 500)

      return () => {
        window.clearTimeout(id)
        document.documentElement.style.overflow = previousOverflow
      }
    }

    const path = el.querySelector<SVGPathElement>('.ld-path')!
    const dot = el.querySelector<SVGGElement>('.ld-dot')!

    // Apex height, feet height, half-spread, trace and fold progress.
    const s = { ay: 60, fy: 180, sp: 74, u: 0, m: 0 }
    const cx = 170

    const render = () => {
      const L = [cx - s.sp, s.fy]
      const A = [cx, s.ay]
      const R = [cx + s.sp, s.fy]

      path.setAttribute(
        'd',
        `M${L[0]} ${L[1]} L${A[0]} ${A[1]} L${R[0]} ${R[1]}`,
      )

      path.style.strokeDashoffset = String(1 - s.u)

      // The dot follows the stroke, then moves to the V's tip.
      let x: number
      let y: number

      if (s.u < 0.5) {
        x = L[0] + (A[0] - L[0]) * (s.u / 0.5)
        y = L[1] + (A[1] - L[1]) * (s.u / 0.5)
      } else {
        x = A[0] + (R[0] - A[0]) * ((s.u - 0.5) / 0.5)
        y = A[1] + (R[1] - A[1]) * ((s.u - 0.5) / 0.5)
      }

      x += (A[0] - x) * s.m
      y += (A[1] - y) * s.m

      dot.setAttribute('transform', `translate(${x} ${y})`)
    }

    render()

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
      })

      tl.from(
        '.ld-dot-in',
        {
          scale: 0,
          duration: 0.3,
          ease: 'back.out(2)',
          transformOrigin: 'center',
        },
        0.1,
      )
        .to(
          s,
          {
            u: 1,
            duration: 0.75,
            onUpdate: render,
          },
          0.35,
        )
        .to(
          s,
          {
            ay: 180,
            fy: 64,
            sp: 50,
            m: 1,
            duration: 0.5,
            ease: 'power4.inOut',
            onUpdate: render,
          },
          1.08,
        )
        .to(
          '.ld-glow',
          {
            scale: 3.4,
            opacity: 0,
            duration: 0.6,
            ease: 'power2.out',
            transformOrigin: 'center',
          },
          1.5,
        )
        .to(
          '.ld-path',
          {
            opacity: 0.22,
            duration: 0.4,
          },
          1.55,
        )
        .to(
          '.ld-word .ch',
          {
            y: 0,
            duration: 0.7,
            ease: 'expo.out',
            stagger: 0.025,
          },
          1.5,
        )
        .to(
          '.ld-tag',
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
          },
          1.8,
        )
        .add(finish, 2.25)
        .to(
          el,
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.8,
            ease: 'expo.inOut',
          },
          2.25,
        )
        .add(() => setGone(true))
    }, el)

    return () => {
      ctx.revert()
      document.documentElement.style.overflow = previousOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gone) return null

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-navy"
      style={{ clipPath: 'inset(0 0 0% 0)' }}
      role="status"
      aria-label="Loading Creative Mind"
    >
      <svg
        viewBox="0 0 340 220"
        className="w-[min(62vw,300px)] overflow-visible"
        aria-hidden="true"
      >
        <path
          className="ld-path"
          pathLength={1}
          fill="none"
          stroke="#F6620D"
          strokeWidth="10"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray="1"
        />

        <g className="ld-dot">
          <g className="ld-dot-in">
            <circle
              className="ld-glow"
              r="9"
              fill="#F6620D"
              opacity="0.5"
            />
            <circle r="9" fill="#F6620D" />
            <circle r="3" cx="-2.5" cy="-3" fill="#FFC296" />
          </g>
        </g>
      </svg>

      <div className="ld-word mt-8 overflow-hidden text-[clamp(1.3rem,4.6vw,2.3rem)]">
        <span className="ch block translate-y-[110%]">
          <Wordmark />
        </span>
      </div>

      <p className="ld-tag latin eyebrow mt-4 translate-y-2 text-white/70 opacity-0">
        Mind Made Visible.
      </p>
    </div>
  )
}