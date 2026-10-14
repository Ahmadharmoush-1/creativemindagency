import type { ReactNode } from 'react'
import { Eyebrow, Lines, dot } from './Brand'

/** Opening block for inner pages. `symbol` picks which letter is drawn behind the title. */
export function PageHero({
  eyebrow,
  title,
  lead,
  symbol = 'A',
  children,
}: {
  eyebrow: string
  title: string[]
  lead?: string
  symbol?: 'A' | 'V'
  children?: ReactNode
}) {
  return (
    <section className="relative overflow-hidden pt-[clamp(9rem,20vh,14rem)] pb-[clamp(3rem,7vw,6rem)]">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1600 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {symbol === 'A' ? (
          <path d="M780 900 1180 40 1580 900" fill="none" stroke="#F6620D" strokeOpacity=".28" strokeWidth="1.5" />
        ) : (
          <path d="M800 -80 1180 760 1560 -80" fill="none" stroke="#F6620D" strokeOpacity=".28" strokeWidth="1.5" />
        )}
        <circle cx="1180" cy={symbol === 'A' ? 40 : 760} r="7" fill="#F6620D" />
      </svg>
      <div className="wrap relative">
        <Eyebrow className="mb-7 text-white/70">{eyebrow}</Eyebrow>
        <Lines
          as="h1"
          className="t-display"
          lines={title.map((l, i) => (i === title.length - 1 ? dot(l) : <span className="thin">{l}</span>))}
        />
        {lead && (
          <p className="t-lead mt-8 max-w-[46ch] text-white/85" data-reveal="up" data-delay="0.2">
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}
