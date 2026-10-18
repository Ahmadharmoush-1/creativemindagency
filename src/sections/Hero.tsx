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
  const lines = ui.hero.lines[lang]

  const buttonClasses =
    '!min-h-[3.75rem] !px-7 !py-4 !text-[1.125rem] !font-bold !leading-snug sm:!min-h-[4rem] sm:!px-8 sm:!text-[1.25rem] [&_svg]:!h-6 [&_svg]:!w-6 [&_svg]:shrink-0'

  // Start the muted video and resume when the tab becomes visible.
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
  }, [portrait])

  // Entrance animations
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
          {
            yPercent: 0,
            duration: 1.3,
            stagger: 0.12,
          },
          0.45,
        )
        .to(
          '.hero-fade',
          {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.1,
          },
          1.05,
        )
    },
    [ready],
  )

  // Scroll animation
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
          },
          defaults: { ease: 'none' },
        })
        .to(
          '.hero-cam',
          {
            scale: desktop ? 1.38 : 1.22,
            transformOrigin: desktop
              ? '84% 18%'
              : portrait
                ? '90% 28%'
                : '70% 20%',
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
        {/* Original video */}
        <div className="hero-media absolute inset-0 z-0 h-full w-full">
          <div className="hero-cam h-full w-full">
            <video
              key={portrait ? 'portrait' : 'wide'}
              ref={video}
              className={`absolute inset-0 h-full w-full object-cover lg:object-center ${
                portrait
                  ? 'object-[100%_50%]'
                  : isArabic
                    ? 'object-[74%_50%]'
                    : 'object-[34%_50%]'
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={
                portrait
                  ? '/media/hero-poster-mobile.webp'
                  : '/media/hero-poster.webp'
              }
              aria-label={tr(ui.hero.alt)}
            >
              {portrait ? (
                <source
                  src="/media/hero-mobile.mp4"
                  type="video/mp4"
                />
              ) : (
                <>
                  <source
                    src="/media/hero.webm"
                    type="video/webm"
                  />
                  <source
                    src="/media/hero.mp4"
                    type="video/mp4"
                  />
                </>
              )}
            </video>
          </div>
        </div>

        {/* Headline and buttons */}
        <div
          className="hero-copy wrap pointer-events-none relative z-10 flex h-full flex-col justify-between gap-6 pt-[5.75rem] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-28 lg:justify-end lg:pt-0 lg:pb-[7vh]"
          dir="ltr"
        >
          <div
            className={`hero-legible w-full min-w-0 ${
              isArabic
                ? 'lg:max-w-[46%]'
                : 'lg:max-w-[54%]'
            }`}
            dir={isArabic ? 'rtl' : 'ltr'}
            style={{ textAlign: 'start' }}
          >
            {/* Kicker */}
            <p
              className="hero-fade eyebrow mb-4 flex w-full items-center justify-start gap-3 !text-[0.85rem] !font-semibold text-white sm:!text-[0.95rem] lg:mb-7 lg:!text-[1rem]"
              style={{ textAlign: 'start' }}
            >
              <span
                className="sphere block h-2 w-2 shrink-0"
                aria-hidden="true"
              />

              <span>{tr(ui.hero.kicker)}</span>
            </p>

            {/* Aligned headline — second line bold in both languages */}
            <h1
              className="t-hero !m-0 w-full !p-0 !text-[clamp(3rem,7vw,8rem)]"
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
                          ? {
                              fontSize: '0.58em',
                              fontWeight: 600,
                            }
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

            {/* Larger, bolder subtitle */}
            <p
              className="hero-fade t-lead mt-4 max-w-[21ch] !text-[1.125rem] !font-semibold !leading-[1.65] text-white sm:max-w-[30ch] sm:!text-[1.25rem] lg:mt-8 lg:max-w-[34ch] lg:!text-[1.375rem]"
              style={{
                textAlign: 'start',
                marginInlineStart: 0,
                marginInlineEnd: 'auto',
              }}
            >
              {tr(ui.hero.sub)}
            </p>

            {/* Larger desktop buttons */}
            <div className="hero-fade pointer-events-auto mt-8 hidden flex-wrap items-stretch justify-start gap-4 lg:flex">
              <Cta
                to="/contact"
                className={`${buttonClasses} !justify-between gap-5`}
              >
                {tr(ui.cta)}
              </Cta>

              <Cta
                to="/work"
                variant="ghost"
                className={`${buttonClasses} !justify-between gap-5`}
              >
                {tr(ui.explore)}
              </Cta>
            </div>
          </div>

          {/* Larger mobile buttons */}
          <div
            className="hero-fade pointer-events-auto flex w-full shrink-0 flex-col gap-3 lg:hidden"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <Cta
              to="/contact"
              className={`${buttonClasses} w-full !justify-between gap-4`}
            >
              {tr(ui.cta)}
            </Cta>

            <Cta
              to="/work"
              variant="ghost"
              className={`${buttonClasses} w-full !justify-between gap-4 bg-navy/55 backdrop-blur-md`}
            >
              {tr(ui.explore)}
            </Cta>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="hero-fade pointer-events-none absolute end-[clamp(1.25rem,5vw,5.5rem)] bottom-[7vh] z-10 hidden items-center gap-3 lg:flex"
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