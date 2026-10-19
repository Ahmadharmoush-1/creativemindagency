import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useLang } from '../lib/i18n'
import {
  gsap,
  useGsap,
  useMedia,
} from '../lib/gsap'
import { useNear } from '../lib/near'
import { num, services } from '../content/services'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'
import { ServiceVisual, buildVisual } from '../visuals/ServiceVisual'
/*
  VIDEO PATHS
  Your files on Windows:
  C:\Users\GamingCorner\Desktop\code\creative-mind-site\public\videos\services-desktop.mp4
  C:\Users\GamingCorner\Desktop\code\creative-mind-site\public\videos\services-mobile.mp4
  Files under /public are served from the website root, so do NOT
  put C:\... or /public in the browser URL.
*/
const DESKTOP_VIDEO = '/videos/services-desktop.mp4'
// Mirrored version used when the site language is Arabic.
const DESKTOP_VIDEO_AR = '/videos/services-desktop-arabic.mp4'
const MOBILE_VIDEO = '/videos/services-mobile.mp4'
// Reuse the previous image backgrounds as loading posters when available.
// You can remove the poster prop below if those images do not exist.
const DESKTOP_POSTER = '/images/services-background-1672.webp'
// 0 = no shade, 1 = black. The original background shade is preserved.
const BACKGROUND_OVERLAY = 0.48
/**
 * Exactly one <video> is mounted. Its source changes at 1024px, so
 * phones/tablets get the portrait file and desktops get the selected language's landscape file.
 * The video pauses outside the viewport and respects reduced motion.
 */
function ServicesBackgroundVideo() {
  const { lang } = useLang()
  const isMobile = useMedia('(max-width: 1023px)')
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)')
  // Keep the existing mobile video; switch the desktop clip for Arabic.
  const videoSrc = isMobile ? MOBILE_VIDEO : (lang === 'ar' ? DESKTOP_VIDEO_AR : DESKTOP_VIDEO)
  const videoRef = useRef<HTMLVideoElement>(null)
  // The film is attached only when the section is about a screen and a half away, so it never
  // competes with the hero on first load (it used to download in full at page load).
  const near = useNear(videoRef)
  useEffect(() => {
    const video = videoRef.current
    if (!video || !near) return
    video.muted = true
    if (reduceMotion) {
      video.pause()
      return
    }
    const play = () => {
      // Autoplay is usually permitted because the background is muted.
      void video.play().catch(() => {})
    }
    if (typeof IntersectionObserver === 'undefined') {
      play()
      return () => video.pause()
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) play()
        else video.pause()
      },
      { threshold: 0.01 },
    )
    observer.observe(video)
    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [videoSrc, reduceMotion, near])
  return (
    <video
      key={videoSrc}
      ref={videoRef}
      src={near ? videoSrc : undefined}
      poster={DESKTOP_POSTER}
      muted
      loop
      playsInline
      preload={!near ? 'none' : reduceMotion ? 'metadata' : 'auto'}
      disablePictureInPicture
      aria-hidden="true"
      className="services-background-video pointer-events-none absolute inset-0 block h-full w-full object-cover"
    />
  )
}
/**
 * Plain background for quiet, static layouts.
 */
function ServicesBackgroundPoster() {
  return <div className="absolute inset-0 bg-[#051746]" aria-hidden="true" />
}
/** Background shared by sticky, mobile and stacked service layouts. */
function ServicesBackground({
  pinned = false,
  still = false,
}: {
  pinned?: boolean
  still?: boolean
}) {
  const background = (
    <>
      {still ? <ServicesBackgroundPoster /> : <ServicesBackgroundVideo />}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: BACKGROUND_OVERLAY }}
      />
      {/* Phones: shade the top and bottom so the text stays legible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030e2e]/75 via-[#030e2e]/10 to-[#030e2e]/90 lg:hidden" />
    </>
  )
  // For stacked rows, draw ONE sticky background across the whole section: it holds still
  // in the viewport while the rows scroll over it, and stays inside the section's box.
  if (pinned) {
    return (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[#09111d]"
      >
        <div className="services-pinned-stage sticky top-0 overflow-hidden">
          {background}
        </div>
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#09111d]"
    >
      {background}
    </div>
  )
}
/* All Services CSS remains co-located in this file. */
function ServicesStyles() {
  return (
    <style>{`
      .services-hover-stage > .wrap { min-height: 740px; padding-block: 4rem; }
      .services-background-video {
        object-fit: cover;
        object-position: center center;
      }
      /* Full-screen background even when the mobile address bar moves. */
      .services-pinned-stage {
        height: 100vh;
        height: 100lvh;
      }
      .services-pinned-stage > .wrap {
        height: 100vh;
        height: 100svh;
      }
      .services-pinned-visual {
        width: min(100%, 58vh, 620px);
      }
      .services-pinned-caption {
        max-width: min(58vh, 620px);
      }
      @supports (height: 100svh) {
        .services-pinned-visual {
          width: min(100%, 58svh, 620px);
        }
        .services-pinned-caption {
          max-width: min(58svh, 620px);
        }
      }
      /* Shapes stay solid; the surrounding light reacts once per selection. */
      .services-solid-visual *, .svc-row .sv * {
        animation: none !important;
      }
      .services-choice { position: relative; }
      .services-choice::before {
        content: ''; position: absolute; inset: 4px 0;
        pointer-events: none; border-radius: 8px;
        background: linear-gradient(90deg, rgba(246,98,13,.16), transparent 85%);
        opacity: 0; transition: opacity .2s ease;
      }
      [dir="rtl"] .services-choice::before {
        background: linear-gradient(270deg, rgba(246,98,13,.16), transparent 85%);
      }
      .services-choice[aria-current="true"]::before { opacity: 1; }
      .services-choice-title { position: relative; }
      .services-choice[aria-current="true"] .services-choice-title {
        color: #fff;
        text-shadow: 0 0 14px rgba(255,255,255,.45), 0 0 28px rgba(246,98,13,.55);
      }
      .services-choice-title::after {
        content: ''; position: absolute; inset-inline-start: 0; bottom: -4px;
        width: 0; height: 2px; border-radius: 2px;
        background: #f6620d; box-shadow: 0 0 12px rgba(246,98,13,.65);
        transition: width .2s ease;
      }
      .services-choice[aria-current="true"] .services-choice-title::after { width: 36px; }
      .services-change-halo {
        position: absolute; inset: 9%; pointer-events: none; border-radius: 50%;
        background: radial-gradient(circle, rgba(246,98,13,.18), transparent 68%);
        animation: services-halo .25s ease-out both;
      }
      @keyframes services-halo {
        from { opacity: 0; transform: scale(.88); }
        40% { opacity: 1; }
        to { opacity: .25; transform: scale(1); }
      }
      @media (prefers-reduced-motion: reduce) {
        .services-surface *,
        .services-surface *::before,
        .services-surface *::after {
          transition: none !important;
          animation: none !important;
        }
      }
    `}</style>
  )
}
/*
  Desktop: assembled visuals with transitions only when the service changes.
*/
function useServiceSelection(root: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0)
  useGsap(root, () => {
    const el = root.current
    if (!el) return
    el.style.setProperty('--svc-p', '1')
    const timelines = services.map((service) => {
      const visual = el.querySelector<HTMLElement>(`.sv-${service.id}`)
      return visual ? buildVisual(service.id, visual).pause().progress(1) : null
    })
    return () => timelines.forEach((timeline) => timeline?.kill())
  }, [])
  return { active, select: setActive }
}

/*
  Desktop: direct hover selection, service list,
  and fully assembled shapes with a brief crossfade.
*/
function ServicesPinned() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const { active, select } = useServiceSelection(root)
  return (
    <section
      ref={root}
      className="services-surface relative"
      aria-labelledby="services-title"
    >
      <ServicesStyles />
      <div className="services-hover-stage relative isolate overflow-hidden">
        <ServicesBackground />
        <div className="wrap relative z-10 grid h-full grid-cols-[0.95fr_1.05fr] items-center gap-8 py-6 xl:gap-12">
          <div className="min-w-0">
            <Eyebrow className="mb-5 !text-[1rem] !font-bold !text-white">
              {tr(ui.services.eyebrow)}
            </Eyebrow>
            <h2 id="services-title" className="t-title uppercase !text-[clamp(2rem,3.9vw,4rem)] !font-bold">
              <span className="font-bold">
                {ui.services.title[lang][0]}
              </span>{' '}
              {ui.services.title[lang][1]}
              <span className="text-signal">.</span>
            </h2>
            <p className="mt-4 max-w-[42ch] text-[1.125rem] font-semibold leading-relaxed text-white">
              {tr(ui.services.intro)}
            </p>
            <div className="relative mt-8">
              <span
                aria-hidden="true"
                className="sphere pointer-events-none absolute -start-[5px] top-0 block h-2.5 w-2.5 transition-transform duration-200 ease-cine"
                style={
                  {
                    transform: `translateY(calc(${active} * var(--row) + var(--row) / 2 - 5px))`,
                    '--row': 'clamp(2.5rem, 5.6vh, 3.4rem)',
                  } as CSSProperties
                }
              />
              <ol className="border-s border-white/20">
                {services.map((service, index) => (
                  <li
                    key={service.id}
                    style={{
                      height: 'clamp(2.5rem, 5.6vh, 3.4rem)',
                    }}
                  >
                    <button
                      type="button"
                      onPointerEnter={(event) => { if (event.pointerType === 'mouse') select(index) }}
                      onFocus={() => select(index)}
                      onClick={() => select(index)}
                      aria-current={
                        index === active ? 'true' : undefined
                      }
                      className={`services-choice group flex h-full w-full items-center gap-4 rounded-sm ps-7 text-start transition-all duration-200 ease-cine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${
                        index === active
                          ? 'text-white'
                          : 'text-white/85 hover:text-white'
                      }`}
                    >
                      <span
                        className={`latin shrink-0 text-[0.875rem] font-bold tabular-nums ${
                          index === active ? 'text-signal' : ''
                        }`}
                      >
                        {num(index)}
                      </span>
                      <span
                        className={`services-choice-title font-bold uppercase transition-all duration-200 ease-cine rtl:tracking-normal ${
                          index === active
                            ? 'text-[clamp(1.3rem,2.1vw,2rem)] tracking-tight'
                            : 'text-lg tracking-wide'
                        }`}
                      >
                        {tr(service.title)}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="relative min-w-0">
            <span
              aria-hidden="true"
              className="latin absolute -top-6 end-0 text-[clamp(6rem,13vw,13rem)] font-bold leading-none text-white/[0.07] tabular-nums"
            >
              {num(active)}
            </span>
            <div className="services-pinned-visual relative mx-auto aspect-square">
              <span key={`halo-${active}`} className="services-change-halo" aria-hidden="true" />
              {services.map((service, index) => (
                <div
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`services-solid-visual absolute inset-0 transition-opacity duration-200 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : 'pointer-events-none opacity-0'
                  }`}
                >
                  <ServiceVisual
                    id={service.id}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ))}
            </div>
            <div
              className="services-pinned-caption relative mx-auto mt-4 min-h-[8rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {services.map((service, index) => (
                <p
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`t-lead absolute inset-x-0 top-0 !text-[1.25rem] !font-semibold !leading-[1.65] text-white xl:!text-[1.375rem] transition-all duration-200 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : 'translate-y-3 opacity-0'
                  }`}
                >
                  {tr(service.line)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
/*
  Stacked rows: phones and tablets, the full Services page, and the desktop
  fallback for reduced motion or very short windows.
  The rows share ONE background that stays pinned to the screen while
  they scroll over it. Pass background={false} when the parent already
  provides one. Every shape is finished; `assembled` also selects the still
  wallpaper for standalone rows on phones and tablets.
*/
function ServiceIcon({ index }: { index: number }) {
  const paths = [
    'M12 3 21 8v8l-9 5-9-5V8l9-5Z M3 8l9 5 9-5 M12 13v8',
    'M4 10h4l11-5v14l-11-5H4v-4Z M8 14l2 6h3l-2-5',
    'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    'M3 4h18l-7 8v7l-4 2v-9L3 4Z',
    'M13 2 4 14h7l-1 8 10-13h-8l1-7Z',
    'M3 5h18v14H3z M3 9h18 M7 7h.01 M10 7h.01 M9 12l-2 2 2 2 M15 12l2 2-2 2',
    'M4 20V4 M4 20h16 M7 15l5-5 3 3 6-8 M16 5h5v5',
  ]
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
      <path d={paths[index % paths.length]} />
    </svg>
  )
}

export function ServiceRows({
  full = false,
  background = true,
  assembled = false,
}: {
  full?: boolean
  background?: boolean
  assembled?: boolean
}) {
  const { tr } = useLang()
  const desktop = useMedia('(min-width: 1024px)')
  const root = useRef<HTMLDivElement>(null)
  useGsap(
    root,
    () => {
      const el = root.current
      if (!el || !desktop) return
      const timelines: ReturnType<typeof buildVisual>[] = []
      const rows = gsap.utils.toArray<HTMLElement>('.svc-row', el)
      rows.forEach((row, index) => {
        const service = services[index]
        const visual = row.querySelector<HTMLElement>('.sv')
        if (!service || !visual) return
        timelines.push(buildVisual(service.id, visual).pause().progress(1))
      })
      return () => {
        timelines.forEach((timeline) => timeline.kill())
      }
    },
    [assembled, desktop],
  )
  if (!desktop) {
    return (
      <div className={`services-surface relative ${background ? 'bg-[#051746]' : ''}`}>
        <div className="wrap">
          <ul className="m-0 list-none divide-y divide-white/15 p-0">
            {services.map((service, index) => (
              <li key={service.id} id={service.id} className="flex scroll-mt-24 items-start gap-4 py-5">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-[#f6620d]/25 bg-[#f6620d]/10 text-[#f6620d]">
                  <ServiceIcon index={index} />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold leading-snug text-white rtl:leading-relaxed">{tr(service.title)}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/75">{tr(service.line)}</p>
                  {full && <>
                    <p className="mt-3 text-sm leading-relaxed text-white/75">{tr(service.detail)}</p>
                    <h4 className="mt-4 text-xs font-bold text-white">{tr(ui.services.includes)}</h4>
                    <ul className="mt-2 list-disc space-y-1 ps-4 text-xs leading-relaxed text-white/75">
                      {service.includes.map((item) => <li key={item.en}>{tr(item)}</li>)}
                    </ul>
                  </>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }
  return (
    <div ref={root} className="services-surface relative isolate">
      <ServicesStyles />
      {background && <ServicesBackground pinned still={assembled} />}
      {services.map((service, index) => (
        <article
          key={service.id}
          id={service.id}
          className="svc-row group relative z-10 scroll-mt-24 border-t border-white/15"
        >
          <div
            className={`wrap relative z-10 grid min-w-0 items-center gap-6 py-10 sm:gap-8 sm:py-14 lg:grid-cols-2 lg:gap-16 ${
              full ? 'lg:py-24' : 'lg:py-14'
            }`}
          >
            <div
              className={`min-w-0 ${
                full && index % 2 === 1 ? 'lg:order-2' : ''
              }`}
            >
              <p className="latin text-base font-bold text-signal tabular-nums">
                {num(index)}
              </p>
              <h3 className="t-display mt-3 !text-[clamp(1.75rem,4.4vw,4rem)] !font-bold">
                {tr(service.title)}
              </h3>
              <p className="t-lead mt-4 max-w-[30ch] !text-[1.125rem] !font-bold !leading-[1.65] text-white sm:!text-[1.25rem] lg:!text-[1.375rem]">
                {tr(service.line)}
              </p>
              {full && (
                <>
                  <p className="mt-5 max-w-[52ch] text-[1.0625rem] font-semibold leading-relaxed text-white/95 lg:text-lg rtl:leading-loose">
                    {tr(service.detail)}
                  </p>
                  <h4 className="eyebrow mb-3 mt-8 !text-[0.95rem] !font-bold text-white">
                    {tr(ui.services.includes)}
                  </h4>
                  <ul className="flex max-w-[34rem] flex-wrap gap-2">
                    {service.includes.map((item) => (
                      <li
                        key={item.en}
                        className="rounded-full border border-white/20 bg-black/20 px-5 py-2.5 text-base font-semibold text-white"
                      >
                        {tr(item)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className="relative mx-auto aspect-square w-full min-w-0 max-w-[340px] sm:max-w-[460px] lg:max-w-[520px]">
              <ServiceVisual
                id={service.id}
                className="relative h-full w-full"
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
export function Services() {
  const { tr, lang } = useLang()
  const desktop = useMedia('(min-width: 1024px)')
  if (desktop) return <ServicesPinned key="desktop-hover" />
  const mobile = !desktop
  return (
    <section
      key={mobile ? 'mobile-list' : 'stacked'}
      className="services-surface relative isolate bg-[#051746] pb-8"
      aria-labelledby="services-title-m"
    >
      <ServicesStyles />
      <div className="wrap relative z-10 pb-5 pt-10">
        <Eyebrow className="mb-4 !text-[0.75rem] !font-bold !text-white lg:!text-[1rem]">
          {tr(ui.services.eyebrow)}
        </Eyebrow>
        <h2 id="services-title-m" className="sr-only">
          {ui.services.title[lang].join(' ')}
        </h2>
        <Lines
          as="p"
          className="t-display !text-[clamp(1.75rem,5.5vw,2.75rem)] !font-bold lg:!text-[clamp(2rem,3.9vw,4rem)]"
          lines={[
            <span key="first" className="!font-bold">
              {ui.services.title[lang][0]}
            </span>,
            dot(ui.services.title[lang][1] + '.'),
          ]}
        />
        <p className="t-lead mt-4 max-w-[36ch] !text-[0.875rem] !font-semibold !leading-[1.65] text-white sm:!text-[1.25rem] lg:!text-[1.375rem]">
          {tr(ui.services.intro)}
        </p>
      </div>
      <ServiceRows background={false} assembled={mobile} />
    </section>
  )
}
