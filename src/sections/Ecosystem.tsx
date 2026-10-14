// import { useEffect, useRef, useState } from 'react'
// import { useLang } from '../lib/i18n'
// import { prefersReduced, useMedia } from '../lib/gsap'
// import { ui } from '../content/ui'
// import { Eyebrow, Lines, dot } from '../components/Brand'

// // Two tilted orbits turning in opposite directions around the core.
// const ORBITS = [
//   { rx: 0.47, ry: 0.2, tilt: -0.2, speed: 0.11, members: [0, 2, 4, 6] },
//   { rx: 0.3, ry: 0.27, tilt: 0.42, speed: -0.16, members: [1, 3, 5] },
// ]
// // Narrow screens: the orbits stand upright so nothing is pushed off the sides.
// const ORBITS_NARROW = [
//   { rx: 0.33, ry: 0.58, tilt: -0.12, speed: 0.11, members: [0, 2, 4, 6] },
//   { rx: 0.2, ry: 0.4, tilt: 0.3, speed: -0.16, members: [1, 3, 5] },
// ]

// export function Ecosystem() {
//   const { tr, lang } = useLang()
//   const box = useRef<HTMLDivElement>(null)
//   const nodeEls = useRef<(HTMLButtonElement | null)[]>([])
//   const lineEls = useRef<(SVGLineElement | null)[]>([])
//   const ringEls = useRef<(SVGEllipseElement | null)[]>([])
//   const hovered = useRef<number | null>(null)
//   const [active, setActive] = useState<number | null>(null)
//   const touch = useMedia('(hover: none)')

//   useEffect(() => {
//     const el = box.current
//     if (!el) return
//     const still = prefersReduced()
//     let raf = 0
//     let visible = false
//     let clock = 0
//     let last = 0
//     let speed = 1
//     const frame = (now: number) => {
//       const dt = last ? Math.min(0.05, (now - last) / 1000) : 0
//       last = now
//       speed += ((hovered.current === null ? 1 : 0) - speed) * 0.08
//       clock += dt * speed
//       const w = el.clientWidth
//       const h = el.clientHeight
//       const narrow = w < 640
//       // Leave room at the sides so a label at the widest point of the orbit is never cut off.
//       const S = narrow ? Math.min(w, h * 0.7) : Math.min(w - 150, h * 1.55)
//       const cx = w / 2
//       const cy = h / 2
//       ;(narrow ? ORBITS_NARROW : ORBITS).forEach((o, oi) => {
//         const ring = ringEls.current[oi]
//         if (ring) {
//           ring.setAttribute('cx', String(cx))
//           ring.setAttribute('cy', String(cy))
//           ring.setAttribute('rx', String(o.rx * S))
//           ring.setAttribute('ry', String(o.ry * S))
//           ring.setAttribute('transform', `rotate(${(o.tilt * 180) / Math.PI} ${cx} ${cy})`)
//         }
//         o.members.forEach((m, k) => {
//           const a = (k / o.members.length) * Math.PI * 2 + clock * o.speed * Math.PI * 2 + oi
//           const ex = Math.cos(a) * o.rx * S
//           const ey = Math.sin(a) * o.ry * S
//           const x = cx + ex * Math.cos(o.tilt) - ey * Math.sin(o.tilt)
//           const y = cy + ex * Math.sin(o.tilt) + ey * Math.cos(o.tilt)
//           const depth = (Math.sin(a) + 1) / 2 // 0 = far, 1 = near
//           const on = hovered.current === m
//           const n = nodeEls.current[m]
//           if (n) {
//             n.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%,-50%) scale(${on ? 1.18 : 0.8 + depth * 0.28})`
//             n.style.opacity = String(on ? 1 : hovered.current !== null ? 0.35 : 0.5 + depth * 0.5)
//             n.style.zIndex = String(on ? 40 : depth > 0.5 ? 30 : 10)
//           }
//           const l = lineEls.current[m]
//           if (l) {
//             l.setAttribute('x1', String(cx))
//             l.setAttribute('y1', String(cy))
//             l.setAttribute('x2', String(x))
//             l.setAttribute('y2', String(y))
//             l.setAttribute('stroke', on ? '#F6620D' : '#fff')
//             l.setAttribute('stroke-opacity', String(on ? 1 : 0.08 + depth * 0.14))
//             l.setAttribute('stroke-width', on ? '2' : '1')
//           }
//         })
//       })
//       if (visible && !still) raf = requestAnimationFrame(frame)
//     }
//     const io = new IntersectionObserver(([e]) => {
//       visible = e.isIntersecting
//       cancelAnimationFrame(raf)
//       last = 0
//       if (visible) raf = requestAnimationFrame(frame)
//     })
//     io.observe(el)
//     const ro = new ResizeObserver(() => still && frame(0))
//     ro.observe(el)
//     // With reduced motion the loop is off, so repaint when the highlight changes.
//     const repaint = () => still && frame(0)
//     el.addEventListener('click', repaint)
//     el.addEventListener('pointerover', repaint)
//     el.addEventListener('focusin', repaint)
//     el.addEventListener('pointerout', repaint)
//     return () => {
//       cancelAnimationFrame(raf)
//       io.disconnect()
//       ro.disconnect()
//       el.removeEventListener('click', repaint)
//       el.removeEventListener('pointerover', repaint)
//       el.removeEventListener('focusin', repaint)
//       el.removeEventListener('pointerout', repaint)
//     }
//   }, [])

//   const focus = (i: number | null) => {
//     hovered.current = i
//     setActive(i)
//   }

//   return (
//     <section className="section overflow-hidden bg-navy-deep">
//       <div className="wrap">
//         <Eyebrow className="mb-7 text-white/70">{tr(ui.eco.eyebrow)}</Eyebrow>
//         <h2 className="sr-only">{ui.eco.title[lang].join(' ')}</h2>
//         <Lines as="p" className="t-display" lines={[<span className="thin">{ui.eco.title[lang][0]}</span>, dot(ui.eco.title[lang][1])]} />
//       </div>

//       <div ref={box} className="relative mx-auto mt-6 h-[min(78vh,640px)] w-full max-w-[1400px]" dir="ltr">
//         <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
//           {ORBITS.map((_, i) => (
//             <ellipse
//               key={i}
//               ref={(el) => {
//                 ringEls.current[i] = el
//               }}
//               fill="none"
//               stroke="#fff"
//               strokeOpacity=".14"
//               strokeDasharray={i ? '2 10' : undefined}
//             />
//           ))}
//           {ui.eco.nodes.map((_, i) => (
//             <line
//               key={i}
//               ref={(el) => {
//                 lineEls.current[i] = el
//               }}
//             />
//           ))}
//         </svg>

//         {/* Core */}
//         <div className="pointer-events-none absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center">
//           <span className="relative block">
//             <span className="pulse-ring absolute inset-0 rounded-full border border-signal" aria-hidden="true" />
//             <span className="sphere block h-14 w-14 md:h-24 md:w-24" aria-hidden="true" />
//           </span>
//           <p className={`eyebrow mt-3 leading-relaxed !text-[0.6rem] md:!text-[0.7rem] ${lang === 'ar' ? 'font-ar' : ''}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
//             {ui.eco.core[lang][0]}
//             <br />
//             {ui.eco.core[lang][1]}
//           </p>
//         </div>

//         {ui.eco.nodes.map((n, i) => (
//           <button
//             key={n.t.en}
//             type="button"
//             ref={(el) => {
//               nodeEls.current[i] = el
//             }}
//             aria-describedby="eco-info"
//             // Mouse: hover. Touch: tap to select, tap again to release.
//             onPointerEnter={(e) => e.pointerType === 'mouse' && focus(i)}
//             onPointerLeave={(e) => e.pointerType === 'mouse' && focus(null)}
//             onClick={() => touch && focus(active === i ? null : i)}
//             onFocus={() => !touch && focus(i)}
//             onBlur={() => !touch && focus(null)}
//             aria-pressed={touch ? active === i : undefined}
//             className={`absolute top-0 left-0 flex items-center gap-2.5 rounded-full border px-3 py-2 text-xs font-semibold whitespace-nowrap backdrop-blur-sm transition-[background-color,border-color] duration-300 will-change-transform md:px-5 md:py-3 md:text-base ${
//               active === i ? 'border-signal bg-signal' : 'border-white/25 bg-navy/70'
//             }`}
//             dir={lang === 'ar' ? 'rtl' : 'ltr'}
//           >
//             <span className={`block h-1.5 w-1.5 rounded-full ${active === i ? 'bg-white' : 'bg-signal'}`} aria-hidden="true" />
//             {tr(n.t)}
//           </button>
//         ))}
//       </div>

//       <div className="wrap">
//         <p id="eco-info" className="t-lead mx-auto min-h-[3.4em] max-w-[36ch] text-center" aria-live="polite">
//           {active === null ? (
//             <span className="muted text-sm">{tr(touch ? ui.eco.hintTouch : ui.eco.hint)}</span>
//           ) : (
//             <>
//               <span className="font-semibold text-signal">{tr(ui.eco.nodes[active].t)}</span> — {tr(ui.eco.nodes[active].d)}
//             </>
//           )}
//         </p>
//       </div>
//     </section>
//   )
// }
