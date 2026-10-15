import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'
import type { L } from '../lib/i18n'

/*
  CLIENT LOGOS

  A slim strip between the hero and "What we believe": the logos of the brands
  we have worked with, gliding from right to left (also on phones, also in Arabic).

  Logos are images only, in public/images/logos/ as .svg, .png or .webp (any of
  the three is picked up automatically). Current files were cut from the client
  logo sheet (white on transparent); replace any of them with a sharper original
  under the same name:

    saudi-aramco   sensodyne   panasonic   colgate   abbott

  To add a brand, add an entry below and drop its file in the folder. A logo that
  must keep its own colours gets `color: true` (the rest are washed white). A logo
  that needs more room gets `wide: true`. A brand whose file is missing is simply
  skipped, and the whole strip stays hidden until at least one logo has loaded.
*/
type Client = { name: L; file: string; color?: boolean; wide?: boolean }

const CLIENTS: Client[] = [
  { name: { en: 'Saudi Aramco', ar: 'أرامكو السعودية' }, file: 'saudi-aramco' },
  { name: { en: 'Sensodyne', ar: 'سنسوداين' }, file: 'sensodyne' },
  { name: { en: 'Panasonic', ar: 'باناسونيك' }, file: 'panasonic' },
  { name: { en: 'Colgate', ar: 'كولجيت' }, file: 'colgate' },
  { name: { en: 'Abbott', ar: 'أبوت' }, file: 'abbott' },
]

const LOGO_DIR = '/images/logos/'
const FORMATS = ['svg', 'png', 'webp'] // tried in this order
const LOGO_HEIGHT = 34 // px on desktop; phones scale down in the stylesheet

export function Clients() {
  const { tr } = useLang()
  const root = useRef<HTMLElement>(null)
  // The URL of each logo that actually exists (svg, png or webp), found by probing once.
  const [found, setFound] = useState<Record<string, string>>({})

  useEffect(() => {
    let alive = true
    CLIENTS.forEach((client) => {
      const tryFormat = (i: number) => {
        if (!alive || i >= FORMATS.length) return
        const src = `${LOGO_DIR}${client.file}.${FORMATS[i]}`
        const image = new Image()
        image.decoding = 'async'
        image.onload = () => alive && setFound((f) => ({ ...f, [client.file]: src }))
        image.onerror = () => tryFormat(i + 1)
        image.src = src
      }
      tryFormat(0)
    })
    return () => {
      alive = false
    }
  }, [])

  // The strip only moves while it is on screen.
  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-off', !entry.isIntersecting)
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const logos = CLIENTS.filter((client) => found[client.file])

  // The row is repeated until it covers the screen twice over, and the track slides by exactly
  // one row per cycle, so the strip is always full of logos and the loop has no visible seam.
  const marquee = useRef<HTMLDivElement>(null)
  const firstRow = useRef<HTMLUListElement>(null)
  const [geometry, setGeometry] = useState({ row: 0, copies: 2 })
  useLayoutEffect(() => {
    const box = marquee.current
    const row = firstRow.current
    if (!box || !row) return
    const measure = () => {
      const width = row.getBoundingClientRect().width
      if (!width) return
      const copies = Math.max(2, Math.ceil(box.clientWidth / width) + 1)
      setGeometry((g) => (g.row === width && g.copies === copies ? g : { row: width, copies }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(row)
    return () => ro.disconnect()
  }, [logos.length])

  if (logos.length === 0) return null

  const row = (index: number) => (
    <ul
      key={index}
      ref={index === 0 ? firstRow : undefined}
      className="clients-row"
      aria-hidden={index > 0 || undefined}
    >
      {logos.map((client) => (
        <li
          key={client.file}
          className={`clients-item${client.wide ? ' is-wide' : ''}${client.color ? ' is-color' : ''}`}
        >
          <img
            src={found[client.file]}
            alt={index > 0 ? '' : tr(client.name)}
            height={LOGO_HEIGHT}
            decoding="async"
            draggable={false}
            className="clients-logo"
          />
        </li>
      ))}
    </ul>
  )

  return (
    <section
      ref={root}
      className="clients"
      aria-label={tr({ en: 'Brands we have worked with', ar: 'علامات عملنا معها' })}
    >
     

      {/* Always left-to-right so the strip glides leftwards in both languages. */}
      <div className="clients-marquee" dir="ltr" ref={marquee}>
        <div
          className="clients-track"
          style={{
            // one row per cycle at a steady ~55 px/s, whatever the number of logos
            animationDuration: `${Math.max(10, geometry.row / 55)}s`,
            ['--row' as string]: `${geometry.row}px`,
          }}
        >
          {Array.from({ length: geometry.copies }, (_, i) => row(i))}
        </div>
      </div>

      <style>{`
        .clients {
          position: relative;
          padding-block: clamp(2rem, 4vw, 3.25rem);
          background: var(--color-navy);
          border-block: 1px solid rgb(255 255 255 / 0.08);
          overflow: hidden;
        }
        .clients-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 clamp(1.1rem, 2.2vw, 1.75rem);
          color: rgb(255 255 255 / 0.55);
        }
        .clients-marquee {
          position: relative;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 9%, #000 91%, transparent);
        }
        .clients-track {
          display: flex;
          width: max-content;
          will-change: transform;
          animation: clientsGlide 46s linear infinite;
        }
        .clients-marquee:hover .clients-track,
        .clients[data-off] .clients-track {
          animation-play-state: paused;
        }
        .clients-row {
          display: flex;
          align-items: center;
          gap: clamp(2.75rem, 5.5vw, 5.5rem);
          padding-inline-end: clamp(2.75rem, 5.5vw, 5.5rem);
          margin: 0;
          list-style: none;
        }
        .clients-item {
          flex: none;
          display: flex;
          align-items: center;
          height: ${LOGO_HEIGHT + 12}px;
          opacity: 0.78;
          transition: opacity 0.4s var(--ease-cine);
        }
        .clients-item:hover {
          opacity: 1;
        }
        .clients-logo {
          display: block;
          height: ${LOGO_HEIGHT}px;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          /* logos arrive in their own colours; a white wash keeps the strip calm on the navy */
          filter: brightness(0) invert(1);
        }
        .is-color .clients-logo {
          filter: none;
        }
        .is-wide .clients-logo {
          max-width: 240px;
        }

        @keyframes clientsGlide {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(calc(-1 * var(--row, 50%)), 0, 0); }
        }

        @media (max-width: 767px) {
          .clients-item { height: ${LOGO_HEIGHT + 4}px; }
          .clients-logo { height: ${LOGO_HEIGHT - 8}px; max-width: 130px; }
          .is-wide .clients-logo { max-width: 170px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .clients-track { animation: none; }
          .clients-marquee { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
          .clients-row[aria-hidden] { display: none; }
        }
      `}</style>
    </section>
  )
}
