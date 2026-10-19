import { useEffect, useRef } from 'react'

import { useLang } from '../lib/i18n'
import {
  gsap,
  prefersReduced,
  useFixedPin,
  useGsap,
  useMedia,
} from '../lib/gsap'

import { useReady } from '../lib/ready'
import { ui } from '../content/ui'
import { Cta } from '../components/Brand'
import { heroPoster, warmHeroPoster } from '../lib/heroMedia'

export function Hero() {
  const { tr, lang } = useLang()
  const ready = useReady()

  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)

  useFixedPin(root, '.scrolly-pin')

  const desktop = useMedia('(min-width: 1024px)')
  const portrait = useMedia(
    '(max-width: 1023px) and (orientation: portrait)',
  )

  const isArabic = lang === 'ar'
  const direction = isArabic ? 'rtl' : 'ltr'
  const lines = ui.hero.lines[lang]

  // Filenames for the exact horizontal-mirror Arabic videos and posters.
  // Put the four Arabic media files in your project's public/media/ folder.
  const poster = heroPoster(lang, portrait)

  const mobileVideo = isArabic
    ? '/media/hero-mobile-ar.mp4'
    : '/media/hero-mobile.mp4'

  const desktopVideo = isArabic
    ? '/media/hero-ar.mp4'
    : '/media/hero.mp4'

  // Keep the existing desktop button design.
  const buttonClasses =
    '!min-h-[2.5rem] !px-4 !py-1.5 !text-[0.8125rem] !font-bold !leading-snug sm:!min-h-[2.75rem] sm:!px-5 sm:!text-[0.9375rem] [&_svg]:!h-4 [&_svg]:!w-4 [&_svg]:shrink-0'

  // Preserve the smaller mobile buttons from the previous update.
  const mobileButtonClasses =
    '!min-h-[2.25rem] !px-3 !py-1 !text-[0.75rem] !font-bold !leading-snug sm:!min-h-[2.5rem] sm:!px-4 sm:!text-[0.875rem] [&_svg]:!h-3.5 [&_svg]:!w-3.5 [&_svg]:shrink-0'

  // In Arabic, mirror the decorative CTA arrow icons as well.
  const rtlIconClass = isArabic ? '[&_svg]:-scale-x-100' : ''

  // Replay the muted video after changing language or orientation.
  useEffect(() => {
    const v = video.current
    if (!v) return

    v.muted = true

    const play = () => {
      if (!document.hidden) {
        v.play().catch(() => {})
      }
    }

    play()
    v.addEventListener('canplay', play)
    document.addEventListener('visibilitychange', play)

    return () => {
      v.removeEventListener('canplay', play)
      document.removeEventListener('visibilitychange', play)
    }
  }, [portrait, lang])

  // Once this film is playing and the page is idle, fetch the other language's poster, so a
  // switch shows the right poster at once while the other film loads.
  useEffect(() => {
    const v = video.current
    if (!ready || !v) return
    const other = isArabic ? 'en' : 'ar'
    let idle = 0
    let timer = 0
    let fallback = 0
    const schedule = () => {
      window.clearTimeout(fallback)
      v.removeEventListener('canplaythrough', schedule)
      if (window.requestIdleCallback) idle = window.requestIdleCallback(() => warmHeroPoster(other), { timeout: 4000 })
      else timer = window.setTimeout(() => warmHeroPoster(other), 1200)
    }
    if (v.readyState >= 4) schedule()
    else {
      v.addEventListener('canplaythrough', schedule)
      // Do not wait forever on a slow or failed film load.
      fallback = window.setTimeout(schedule, 8000)
    }
    return () => {
      v.removeEventListener('canplaythrough', schedule)
      window.clearTimeout(fallback)
      window.clearTimeout(timer)
      if (idle) window.cancelIdleCallback?.(idle)
    }
  }, [ready, isArabic])

  // Entrance animations: unchanged.
  useGsap(
    root,
    () => {
      if (prefersReduced()) return

      gsap.set('.hero-media', { opacity: 0, scale: 1.14 })
      gsap.set('.hero-line', { yPercent: 115 })
      gsap.set('.hero-fade', { opacity: 0, y: 26 })

      if (!ready) return

      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .to(
          '.hero-media',
          {
            opacity: 1,
            duration: 1.6,
            ease: 'power2.out',
          },
          0,
        )
        .to(
          '.hero-media',
          { scale: 1, duration: 2.6 },
          0,
        )
        .to(
          '.hero-line',
          { yPercent: 0, duration: 1.3, stagger: 0.12 },
          0.45,
        )
        .to(
          '.hero-fade',
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          1.05,
        )
    },
    [ready],
  )

  // The zoom pivot is mirrored in Arabic, not just the media files. It is read through a ref so a
  // language switch does not tear this scene down: the refresh that follows a switch
  // re-reads it (invalidateOnRefresh).
  const zoomOrigin = useRef('')
  zoomOrigin.current = desktop
    ? isArabic
      ? '16% 18%'
      : '84% 18%'
    : portrait
      ? isArabic
        ? '10% 28%'
        : '90% 28%'
      : isArabic
        ? '30% 20%'
        : '70% 20%'
  useGsap(
    root,
    () => {
      if (prefersReduced()) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
          defaults: { ease: 'none' },
        })
        .to(
          '.hero-cam',
          {
            scale: desktop ? 1.38 : 1.22,
            transformOrigin: () => zoomOrigin.current,
          },
          0,
        )
        .to(
          '.hero-copy',
          {
            yPercent: -22,
            opacity: 0,
            duration: 0.55,
          },
          0,
        )
    },
    [desktop, portrait],
  )

  return (
    <section
      ref={root}
      className="scrolly"
      style={{ ['--scrolly-h' as string]: '175vh' }}
      aria-label="Creative Mind"
    >
      <div className="scrolly-pin">
        {/* Original English media; mirrored replacement only for Arabic. */}
        <div className="hero-media absolute inset-0 z-0 h-full w-full">
          <div className="hero-cam h-full w-full">
            <video
              key={`${lang}-${portrait ? 'portrait' : 'wide'}`}
              ref={video}
              className={`absolute inset-0 h-full w-full object-cover lg:object-center ${
                portrait
                  ? isArabic
                    ? 'object-[0%_50%]'
                    : 'object-[100%_50%]'
                  : isArabic
                    ? 'object-[66%_50%]'
                    : 'object-[34%_50%]'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={poster}
              aria-label={tr(ui.hero.alt)}
            >
              {portrait ? (
                <source src={mobileVideo} type="video/mp4" />
              ) : isArabic ? (
                <source src={desktopVideo} type="video/mp4" />
              ) : (
                <>
                  {/* Preserve the existing English WebM preference. */}
                  <source src="/media/hero.webm" type="video/webm" />
                  <source src={desktopVideo} type="video/mp4" />
                </>
              )}
            </video>
          </div>
        </div>

        {/* Entire hero content changes writing direction with the language. */}
        <div
          className="hero-copy wrap pointer-events-none relative z-10 flex h-full flex-col justify-between gap-6 pt-[clamp(7.5rem,16svh,9.5rem)] pb-[max(3rem,env(safe-area-inset-bottom))] sm:pt-[clamp(8.5rem,17svh,10rem)] lg:justify-end lg:pt-0 lg:pb-[12vh]"
          dir={direction}
        >
          <div
            className={`hero-legible w-full min-w-0 ${
              isArabic
                ? 'lg:ml-auto lg:mr-0 lg:max-w-[46%]'
                : 'lg:mr-auto lg:ml-0 lg:max-w-[54%]'
            }`}
            dir={direction}
            style={{ textAlign: 'start' }}
          >
            {/* Kicker */}
            <p
              className="hero-fade eyebrow mb-4 flex w-full items-center justify-start gap-3 !text-[0.9375rem] !font-semibold text-white sm:!text-[1.0625rem] lg:mb-7 lg:!text-[1rem]"
              style={{ textAlign: 'start' }}
            >
              <span
                className="sphere block h-2 w-2 shrink-0"
                aria-hidden="true"
              />
              <span>{tr(ui.hero.kicker)}</span>
            </p>

            {/* Headline: all lines align left in EN, right in AR. */}
            <h1
              className="t-hero !m-0 w-full !p-0 !text-[clamp(3.125rem,8vw,4.25rem)] sm:!text-[clamp(3.25rem,7.5vw,5rem)] lg:!text-[clamp(3rem,7vw,8rem)]"
              style={{ textAlign: 'start' }}
            >
              {lines.map((line, i) => {
                const isThirdLine = i === 2
                const hasFinalPeriod =
                  isThirdLine && line.endsWith('.')

                return (
                  <span
                    className="line-mask !m-0 !block w-full !px-0"
                    key={i}
                    style={{ textAlign: 'start' }}
                  >
                    <span
                      className={`hero-line line-inner !mx-0 !block w-full !px-0 ${
                        i === 1 ? '!font-bold' : ''
                      }`}
                      style={{
                        textAlign: 'start',
                        textIndent: 0,
                        ...(isThirdLine
                          ? { fontSize: '0.58em', fontWeight: 600 }
                          : {}),
                      }}
                    >
                      {hasFinalPeriod ? (
                        <>
                          {line.slice(0, -1)}
                          <span className="text-signal">.</span>
                        </>
                      ) : (
                        line
                      )}
                    </span>
                  </span>
                )
              })}
            </h1>

            {/* Subtitle: starts from the right in Arabic. */}
            <p
              className="hero-fade t-lead mt-4 max-w-[21ch] !text-[1.375rem] !font-semibold !leading-[1.6] text-white sm:max-w-[30ch] sm:!text-[1.5rem] lg:mt-8 lg:max-w-[34ch] lg:!text-[1.5rem] lg:!leading-[1.65]"
              style={{
                textAlign: 'start',
                marginInlineStart: 0,
                marginInlineEnd: 'auto',
              }}
            >
              {tr(ui.hero.sub)}
            </p>

            {/* Desktop CTAs: reverse their reading order naturally in RTL. */}
            <div
              className="hero-fade pointer-events-auto mt-8 hidden flex-wrap items-stretch justify-start gap-4 lg:flex"
              dir={direction}
            >
              <Cta
                to="/contact"
                className={`${buttonClasses} ${rtlIconClass} !justify-between gap-5`}
              >
                {tr(ui.cta)}
              </Cta>

              <Cta
                to="/work"
                variant="ghost"
                className={`${buttonClasses} ${rtlIconClass} !justify-between gap-5`}
              >
                {tr(ui.explore)}
              </Cta>
            </div>
          </div>

          {/* Mobile CTAs: stay smaller, with room for the floating top arrow. */}
          <div
            className="hero-fade pointer-events-auto flex w-full shrink-0 flex-col gap-2.5 pr-14 sm:pr-16 lg:hidden"
            dir={direction}
          >
            <Cta
              to="/contact"
              className={`${mobileButtonClasses} ${rtlIconClass} w-full !justify-between !gap-3`}
            >
              {tr(ui.cta)}
            </Cta>

            <Cta
              to="/work"
              variant="ghost"
              className={`${mobileButtonClasses} ${rtlIconClass} w-full !justify-between !gap-3 bg-navy/55 backdrop-blur-md`}
            >
              {tr(ui.explore)}
            </Cta>
          </div>
        </div>

        {/* Desktop scroll indicator; logical end follows the page direction. */}
        <div
          className="hero-fade pointer-events-none absolute end-[clamp(1.25rem,5vw,5.5rem)] bottom-[7vh] z-10 hidden items-center gap-3 lg:flex"
          dir={direction}
          aria-hidden="true"
        >
          <span className="eyebrow !text-[0.85rem] !font-semibold text-white/90">
            {tr(ui.scroll)}
          </span>
          <span className="relative block h-12 w-px overflow-hidden bg-white/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.2s_cubic-bezier(.16,1,.3,1)_infinite] bg-signal" />
          </span>
        </div>
      </div>
    </section>
  )
}
