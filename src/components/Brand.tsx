import type { CSSProperties, ReactNode } from 'react'
import { scrollToHash } from '../lib/scroll'

/** The crossbar-less A from the logo, sized to sit on the baseline at cap height. */
export function GlyphA({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 76 70"
      aria-hidden="true"
      className={`inline-block h-[0.7em] w-auto align-baseline ${className}`}
      fill="currentColor"
    >
      <path d="M0 70 30 0h16l30 70H60L38 17 16 70Z" />
    </svg>
  )
}

/** CREATIVE MIND wordmark with the A and V picked out in orange. Always set in Latin. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`latin inline-block font-semibold uppercase tracking-[0.04em] whitespace-nowrap ${className}`}>
      <span className="sr-only">Creative Mind</span>
      <span aria-hidden="true">
        CRE
        <GlyphA className="text-signal mx-[0.035em]" />
        TI<span className="text-signal">V</span>E MIND
      </span>
    </span>
  )
}

/** AV monogram. */
export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 92" aria-hidden="true" className={className}>
      <path fill="#F6620D" d="M4 88 34 8h16l30 80H64L42 30 20 88Z" />
      <path fill="#F6620D" d="M72 8h16l21 56 21-56h16l-30 80h-14Z" />
      <circle cx="42" cy="74" r="9" fill="#fff" />
      <circle cx="109" cy="22" r="9" fill="#fff" />
    </svg>
  )
}

export function Sphere({ size = 16, className = '', style }: { size?: number; className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`sphere block shrink-0 ${className}`} style={{ width: size, height: size, ...style }} />
}

export function Arrow({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" className={`arrow h-3 w-3 ${className}`} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M2 12 12 2M4.5 2H12v7.5" />
    </svg>
  )
}

const SECTION_FOR_PATH: Record<string, string> = {
  '/': '#top',
  '/contact': '#contact',
  '/work': '#selected-work',
  '/services': '#services',
  '/about': '#about',
  '/insights': '#insights',
}

export function Cta({
  to,
  href,
  variant = 'signal',
  children,
  className = '',
  onClick,
}: {
  to?: string
  href?: string
  variant?: 'signal' | 'ghost'
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  const cls = `btn btn-${variant} ${className}`
  const inner = (
    <>
      <span>{children}</span>
      <Arrow />
    </>
  )
  if (href)
    return (
      <a href={href} className={cls} target="_blank" rel="noreferrer" onClick={onClick}>
        {inner}
      </a>
    )
  // The site is a single page: every button scrolls to a section.
  // Old page paths are still accepted and mapped to their section.
  const target = to ? (SECTION_FOR_PATH[to] ?? to) : '#contact'
  return (
    <a
      href={target}
      className={cls}
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
        // If the caller closes a menu first, give the page a moment to unlock scrolling.
        window.setTimeout(() => scrollToHash(target), onClick ? 80 : 0)
      }}
    >
      {inner}
    </a>
  )
}

/** Heading whose lines rise out of a mask when scrolled into view. */
export function Lines({
  lines,
  as: Tag = 'h2',
  className = '',
  reveal = true,
}: {
  lines: ReactNode[]
  as?: 'h1' | 'h2' | 'h3' | 'p'
  className?: string
  reveal?: boolean
}) {
  return (
    <Tag className={className} data-reveal={reveal ? 'lines' : undefined}>
      {lines.map((l, i) => (
        <span className="line-mask" key={i}>
          <span className="line-inner">{l}</span>
        </span>
      ))}
    </Tag>
  )
}

/** Two-weight display heading: first line light, last line bold with an orange full stop. */
export function dot(text: string): ReactNode {
  const m = text.match(/^(.*?)([.؟?!])$/)
  if (!m) return text
  return (
    <>
      {m[1]}
      <span className="text-signal">{m[2]}</span>
    </>
  )
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`eyebrow flex items-center gap-3 ${className}`} data-reveal="up">
      <span className="sphere-flat block h-1.5 w-1.5" aria-hidden="true" />
      {children}
    </p>
  )
}
