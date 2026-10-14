
import { useEffect, useRef } from 'react'
import { useLang } from '../lib/i18n'
import { gsap, prefersReduced, useFixedPin, useGsap, useMedia } from '../lib/gsap'
import { useReady } from '../lib/ready'
import { ui } from '../content/ui'
import { Cta } from '../components/Brand'

export function Hero() {
  const { tr, lang } = useLang()
  const ready = useReady()
  const root = useRef<HTMLElement>(null)
  useFixedPin(root, '.scrolly-pin')
  const desktop = useMedia('(min-width: 1024px)')
  // Phones and portrait tablets get a portrait crop of the film, framed on the character.
  const portrait = useMedia('(max-width: 1023px) and (orientation: portrait)')
  const lines = ui.hero.lines[lang]

  // Phones sometimes ignore the autoplay attribute; start the muted film explicitly
  // and again when the tab becomes visible. If the device refuses, the poster stays.
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const v = video.current
    if (!v) return
    v.muted = true
    const play = () => {
      if (!document.hidden) v.play().catch(() => {})
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
          { opacity: 1, duration: 1.6, ease: 'power2.out' },
          0,
        )
        .to('.hero-media', { scale: 1, duration: 2.6 }, 0)
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
            transformOrigin: desktop ? '84% 18%' : portrait ? '88% 22%' : '70% 20%',
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

        {/* ORIGINAL VIDEO — NO BLUE OVERLAY */}
       
{/* FULL-SCREEN ORIGINAL VIDEO */}
<div className="hero-media absolute inset-0 z-0 h-full w-full">
  <div className="hero-cam h-full w-full">
    <video
      key={portrait ? 'portrait' : 'wide'}
      ref={video}
      className={`absolute inset-0 h-full w-full object-cover lg:object-center ${
        lang === 'ar' ? 'object-[74%_50%]' : 'object-[34%_50%]'
      }`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={portrait ? '/media/hero-poster-mobile.webp' : '/media/hero-poster.webp'}
      aria-label={tr(ui.hero.alt)}
    >
      {portrait ? (
        <source src="/media/hero-mobile.mp4" type="video/mp4" />
      ) : (
        <>
          {/* Same 1080p film: the VP9 copy is about half the size, H.264 is the fallback. */}
          <source src="/media/hero.webm" type="video/webm" />
          <source src="/media/hero.mp4" type="video/mp4" />
        </>
      )}
    </video>
  </div>
</div>


        {/* HEADLINE AND BUTTONS */}
        <div
          className="hero-copy wrap pointer-events-none relative z-10 flex h-full flex-col justify-between pt-[5.75rem] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pt-28 lg:justify-end lg:pt-0 lg:pb-[7vh]"
          dir="ltr"
        >
          <div
            className={`hero-legible ${
              lang === 'ar' ? 'lg:max-w-[46%]' : 'lg:max-w-[54%]'
            }`}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >

            {/* Kicker */}
            <p className="hero-fade eyebrow mb-4 flex items-center gap-3 text-white/90 lg:mb-7 lg:text-white/80">
              <span
                className="sphere block h-2 w-2"
                aria-hidden="true"
              />
              {tr(ui.hero.kicker)}
            </p>

            {/* Headline */}
            <h1 className="t-hero">
              {lines.map((l, i) => {
                // MIND / third headline line = 50% size
                const isMind = i === 2

                return (
                  <span className="line-mask" key={i}>
                    <span
                      className={`hero-line line-inner ${
                        i === 1 ? 'thin' : ''
                      }`}
                      style={
                        isMind
                          ? { fontSize: '0.5em' }
                          : undefined
                      }
                    >
                      {isMind ? (
                        <>
                          {l.slice(0, -1)}
                          <span className="text-signal">
                            {l.slice(-1)}
                          </span>
                        </>
                      ) : (
                        l
                      )}
                    </span>
                  </span>
                )
              })}
            </h1>

            {/* Subtitle */}
            <p className="hero-fade t-lead mt-4 max-w-[21ch] font-normal text-white sm:max-w-[30ch] lg:mt-8 lg:max-w-[34ch] lg:font-light lg:text-white/85">
              {tr(ui.hero.sub)}
            </p>

            {/* Desktop CTA */}
            <div className="hero-fade pointer-events-auto mt-8 hidden flex-wrap gap-3 lg:flex">
              <Cta to="/contact">
                {tr(ui.cta)}
              </Cta>

              <Cta to="/work" variant="ghost">
                {tr(ui.explore)}
              </Cta>
            </div>
          </div>

          {/* Mobile CTA */}
          <div
            className="hero-fade pointer-events-auto flex flex-col gap-3 lg:hidden"
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <Cta
              to="/contact"
              className="justify-between"
            >
              {tr(ui.cta)}
            </Cta>

            <Cta
              to="/work"
              variant="ghost"
              className="justify-between bg-navy/55 backdrop-blur-md"
            >
              {tr(ui.explore)}
            </Cta>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="hero-fade pointer-events-none absolute end-[clamp(1.25rem,5vw,5.5rem)] bottom-[7vh] z-10 hidden items-center gap-3 lg:flex"
          aria-hidden="true"
        >
          <span className="eyebrow text-white/70">
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
