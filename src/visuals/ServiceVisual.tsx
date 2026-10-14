import { useId } from 'react'
import type { ReactElement } from 'react'
import './services-studio.css'
import { gsap } from '../lib/gsap'
import type { ServiceId } from '../content/services'
/**
 * One bespoke visual per service. Each has a paused timeline (see buildVisual)
 * that the Services section drives from scroll position.
 */
const O = '#F6620D'
const W = '#fff'
const stroke = { fill: 'none', stroke: W, strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const dash = { pathLength: 1, strokeDasharray: '1' }

function useMaterials() {
  const id = useId().replace(/:/g, '')
  return {
    metal: `url(#${id}-metal)`, orange: `url(#${id}-orange)`,
    defs: <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#64717D"/><stop offset=".25" stopColor="#28343F"/>
        <stop offset=".7" stopColor="#101A24"/><stop offset="1" stopColor="#394652"/>
      </linearGradient>
      <linearGradient id={`${id}-orange`} x1="0" y1="0" x2=".8" y2="1">
        <stop stopColor="#FFD1A2"/><stop offset=".35" stopColor="#F6620D"/><stop offset="1" stopColor="#8C2D09"/>
      </linearGradient>
    </defs>,
  }
}

// 01 Brands — an A-shaped monolith assembled slab by slab.
function Brands() {
  const projects = [
    // Lossless WebP copies of the screenshots (pixel-identical, ~45% smaller); PNG originals in assets-src/clients/.
    { key: 'web', src: '/images/clients/sbat-branding.webp', title: 'SBAT', detail: 'Brand identity', color: '#437450' },
    { key: 'phone', src: '/images/clients/kaser-alpasha-branding.webp', title: 'Kaser Alpasha', detail: 'Brand identity', color: '#485C8C' },
    { key: 'card', src: '/images/clients/brooj-branding.webp', title: 'Brooj', detail: 'Brand identity', color: '#46B9D8' },
  ]
  return (
    <div className="client-brand-stage" aria-hidden="true" dir="ltr">
      {projects.map(project => (
        <div key={project.key} className={`b-slab client-brand-panel client-brand-${project.key}`}>
          <div className="client-brand-chrome"><i/><i/><i/></div>
          <div className="client-brand-photo">
            <img src={project.src} alt="" draggable={false} decoding="async" loading="lazy" />
          </div>
          <div className="client-brand-caption">
            <span style={{ background: project.color }} />
            <strong>{project.title}</strong>
            <small>{project.detail}</small>
          </div>
        </div>
      ))}
    </div>
  )
}

// 02 Campaigns — separate streams fall into one rhythm.
const WAVES = [
  { base: 130, amp: 22, f: 0.031, ph: 0.4 },
  { base: 470, amp: 60, f: 0.012, ph: 2.6 },
  { base: 300, amp: 38, f: 0.021, ph: 4.4 },
  { base: 210, amp: 70, f: 0.009, ph: 1.3 },
  { base: 400, amp: 18, f: 0.04, ph: 5.5 },
]
function wavePath(i: number, k: number) {
  const s = WAVES[i]
  const base = s.base + (300 + (i - 2) * 30 - s.base) * k
  const amp = s.amp + (48 - s.amp) * k
  const f = s.f + (0.0165 - s.f) * k
  const ph = s.ph + (0 - s.ph) * k
  let d = ''
  for (let x = 30; x <= 570; x += 12) d += `${x === 30 ? 'M' : 'L'}${x} ${(base + Math.sin(x * f + ph) * amp).toFixed(1)}`
  return d
}
function Campaigns() {
  const m = useMaterials()
  return <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
    {m.defs}
    {WAVES.map((_, i) => <path key={i} className="c-wave" d={wavePath(i, 0)} {...stroke} stroke={i === 2 ? O : W} strokeOpacity={i === 2 ? .7 : .12}/>) }
    <g className="c-screen">
      <rect x="116" y="148" width="358" height="230" rx="15" fill={m.metal} stroke="#87949F"/>
      <rect x="128" y="160" width="334" height="205" rx="8" fill="#081018"/>
      <circle cx="368" cy="262" r="65" fill={m.orange}/>
      <path d="M155 204H269M155 223H247M155 244H256" stroke="#E9ECEE" strokeWidth="9"/>
      <rect x="155" y="304" width="76" height="17" rx="8" fill={O}/>
      <path d="M277 378V421H328V378M233 427H371" {...stroke} strokeWidth="10" stroke="#58646E"/>
    </g>
    <g className="c-screen"><rect x="405" y="267" width="94" height="189" rx="18" fill={m.metal} stroke="#AAB3BA"/><rect x="414" y="280" width="76" height="161" rx="10" fill="#111C25"/><circle cx="452" cy="341" r="27" fill={m.orange}/><path d="M427 393H477M427 405H461" stroke="#CED7DD" strokeWidth="4"/></g>
    <g className="c-dot"><circle r="18" fill={O} opacity=".2"/><circle r="7" fill={O}/></g>
  </svg>
}

// 03 Systems — loose layers snap into one operating stack.
function Systems() {
  const m = useMaterials()
  const plate = (cy: number) => `M300 ${cy - 62} 452 ${cy} 300 ${cy + 62} 148 ${cy}Z`
  const ys = [430, 345, 260, 175]
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
      {m.defs}
      {[148, 300, 452].map((x) => (
        <path key={x} className="s-link" d={`M${x} ${x === 300 ? 492 : 430} V${x === 300 ? 237 : 175}`} {...stroke} {...dash} strokeOpacity=".45" />
      ))}
      {ys.map((cy, i) => (
        <g className="s-plate" key={cy}>
          <path d={plate(cy + 15)} fill="#080E14" stroke="#586571" />
          <path d={plate(cy)} fill={m.metal} fillOpacity=".92" stroke={W} strokeOpacity={0.35 + i * 0.15} strokeWidth="1.3" />
          {i === 3 ? (
            <path className="s-core" d={`M300 ${cy - 26} 364 ${cy} 300 ${cy + 26} 236 ${cy}Z`} fill={m.orange} />
          ) : (
            <path d={`M${230 + i * 14} ${cy} h${70 - i * 10} M${330} ${cy + 14} h${40 + i * 12}`} stroke={W} strokeOpacity=".5" strokeWidth="1.5" />
          )}
          <circle className="s-node" cx="452" cy={cy} r="5" fill={W} />
          <circle className="s-node" cx="148" cy={cy} r="5" fill={W} />
        </g>
      ))}
    </svg>
  )
}
// 04 Funnels — wide attention in, one measurable signal out. The V again.
function Funnels() {
  const m = useMaterials()
  const xs = [50, 112, 175, 237, 300, 363, 425, 488, 550]
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
      {m.defs}
      {[0, 1, 2].map(i => {
        const y = 125 + i * 94, half = 195 - i * 54
        return <g className="f-shell" key={i}>
          <path d={`M${300-half} ${y}Q300 ${y+55} ${300+half} ${y}L${300+half-49} ${y+75}Q300 ${y+111} ${300-half+49} ${y+75}Z`} fill={m.metal} stroke="#768592"/>
          <ellipse cx="300" cy={y} rx={half} ry="25" fill="#0B131C" stroke={i === 0 ? O : '#71808D'} strokeWidth="3"/>
        </g>
      })}
      {xs.map((x) => (
        <g key={x}>
          <circle className="f-in" cx={x} cy="70" r="4" fill={W} />
          <path className="f-line" d={`M${x} 70 C${x} 250 300 290 300 440`} {...stroke} {...dash} strokeOpacity=".5" />
        </g>
      ))}
      <path className="f-edge" d="M50 70 300 440 550 70" {...stroke} {...dash} stroke={O} strokeWidth="2" strokeOpacity=".9" />
      <path className="f-out" d="M300 440 V532" {...stroke} {...dash} stroke={O} strokeWidth="4" />
      <g className="f-dot" transform="translate(300 540)">
        <circle r="34" fill={O} opacity=".22" />
        <circle r="14" fill={O} />
        <circle r="4.5" cx="-4" cy="-5" fill="#FFC296" />
      </g>
    </svg>
  )
}
// 05 Automations — one action triggers the next, and the loop keeps turning on its own.
function Automations() {
  const m = useMaterials()
  const nodes = [0, 1, 2, 3].map((i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 2
    return { x: 300 + Math.cos(a) * 190, y: 300 + Math.sin(a) * 190 }
  })
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
      {m.defs}
      <circle cx="300" cy="300" r="118" {...stroke} strokeOpacity=".4" className="spin-slow" strokeDasharray="2 12" />
      <circle cx="300" cy="300" r="190" {...stroke} strokeOpacity=".3" />
      <path className="au-arc" d="M300 110 A190 190 0 1 1 299.9 110" {...stroke} {...dash} stroke={O} strokeWidth="2.5" />
      <circle cx="300" cy="300" r="53" fill={m.orange}/><path d="M280 300L295 315L323 283" {...stroke} strokeWidth="7"/>
      {nodes.map((n, i) => (
        <g key={i} className="au-node" transform={`translate(${n.x} ${n.y})`}>
          <rect className="au-box" x="-40" y="-40" width="80" height="80" rx="18" fill={m.metal} stroke={W} strokeOpacity=".7" strokeWidth="1.3" />
          <circle className="au-led" cx="27" cy="-27" r="6" fill={W} />
          <path d={['M5 -23L-15 3H0L-5 23L17 -5H3Z', 'M-21 -14H21V16H-21ZM-20 -12L0 3L20 -12', 'M-18 13V-3M0 13V-19M18 13V-10', 'M-19 0L-5 15L21 -16'][i]} fill={i === 0 ? O : 'none'} stroke={i === 0 ? O : W} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      ))}
      <g className="au-dot">
        <circle r="20" fill={O} opacity=".25" />
        <circle r="9" fill={O} />
      </g>
    </svg>
  )
}
// 06 Digital experiences — interfaces floating in perspective, settling as you scroll.
function Digital() {
  const bar = 'd-bar h-1.5 origin-left rounded-full rtl:origin-left'
  return (
    <div className="relative h-full w-full [perspective:1100px]" aria-hidden="true" dir="ltr">
      <div className="d-web studio-device absolute top-[16%] left-[6%] h-[48%] w-[72%] rounded-xl border border-white/40 bg-navy-lift/80 p-[3%] shadow-[0_40px_80px_rgb(3_14_46/0.7)] [transform-style:preserve-3d]">
        <div className="mb-[5%] flex gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
        </div>
        <div className={`${bar} mb-[4%] w-[58%] !h-3 bg-white`} />
        <div className={`${bar} mb-[3%] w-[80%] bg-white/40`} />
        <div className={`${bar} mb-[7%] w-[66%] bg-white/40`} />
        <div className={`${bar} w-[26%] !h-4 bg-signal`} />
      </div>
      <div className="d-phone studio-device absolute top-[30%] left-[62%] h-[56%] w-[27%] rounded-[1.4rem] border border-white/60 bg-navy-deep p-[3%] shadow-[0_40px_80px_rgb(3_14_46/0.8)]">
        <div className="mx-auto mb-[14%] h-1 w-[34%] rounded-full bg-white/40" />
        <div className="d-tile studio-screen-art mb-[8%] aspect-[4/3] w-full rounded-lg bg-signal" />
        <div className={`${bar} mb-[7%] w-[86%] bg-white/70`} />
        <div className={`${bar} mb-[7%] w-[60%] bg-white/40`} />
        <div className={`${bar} w-[74%] bg-white/40`} />
      </div>
      <div className="d-card studio-device absolute top-[66%] left-[14%] h-[20%] w-[40%] rounded-xl border border-white/40 bg-navy/90 p-[3%] shadow-[0_30px_60px_rgb(3_14_46/0.7)]">
        <div className="flex h-full items-end gap-[6%]">
          {[38, 55, 46, 72, 100].map((hgt, i) => (
            <span key={i} className={`d-col w-full origin-bottom rounded-sm ${i === 4 ? 'bg-signal' : 'bg-white/50'}`} style={{ height: `${hgt}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}
// 07 Growth engines — each cycle is a larger A that feeds the next.
const GROW = (() => {
  let d = ''
  const tris: string[] = []
  let last = { x: 0, y: 0 }
  for (let i = 0; i < 5; i++) {
    const cx = 88 + i * 106
    const by = 520 - i * 18
    const hgt = 56 + i * 52
    const hw = hgt * 0.34
    d += `${i === 0 ? `M${cx - hw - 30} ${by}L` : 'L'}${cx - hw} ${by} L${cx} ${by - hgt} `
    if (i < 4) d += `L${cx + hw} ${by} `
    tris.push(`M${cx - hw} ${by} L${cx} ${by - hgt} L${cx + hw} ${by}Z`)
    last = { x: cx, y: by - hgt }
  }
  return { d, tris, last }
})()
function Growth() {
  const m = useMaterials()
  return (
    <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
      {m.defs}
      <path d="M30 540 H570" {...stroke} strokeOpacity=".3" />
      {GROW.tris.map((t, i) => (
        <g key={i} className="g-tri"><path d={t} transform="translate(10 9)" fill="#070C12" stroke="#64717C"/><path d={t} fill={i === 4 ? m.orange : m.metal} stroke={i === 4 ? '#FFC296' : '#7D8C98'} strokeWidth="2"/></g>
      ))}
      <path className="g-line" d={GROW.d} {...stroke} {...dash} stroke={O} strokeWidth="3" />
      <path className="g-up" d={`M${GROW.last.x} ${GROW.last.y} V70`} {...stroke} {...dash} stroke={O} strokeWidth="3" />
      <path className="g-head" d={`M${GROW.last.x - 14} 88 ${GROW.last.x} 62 ${GROW.last.x + 14} 88Z`} fill={O} />
      <g className="g-dot">
        <circle r="20" fill={O} opacity=".25" />
        <circle r="9" fill={O} />
      </g>
    </svg>
  )
}
const map: Record<ServiceId, () => ReactElement> = {
  brands: Brands,
  campaigns: Campaigns,
  systems: Systems,
  funnels: Funnels,
  automations: Automations,
  digital: Digital,
  growth: Growth,
}
export function ServiceVisual({ id, className = '' }: { id: ServiceId; className?: string }) {
  const V = map[id]
  return (
    <div className={`sv sv-${id} studio-visual aspect-square ${className}`}>
      <V />
    </div>
  )
}
/** Builds the paused timeline for a visual. Progress 0 → 1 is driven by scroll. */
export function buildVisual(id: ServiceId, root: Element) {
  const q = gsap.utils.selector(root)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } })
  const draw = (sel: string, at: number, dur = 0.4, stagger = 0) =>
    tl.fromTo(q(sel), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, stagger, ease: 'power1.inOut' }, at)
  switch (id) {
    case 'brands':
      tl.fromTo(q('.client-brand-web'),
        { rotateY: -38, rotateX: 18, z: -260, x: -60, opacity: 0 },
        { rotateY: -14, rotateX: 6, z: 0, x: 0, opacity: 1, duration: 0.6 }, 0)
      tl.fromTo(q('.client-brand-phone'),
        { rotateY: 40, rotateX: 10, z: -200, y: 120, opacity: 0 },
        { rotateY: -18, rotateX: 4, z: 80, y: 0, opacity: 1, duration: 0.6 }, 0.12)
      tl.fromTo(q('.client-brand-card'),
        { rotateY: -30, z: -160, y: 90, opacity: 0 },
        { rotateY: -10, rotateX: 8, z: 120, y: 0, opacity: 1, duration: 0.5 }, 0.26)
      break

    case 'campaigns': {
      tl.fromTo(q('.c-screen'), { y: 80, opacity: 0, scale: .9, transformOrigin: 'center' }, { y: 0, opacity: 1, scale: 1, duration: .5, stagger: .12 }, .12)
      const s = { k: 0 }
      const waves = q('.c-wave')
      const dotEl = q('.c-dot')[0]
      const upd = () => {
        waves.forEach((w, i) => w.setAttribute('d', wavePath(i, s.k)))
        const x = 60 + 480 * s.k
        const y = 300 + Math.sin(x * (WAVES[2].f + (0.0165 - WAVES[2].f) * s.k) + WAVES[2].ph * (1 - s.k)) * (WAVES[2].amp + (48 - WAVES[2].amp) * s.k)
        dotEl.setAttribute('transform', `translate(${x} ${y})`)
      }
      upd()
      tl.to(s, { k: 1, duration: 1, ease: 'power2.inOut', onUpdate: upd }, 0)
      break
    }
    case 'systems': {
      const from = [
        { x: -130, y: 90, rotation: -14 },
        { x: 150, y: 40, rotation: 10 },
        { x: -110, y: -70, rotation: 8 },
        { x: 120, y: -130, rotation: -12 },
      ]
      q('.s-plate').forEach((p, i) => {
        tl.fromTo(p, { ...from[i], opacity: 0.25, transformOrigin: 'center' }, { x: 0, y: 0, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.3)' }, 0.04 + i * 0.13)
      })
      draw('.s-link', 0.6, 0.25, 0.05)
      tl.fromTo(q('.s-node'), { fill: W }, { fill: O, duration: 0.15, stagger: 0.02 }, 0.75)
      tl.fromTo(q('.s-core'), { opacity: 0, scale: 0.4, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2)' }, 0.8)
      break
    }
    case 'funnels':
      tl.fromTo(q('.f-shell'), { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: .35, stagger: .12 }, .15)
      tl.fromTo(q('.f-in'), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.2, stagger: { each: 0.02, from: 'edges' } }, 0)
      tl.fromTo(q('.f-line'), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.45, stagger: { each: 0.03, from: 'edges' }, ease: 'power1.inOut' }, 0.1)
      draw('.f-edge', 0.4, 0.3)
      tl.to(q('.f-line'), { strokeOpacity: 0.18, duration: 0.2 }, 0.7)
      draw('.f-out', 0.72, 0.15)
      tl.fromTo(q('.f-dot'), { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.85)
      break
    case 'automations': {
      draw('.au-arc', 0, 1)
      tl.fromTo(q('.au-dot'), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0)
      tl.to(q('.au-dot'), { motionPath: { path: 'M300 110 A190 190 0 1 1 299.9 110' }, duration: 1, ease: 'none' }, 0)
      q('.au-node').forEach((n, i) => {
        const at = i === 0 ? 0 : i * 0.25
        tl.to(n.querySelector('.au-led'), { fill: O, attr: { r: 9 }, duration: 0.06 }, at)
        tl.to(n.querySelector('.au-box'), { stroke: O, strokeOpacity: 1, duration: 0.06 }, at)
      })
      break
    }
    case 'digital':
      tl.fromTo(q('.d-web'), { rotateY: -38, rotateX: 18, z: -260, x: -60, opacity: 0 }, { rotateY: -14, rotateX: 6, z: 0, x: 0, opacity: 1, duration: 0.6 }, 0)
      tl.fromTo(q('.d-phone'), { rotateY: 40, rotateX: 10, z: -200, y: 120, opacity: 0 }, { rotateY: -18, rotateX: 4, z: 80, y: 0, opacity: 1, duration: 0.6 }, 0.12)
      tl.fromTo(q('.d-card'), { rotateY: -30, z: -160, y: 90, opacity: 0 }, { rotateY: -10, rotateX: 8, z: 120, y: 0, opacity: 1, duration: 0.5 }, 0.26)
      tl.fromTo(q('.d-bar'), { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.03 }, 0.4)
      tl.fromTo(q('.d-tile'), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.25 }, 0.5)
      tl.fromTo(q('.d-col'), { scaleY: 0 }, { scaleY: 1, duration: 0.3, stagger: 0.05, ease: 'back.out(1.6)' }, 0.6)
      break
    case 'growth':
      draw('.g-line', 0, 0.8)
      tl.fromTo(q('.g-dot'), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0)
      tl.to(q('.g-dot'), { motionPath: { path: GROW.d }, duration: 0.8, ease: 'power1.inOut' }, 0)
      tl.fromTo(q('.g-tri'), { opacity: 0 }, { opacity: 1, duration: 0.15, stagger: 0.16 }, 0.1)
      draw('.g-up', 0.8, 0.15)
      tl.to(q('.g-dot'), { opacity: 0, duration: 0.05 }, 0.8)
      tl.fromTo(q('.g-head'), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.1 }, 0.9)
      break
  }
  return tl
}
