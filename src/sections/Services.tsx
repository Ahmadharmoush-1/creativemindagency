import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import { useLang } from '../lib/i18n'
import {
  ScrollTrigger,
  clamp01,
  getLenis,
  gsap,
  prefersReduced,
  useFixedPin,
  useGsap,
  useMedia,
} from '../lib/gsap'
import { num, services } from '../content/services'
import { ui } from '../content/ui'
import { Eyebrow, Lines, dot } from '../components/Brand'
import { ServiceVisual, buildVisual } from '../visuals/ServiceVisual'

const N = services.length

/*
  VIDEO PATHS
  Your files on Windows:
  C:\Users\GamingCorner\Desktop\code\creative-mind-site\public\videos\services-desktop.mp4
  C:\Users\GamingCorner\Desktop\code\creative-mind-site\public\videos\services-mobile.mp4

  Files under /public are served from the website root, so do NOT
  put C:\... or /public in the browser URL.
*/
const DESKTOP_VIDEO = '/videos/services-desktop.mp4'
const MOBILE_VIDEO = '/videos/services-mobile.mp4'

// Reuse the previous image backgrounds as loading posters when available.
// You can remove the poster prop below if those images do not exist.
const DESKTOP_POSTER = '/images/services-background-1672.webp'
const MOBILE_POSTER = '/images/services-background-mobile.webp'

// 0 = no shade, 1 = black. The original background shade is preserved.
const BACKGROUND_OVERLAY = 0.48

/**
 * Exactly one <video> is mounted. Its source changes at 1024px, so
 * phones/tablets get the portrait file and desktops get the landscape file.
 * The video pauses outside the viewport and respects reduced motion.
 */
function ServicesBackgroundVideo() {
  const isMobile = useMedia('(max-width: 1023px)')
  const reduceMotion = useMedia('(prefers-reduced-motion: reduce)')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

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
  }, [isMobile, reduceMotion])

  return (
    <video
      key={isMobile ? 'services-mobile' : 'services-desktop'}
      ref={videoRef}
      src={isMobile ? MOBILE_VIDEO : DESKTOP_VIDEO}
      poster={isMobile ? MOBILE_POSTER : DESKTOP_POSTER}
      autoPlay={!reduceMotion}
      muted
      loop
      playsInline
      preload="metadata"
      disablePictureInPicture
      aria-hidden="true"
      className="services-background-video pointer-events-none absolute inset-0 block h-full w-full object-cover"
    />
  )
}

/** Background shared by sticky, mobile and stacked service layouts. */
function ServicesBackground({ pinned = false }: { pinned?: boolean }) {
  const background = (
    <>
      <ServicesBackgroundVideo />

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: BACKGROUND_OVERLAY }}
      />

      {/* Phones: shade the top and bottom so the text stays legible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030e2e]/75 via-[#030e2e]/10 to-[#030e2e]/90 lg:hidden" />
    </>
  )

  // For stacked rows, draw ONE sticky background across the whole section.
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

      .services-mobile-visual {
        width: min(74vw, 100%, 38vh, 460px);
      }

      @supports (height: 100svh) {
        .services-pinned-visual {
          width: min(100%, 58svh, 620px);
        }

        .services-pinned-caption {
          max-width: min(58svh, 620px);
        }

        .services-mobile-visual {
          width: min(74vw, 100%, 38svh, 460px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .services-surface *,
        .services-surface *::before,
        .services-surface *::after {
          transition: none !important;
        }
      }
    `}</style>
  )
}

/*
  Shared by the desktop and phone layouts: the section is a tall track with a
  sticky stage. Scroll position picks the active service and drives its
  assembly animation. `--svc-p` (0 to 1) is how far through the active
  service the reader is; the phone progress bar reads it.
*/

function usePinnedServices(root: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(0)
  useGsap(
    root,
    () => {
      const el = root.current
      if (!el) return
      const timelines = services.map((service) => {
        const visual = el.querySelector<HTMLElement>(
          `.sv-${service.id}`,
        )
        return visual
          ? buildVisual(service.id, visual).pause()
          : null
      })
      let current = -1
      const update = (progress: number) => {
        const position = progress * N
        const index = Math.min(N - 1, Math.floor(position))
        const timeline = timelines[index]
        el.style.setProperty(
          '--svc-p',
          clamp01(position - index).toFixed(3),
        )
        if (index !== current) {
          timelines.forEach((otherTimeline, otherIndex) => {
            if (!otherTimeline || otherIndex === index) return
            gsap.killTweensOf(otherTimeline)
            otherTimeline.progress(otherIndex < index ? 1 : 0)
          })
          current = index
          setActive(index)
        }
        if (timeline) {
          gsap.to(timeline, {
            progress: clamp01((position - index) / 0.72),
            duration: 0.5,
            ease: 'power2.out',
            overwrite: true,
          })
        }
      }
      const trigger = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      })
      update(trigger.progress)
      return () => {
        trigger.kill()
        timelines.forEach((timeline) => {
          if (!timeline) return
          gsap.killTweensOf(timeline)
          timeline.kill()
        })
      }
    },
    [],
  )
  const go = (index: number) => {
    const el = root.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    const distance = Math.max(
      0,
      el.offsetHeight - window.innerHeight,
    )
    const y = top + ((index + 0.6) / N) * distance
    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(y, { duration: 1.1 })
    } else {
      window.scrollTo({
        top: y,
        behavior: prefersReduced() ? 'auto' : 'smooth',
      })
    }
  }
  return { active, go }
}

/*
  Phones and tablets: one full-screen stage with ONE background.
  The reader scrolls and the services change in place: counter, visual,
  title and line, with a seven-part progress bar that can also be tapped.
*/

function ServicesPinnedMobile() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const { active, go } = usePinnedServices(root)
  useFixedPin(root, '.services-pinned-stage')
  return (
    <section
      ref={root}
      className="services-surface relative"
      style={{ height: `${N * 52 + 100}svh` }}
      aria-labelledby="services-title"
    >
      <ServicesStyles />
      <div className="services-pinned-stage sticky top-0 isolate overflow-hidden">
        <ServicesBackground />
        <div className="wrap relative z-10 flex h-full flex-col pt-[5.5rem] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow mb-3 flex items-center gap-3 text-white/75">
                <span
                  aria-hidden="true"
                  className="sphere-flat block h-1.5 w-1.5"
                />
                {tr(ui.services.eyebrow)}
              </p>
              <h2
                id="services-title"
                className="text-[clamp(1.5rem,6.6vw,2.4rem)] font-semibold uppercase leading-none tracking-tight rtl:leading-snug rtl:tracking-normal"
              >
                <span className="font-light">
                  {ui.services.title[lang][0]}
                </span>{' '}
                {ui.services.title[lang][1]}
                <span className="text-signal">.</span>
              </h2>
            </div>
            <p
              className="latin shrink-0 text-sm text-white/60 tabular-nums"
              aria-hidden="true"
            >
              <span className="text-[1.9rem] font-semibold leading-none text-signal">
                {num(active)}
              </span>
              <span className="mx-1.5">/</span>
              {num(N - 1)}
            </p>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            <div className="services-mobile-visual relative aspect-square">
              <span
                aria-hidden="true"
                className="absolute -inset-[12%] rounded-full bg-[radial-gradient(circle,rgba(3,14,46,0.72)_0%,rgba(3,14,46,0.45)_45%,transparent_70%)]"
              />
              {services.map((service, index) => (
                <div
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : index < active
                        ? 'pointer-events-none -translate-y-6 scale-90 opacity-0'
                        : 'pointer-events-none translate-y-6 scale-90 opacity-0'
                  }`}
                >
                  <ServiceVisual
                    id={service.id}
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ))}
            </div>
          </div>
          <div
            className="relative min-h-[9.25rem] sm:min-h-[10.5rem]"
            aria-live="polite"
            aria-atomic="true"
          >
            {services.map((service, index) => (
              <div
                key={service.id}
                aria-hidden={index !== active}
                className={`absolute inset-x-0 top-0 transition-all duration-700 ease-cine ${
                  index === active
                    ? 'opacity-100'
                    : index < active
                      ? '-translate-y-4 opacity-0'
                      : 'translate-y-4 opacity-0'
                }`}
              >
                <h3 className="text-[clamp(1.7rem,8.4vw,3rem)] font-bold uppercase leading-none tracking-tight rtl:leading-snug rtl:tracking-normal">
                  {tr(service.title)}
                </h3>
                <p className="mt-3 max-w-[34ch] text-[1.02rem] leading-snug text-white/85 sm:text-lg rtl:leading-relaxed">
                  {tr(service.line)}
                </p>
              </div>
            ))}
          </div>
          <ol className="mt-3 flex gap-1.5" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            {services.map((service, index) => (
              <li key={service.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(index)}
                  aria-label={`${num(index)} — ${tr(service.title)}`}
                  aria-current={index === active ? 'true' : undefined}
                  className="block w-full py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  <span className="relative block h-[3px] overflow-hidden rounded-full bg-white/25">
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-signal rtl:origin-right"
                      style={{
                        transform:
                          index < active
                            ? 'scaleX(1)'
                            : index === active
                              ? 'scaleX(var(--svc-p, 0))'
                              : 'scaleX(0)',
                      }}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

/*
  Desktop: sticky background, service list,
  and existing scroll-controlled assembly animations.
*/

function ServicesPinned() {
  const { tr, lang } = useLang()
  const root = useRef<HTMLElement>(null)
  const { active, go } = usePinnedServices(root)
  return (
    <section
      ref={root}
      className="services-surface relative"
      style={{ height: `${N * 62 + 100}vh` }}
      aria-labelledby="services-title"
    >
      <ServicesStyles />
      <div className="services-pinned-stage sticky top-0 isolate overflow-hidden">
        <ServicesBackground />
        <div className="wrap relative z-10 grid h-full grid-cols-[0.95fr_1.05fr] items-center gap-8 py-6 xl:gap-12">
          <div className="min-w-0">
            <Eyebrow className="mb-5 text-white/70">
              {tr(ui.services.eyebrow)}
            </Eyebrow>
            <h2 id="services-title" className="t-title uppercase">
              <span className="font-light">
                {ui.services.title[lang][0]}
              </span>{' '}
              {ui.services.title[lang][1]}
              <span className="text-signal">.</span>
            </h2>
            <p className="mt-4 max-w-[42ch] text-[0.95rem] leading-relaxed text-white/75">
              {tr(ui.services.intro)}
            </p>
            <div className="relative mt-8">
              <span
                aria-hidden="true"
                className="sphere pointer-events-none absolute -start-[5px] top-0 block h-2.5 w-2.5 transition-transform duration-700 ease-cine"
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
                      onClick={() => go(index)}
                      aria-current={
                        index === active ? 'true' : undefined
                      }
                      className={`group flex h-full w-full items-center gap-4 rounded-sm ps-7 text-start transition-all duration-500 ease-cine focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal ${
                        index === active
                          ? 'text-white'
                          : 'text-white/55 hover:text-white/90'
                      }`}
                    >
                      <span
                        className={`latin shrink-0 text-[0.7rem] font-medium tabular-nums ${
                          index === active ? 'text-signal' : ''
                        }`}
                      >
                        {num(index)}
                      </span>
                      <span
                        className={`font-semibold uppercase transition-all duration-500 ease-cine rtl:tracking-normal ${
                          index === active
                            ? 'text-[clamp(1.3rem,2.1vw,2rem)] tracking-tight'
                            : 'text-base tracking-wide'
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
              {services.map((service, index) => (
                <div
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-cine ${
                    index === active
                      ? 'opacity-100'
                      : 'pointer-events-none scale-95 opacity-0'
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
              className="services-pinned-caption relative mx-auto mt-4 min-h-[6.5rem]"
              aria-live="polite"
              aria-atomic="true"
            >
              {services.map((service, index) => (
                <p
                  key={service.id}
                  aria-hidden={index !== active}
                  className={`t-lead absolute inset-x-0 top-0 text-white transition-all duration-700 ease-cine ${
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
  Stacked rows: the full Services page, and the fallback for reduced
  motion or very short windows.
  The rows share ONE background that stays pinned to the screen while
  they scroll over it. Pass background={false} when the parent already
  provides one.
*/

export function ServiceRows({
  full = false,
  background = true,
}: {
  full?: boolean
  background?: boolean
}) {
  const { tr } = useLang()
  const root = useRef<HTMLDivElement>(null)
  useGsap(
    root,
    () => {
      const el = root.current
      if (!el) return
      const still = prefersReduced()
      const phone = window.innerWidth < 1024
      const timelines: ReturnType<typeof buildVisual>[] = []
      const triggers: ScrollTrigger[] = []
      const rows = gsap.utils.toArray<HTMLElement>(
        '.svc-row',
        el,
      )
      rows.forEach((row, index) => {
        const service = services[index]
        const visual = row.querySelector<HTMLElement>('.sv')
        if (!service || !visual) return
        const timeline = buildVisual(service.id, visual).pause()
        timelines.push(timeline)
        if (still) {
          timeline.progress(1)
          return
        }
        triggers.push(
          ScrollTrigger.create({
            trigger: visual,
            start: phone ? 'top 96%' : 'top 88%',
            end: phone ? 'center 62%' : 'center 42%',
            scrub: 0.6,
            animation: timeline,
            invalidateOnRefresh: true,
          }),
        )
      })
      return () => {
        triggers.forEach((trigger) => trigger.kill())
        timelines.forEach((timeline) => timeline.kill())
      }
    },
    [],
  )
  return (
    <div ref={root} className="services-surface relative isolate">
      <ServicesStyles />
      {background && <ServicesBackground pinned />}
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
              <p className="latin text-sm font-medium text-signal tabular-nums">
                {num(index)}
              </p>
              <h3 className="t-display mt-3 !text-[clamp(2rem,5vw,4.6rem)]">
                {tr(service.title)}
              </h3>
              <p className="t-lead mt-4 max-w-[30ch] text-white">
                {tr(service.line)}
              </p>
              {full && (
                <>
                  <p className="mt-5 max-w-[52ch] leading-relaxed text-white/75 rtl:leading-loose">
                    {tr(service.detail)}
                  </p>
                  <h4 className="eyebrow mb-3 mt-8 text-white/60">
                    {tr(ui.services.includes)}
                  </h4>
                  <ul className="flex max-w-[34rem] flex-wrap gap-2">
                    {service.includes.map((item) => (
                      <li
                        key={item.en}
                        className="rounded-full border border-white/20 bg-black/20 px-4 py-2 text-sm text-white/90"
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
                className="relative h-full w-full transition-transform duration-700 ease-cine motion-safe:lg:group-hover:-translate-y-2"
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
  const enoughHeight = useMedia('(min-height: 740px)')
  const reducedMotion = useMedia(
    '(prefers-reduced-motion: reduce)',
  )
  /*
    Short desktop windows use stacked rows too,
    preventing the sticky content from being clipped.
  */
  // Measured once, not live: a phone's viewport height changes every time its address bar
  // slides in or out, and switching layouts mid-scroll would make the page jump.
  const [tallEnoughForPhoneStage] = useState(
    () => window.innerHeight >= 520,
  )
  const motionAllowed = !reducedMotion && !prefersReduced()
  if (motionAllowed && desktop && enoughHeight) {
    return <ServicesPinned />
  }
  // Phones and tablets get their own single-screen stage.
  if (motionAllowed && !desktop && tallEnoughForPhoneStage) {
    return <ServicesPinnedMobile />
  }
  // Fallback (reduced motion, very short windows): stacked rows over one pinned background.
  return (
    <section
      className="services-surface relative isolate"
      aria-labelledby="services-title-m"
    >
      <ServicesStyles />
      <ServicesBackground pinned />
      <div className="wrap relative z-10 py-12 sm:py-16">
        <Eyebrow className="mb-6 text-white/70">
          {tr(ui.services.eyebrow)}
        </Eyebrow>
        <h2 id="services-title-m" className="sr-only">
          {ui.services.title[lang].join(' ')}
        </h2>
        <Lines
          as="p"
          className="t-display"
          lines={[
            <span key="first" className="thin">
              {ui.services.title[lang][0]}
            </span>,
            dot(ui.services.title[lang][1] + '.'),
          ]}
        />
        <p className="t-lead mt-6 max-w-[36ch] text-white/75">
          {tr(ui.services.intro)}
        </p>
      </div>
      <ServiceRows background={false} />
    </section>
  )
}
