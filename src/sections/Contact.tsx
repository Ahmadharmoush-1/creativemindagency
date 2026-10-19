import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useLang } from '../lib/i18n'
import { gsap, prefersReduced, rng } from '../lib/gsap'
import { submitInquiry } from '../lib/submit'
import { site } from '../content/site'
import { ui } from '../content/ui'
import { Arrow } from '../components/Brand'
/**
* Put the English wide background image at this path inside /public.
* Example: public/images/contact/contact-background.webp
* (The current file is a real WebP, quality 95, of the PNG master kept in
*  assets-src/backgrounds/contact-background.png: 6x smaller, same resolution.)
*
* You can also pass <Contact backgroundSrc="/your/image.webp" /> for English.
* The selected image covers the ENTIRE contact section, behind both columns.
*/
const DEFAULT_BACKGROUND = '/images/contact/contact-background.webp'
// RTL contact artwork: mascot and Arabic 'لنتحدث!' lettering.
const ARABIC_BACKGROUND = '/images/contact/contact-background-ar.webp'
type Status = 'idle' | 'sending' | 'done' | 'error'
type IconName =
  | 'person'
  | 'mail'
  | 'building'
  | 'phone'
  | 'chat'
  | 'pin'
  | 'projects'
  | 'chevron'
  | 'lock'
type FieldProps = {
  id: string
  label: string
  placeholder: string
  icon: IconName
  type?: string
  required?: boolean
  error?: string
  textarea?: boolean
  autoComplete?: string
  onEdit?: () => void
}
/** Small icons so the component needs no extra icon dependencies. */
function ContactIcon({
  name,
  className = 'h-[18px] w-[18px]',
}: {
  name: IconName
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {name === 'person' && (
        <>
          <circle cx="12" cy="7.4" r="3.5" />
          <path d="M4.8 20v-1.8a7.2 7.2 0 0 1 14.4 0V20" />
        </>
      )}
      {name === 'mail' && (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.8 6.2 8.2 6.5 8.2-6.5" />
        </>
      )}
      {name === 'building' && (
        <>
          <rect x="4" y="3" width="11" height="18" rx="1.4" />
          <path d="M15 9h5v12H4M8 7h3M8 11h3M8 15h3M9 21v-3h3M18 13v1M18 17v1" />
        </>
      )}
      {name === 'phone' && (
        <path d="M5.7 3.4 8.6 3a1.5 1.5 0 0 1 1.6.9l1.2 3.1a1.5 1.5 0 0 1-.4 1.7L9.2 10a15 15 0 0 0 4.8 4.8l1.3-1.8a1.5 1.5 0 0 1 1.7-.4l3.1 1.2a1.5 1.5 0 0 1 .9 1.6l-.4 2.9a2.2 2.2 0 0 1-2.2 1.9C10 20.2 3.8 14 3.8 5.6a2.2 2.2 0 0 1 1.9-2.2Z" />
      )}
      {name === 'chat' && (
        <>
          <path d="M20 11.5a7.7 7.7 0 0 1-8.1 7.6 8.5 8.5 0 0 1-3.5-.9L4 20l1.7-4.3A7.7 7.7 0 1 1 20 11.5Z" />
          <path d="M8.5 11.5h.02m3.5 0h.02m3.5 0h.02" strokeWidth="2.5" />
        </>
      )}
      {name === 'pin' && (
        <>
          <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      )}
      {name === 'projects' && (
        <>
          <rect x="3.5" y="3.5" width="6.7" height="6.7" rx="1" />
          <rect x="13.8" y="3.5" width="6.7" height="6.7" rx="1" />
          <rect x="3.5" y="13.8" width="6.7" height="6.7" rx="1" />
          <rect x="13.8" y="13.8" width="6.7" height="6.7" rx="1" />
        </>
      )}
      {name === 'chevron' && <path d="m5 9 7 7 7-7" />}
      {name === 'lock' && (
        <>
          <rect x="5.5" y="10.5" width="13" height="10" rx="2" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2.1" />
        </>
      )}
    </svg>
  )
}
const inputClass = [
  'block w-full min-w-0 rounded-[9px] border border-white/20',
  'bg-[#152441]/70 px-3 py-2.5 ps-10 md:px-4 md:py-[15px] md:ps-11 text-[16px] font-semibold leading-[1.6] text-white',
  'placeholder:text-white/65 outline-none',
  'transition-[border-color,box-shadow,background-color] duration-300',
  'hover:border-white/35 focus:border-[#f6620d] focus:bg-[#162848]',
  'focus:ring-[3px] focus:ring-[#f6620d]/15',
].join(' ')
function Field({
  id,
  label,
  placeholder,
  icon,
  type = 'text',
  required,
  error,
  textarea,
  autoComplete,
  onEdit,
}: FieldProps) {
  const { tr } = useLang()
  const common = {
    id,
    name: id,
    required,
    onInput: onEdit,
    placeholder,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-describedby': error ? `${id}-err` : undefined,
    dir: 'auto' as const,
  }
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-[12px] md:mb-2.5 md:text-[15px] font-bold text-white">
        {label}
        {required && (
          <>
            <span className="sr-only"> ({tr(ui.contact.required)})</span>
            <span className="ms-1 text-[#f6620d]" aria-hidden="true">*</span>
          </>
        )}
      </label>
      <div className="relative">
        <span className={`pointer-events-none absolute start-3.5 ${textarea ? 'top-[15px]' : 'top-1/2 -translate-y-1/2'} text-white/65`}>
          <ContactIcon name={icon} />
        </span>
        {textarea ? (
          <textarea
            {...common}
            rows={3}
            className={`${inputClass} min-h-[88px] md:min-h-[102px] resize-y`}
          />
        ) : (
          <input
            {...common}
            type={type}
            autoComplete={autoComplete}
            className={inputClass}
          />
        )}
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-2 text-sm font-semibold text-[#FFA16F]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
export function Contact({
  heading = 'h2',
  backgroundSrc = DEFAULT_BACKGROUND,
}: {
  heading?: 'h1' | 'h2'
  backgroundSrc?: string
}) {
  const { tr, lang } = useLang()
  const isArabic = lang === 'ar'
  // Swap only the background image with the language; leave the form mounted.
  const contactBackground = isArabic ? ARABIC_BACKGROUND : backgroundSrc
  const Heading = heading
  const wa = site.whatsapp ? `https://wa.me/${site.whatsapp}` : undefined
  const visibleWhatsApp = site.whatsapp
    ? (site.whatsapp.startsWith('+') ? site.whatsapp : `+${site.whatsapp}`)
    : undefined
  const [cats, setCats] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const [status, setStatus] = useState<Status>('idle')
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const formBox = useRef<HTMLDivElement>(null)
  const fx = useRef<HTMLDivElement>(null)
  // Section elements reveal gently as they enter view.
  useEffect(() => {
    const section = sectionRef.current
    if (!section || prefersReduced() || !('IntersectionObserver' in window)) return
    const targets = Array.from(section.querySelectorAll<HTMLElement>('[data-contact-reveal]'))
    gsap.set(targets, { autoAlpha: 0, y: 22 })
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          observer.unobserve(entry.target)
          gsap.to(entry.target, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            overwrite: 'auto',
          })
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -25px 0px' },
    )
    targets.forEach((target) => observer.observe(target))
    return () => {
      observer.disconnect()
      gsap.killTweensOf(targets)
      gsap.set(targets, { clearProps: 'all' })
    }
  }, [])
  // Subtle full-background parallax on desktop pointer devices.
  useEffect(() => {
    const section = sectionRef.current
    const art = imageRef.current
    if (!section || !art || prefersReduced()) return
    const quickX = gsap.quickTo(art, 'x', { duration: 1, ease: 'power3.out' })
    const quickY = gsap.quickTo(art, 'y', { duration: 1, ease: 'power3.out' })
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || window.innerWidth < 1024) return
      const rect = section.getBoundingClientRect()
      quickX(((event.clientX - rect.left) / rect.width - 0.5) * 14)
      quickY(((event.clientY - rect.top) / rect.height - 0.5) * 14)
    }
    const leave = () => { quickX(0); quickY(0) }
    section.addEventListener('pointermove', move)
    section.addEventListener('pointerleave', leave)
    return () => {
      section.removeEventListener('pointermove', move)
      section.removeEventListener('pointerleave', leave)
      gsap.killTweensOf(art)
      gsap.set(art, { clearProps: 'x,y' })
    }
  }, [])
  const toggle = (category: string, element: HTMLButtonElement) => {
    setCats((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    )
    if (!prefersReduced()) {
      gsap.fromTo(element, { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' })
    }
  }
  // Celebrate ONLY after a successful API submission.
  const celebrate = () =>
    new Promise<void>((resolve) => {
      const layer = fx.current
      const box = formBox.current
      if (!layer || !box || prefersReduced()) return resolve()
      const { width, height } = box.getBoundingClientRect()
      const random = rng(Date.now() & 0xffff)
      const particles = Array.from({ length: 22 }, () => {
        const particle = document.createElement('span')
        const size = 3 + random() * 5
        particle.className = 'absolute block rounded-full'
        particle.style.width = `${size}px`
        particle.style.height = `${size}px`
        particle.style.background = random() > 0.3 ? '#f6620d' : '#ffffff'
        layer.appendChild(particle)
        gsap.set(particle, {
          x: random() * width,
          y: random() * height,
          opacity: 0,
          scale: 0.5,
        })
        return particle
      })
      const timeline = gsap.timeline({
        onComplete: () => {
          particles.forEach((particle) => particle.remove())
          resolve()
        },
      })
      timeline.to(particles, {
        opacity: 0.95,
        duration: 0.22,
        stagger: { each: 0.012, from: 'random' },
      })
      timeline.to(particles, {
        x: width * 0.5,
        y: height * 0.45,
        scale: 0,
        opacity: 0,
        duration: 0.56,
        ease: 'power3.in',
        stagger: { each: 0.008, from: 'random' },
      }, '-=0.04')
    })
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'sending') return
    const data = new FormData(event.currentTarget)
    const value = (key: string) => String(data.get(key) ?? '').trim()
    const nextErrors: typeof errors = {}
    if (!value('name')) nextErrors.name = tr(ui.contact.errName)
 if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email'))) {
nextErrors.email = tr(ui.contact.errEmail)
}
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.email) {
      const invalid = nextErrors.name ? 'name' : 'email'
      ;(event.currentTarget.elements.namedItem(invalid) as HTMLElement | null)?.focus()
      return
    }
    setStatus('sending')
    try {
      await submitInquiry({
        name: value('name'),
        company: value('company'),
        email: value('email'),
        phone: value('phone'),
        message: value('message'),
        categories: cats,
        lang,
      })
      await celebrate()
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }
  const reset = () => {
    setCats([])
    setErrors({})
    setStatus('idle')
  }
  const selectedCategories = cats
    .map((id) => ui.contact.cats.find((cat) => cat.en === id))
    .filter((cat): cat is (typeof ui.contact.cats)[number] => Boolean(cat))
    .map((cat) => tr(cat))
  return (
    <section
      id="contact"
      ref={sectionRef}
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-labelledby="contact-title"
      className="relative isolate scroll-mt-20 overflow-hidden bg-[#051746] py-8 text-white md:py-20 lg:min-h-[860px] lg:py-20"
      style={{
        fontFamily: isArabic
          ? "'Noto Kufi Arabic Variable', 'Noto Kufi Arabic', sans-serif"
          : "'Montserrat', sans-serif",
      }}
    >
      {/* THE ENTIRE SECTION BACKGROUND. Just add your image at backgroundSrc. */}
      <div
        ref={imageRef}
        className="cm-contact-art pointer-events-none absolute -inset-4 overflow-hidden will-change-transform"
        aria-hidden="true"
      >
        {/* An <img> instead of a CSS background so the browser only fetches it as this section nears the screen. */}
        <img
          src={contactBackground}
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="block h-full w-full object-cover object-center"
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(90deg, rgba(5,16,36,.46) 0%, rgba(5,16,36,.10) 52%, rgba(5,16,36,.24) 100%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#051746]/25 via-transparent to-[#041126]/70 lg:hidden"
        aria-hidden="true"
      />
      {/* Keep the focal character visible on both sides: English left, Arabic right. */}
      <style>{`
        @media (max-width: 767px) {
          #contact .cm-contact-art img { object-position: ${isArabic ? '66%' : '40%'} top; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          #contact .cm-contact-art img { object-position: ${isArabic ? '64%' : '45%'} center; }
        }
      `}</style>
      <div className="wrap relative z-10 mx-auto grid w-full max-w-[1450px] gap-7 px-4 md:gap-12 md:px-8 lg:min-h-[700px] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-14 lg:px-10 xl:gap-20">
        {/* LEFT: editorial headline and company contact details */}
        <div className="relative order-2 flex min-w-0 flex-col self-stretch lg:order-1 lg:py-8" data-contact-reveal>
          <div>
            <p className="mt-0 max-w-[45ch] text-[.875rem] font-medium leading-[1.7] text-white/95 md:mt-6 md:text-[1.25rem] md:font-semibold md:leading-[1.85]">
              {tr({
                en: 'Have a project in mind? A question? Or just want to explore ideas? We’d love to hear from you. Our team is here to turn your ideas into real impact.',
                ar: 'هل لديك مشروع أو سؤال أو فكرة ترغب باستكشافها؟ يسعدنا أن نسمع منك. فريقنا هنا ليساعدك في تحويل أفكارك إلى تأثير حقيقي.',
              })}
            </p>
          </div>
          <div className="relative mt-5 grid max-w-[390px] gap-4 md:mt-16 md:gap-6 lg:mt-auto lg:pt-16">
            <a
              href={`mailto:${site.email}`}
              className="group flex min-w-0 items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6620d]"
            >
              <span className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors group-hover:border-[#f6620d] group-hover:bg-[#f6620d]/25">
                <ContactIcon name="mail" className="h-[18px] w-[18px] md:h-[22px] md:w-[22px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] md:text-base font-bold text-white">
                  {tr({ en: 'Email Us', ar: 'راسلنا بالبريد الإلكتروني' })}
                </span>
                <span className="mt-1 block break-all text-[13px] md:text-base font-semibold text-white/95 group-hover:text-white md:text-[1.0625rem]">
                  {site.email}
                </span>
              </span>
            </a>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-w-0 items-center gap-4 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6620d]"
              >
                <span className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-white/10 text-white backdrop-blur-md transition-colors group-hover:border-[#f6620d] group-hover:bg-[#f6620d]/25">
                  <ContactIcon name="chat" className="h-[18px] w-[18px] md:h-[22px] md:w-[22px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] md:text-base font-bold text-white">
                    {tr({ en: 'Let’s Chat', ar: 'تحدّث معنا' })}
                  </span>
                  <span className="mt-1 block text-[13px] md:text-base font-semibold text-white/95 group-hover:text-white md:text-[1.0625rem]" dir="ltr">
                    {visibleWhatsApp}
                  </span>
                </span>
              </a>
            )}
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-[12px] border border-white/30 bg-white/10 text-white backdrop-blur-md">
                <ContactIcon name="pin" className="h-[18px] w-[18px] md:h-[22px] md:w-[22px]" />
              </span>
              <span>
                <span className="block text-[13px] md:text-base font-bold text-white">
                  {tr({ en: 'Our Office', ar: 'مكتبنا' })}
                </span>
                <span className="mt-1 block text-[13px] md:text-base font-semibold text-white/95 md:text-[1.0625rem]">
                  {tr({ en: 'Riyadh, Saudi Arabia', ar: 'الرياض، المملكة العربية السعودية' })}
                </span>
              </span>
            </div>
          </div>
        </div>
        {/* RIGHT: glassmorphism contact form, matching the reference. */}
        <div
          ref={formBox}
          className="relative isolate order-1 min-w-0 lg:order-2 rounded-[24px] border border-white/20 p-[1px] shadow-[0_25px_85px_rgba(0,4,20,.48)] backdrop-blur-[24px] sm:rounded-[30px]"
          style={{
            background:
              'linear-gradient(128deg, rgba(246,98,13,.80) 0%, rgba(255,255,255,.18) 23%, rgba(255,255,255,.10) 75%, rgba(246,98,13,.16) 100%)',
          }}
          data-contact-reveal
        >
          <div ref={fx} className="pointer-events-none absolute inset-0 z-30" aria-hidden="true" />
          <div
            className="relative rounded-[23px] px-4 py-6 md:rounded-[29px] md:px-9 md:py-10 lg:px-9 lg:py-10 xl:px-11"
            style={{
              background:
                'linear-gradient(145deg, rgba(7,21,47,.93), rgba(12,23,47,.88) 65%, rgba(16,24,47,.89))',
            }}
          >
            {/* orange glint running across the upper edge */}
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center" aria-hidden="true">
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#f6620d] to-transparent shadow-[0_0_15px_3px_rgba(246,98,13,.8)]" />
            </div>
            <header className="relative z-10 min-w-0">
            <p className="mb-3 flex items-center gap-2 text-[11px] md:mb-5 md:gap-3 md:text-[15px] font-bold uppercase tracking-[0.12em] text-white rtl:tracking-normal">
              <span className="h-[6px] w-[6px] rounded-full bg-[#f6620d] shadow-[0_0_18px_rgba(246,98,13,.6)]" />
              {tr(ui.contact.eyebrow)}
            </p>
            <Heading
              id="contact-title"
              className="max-w-full break-words text-[clamp(1.5rem,6.5vw,2rem)] md:text-[clamp(1.9rem,2.5vw,2.8rem)] font-bold uppercase leading-[1.07] tracking-[-0.04em] text-white rtl:max-w-none rtl:leading-[1.35] rtl:tracking-normal"
            >
              <span className="block">{tr({ en: 'Let’s build', ar: 'لنصنع معًا' })}</span>
              <span className="block">
                {tr({ en: 'something', ar: 'شيئًا' })}{' '}
                <strong className="font-bold text-[#f6620d]">
                  {tr({ en: 'great.', ar: 'استثنائيًا.' })}
                </strong>
              </span>
            </Heading>
            </header>
            {status === 'done' ? (
              <div className="relative z-10 flex min-h-[320px] md:min-h-[560px] flex-col items-start justify-center" role="status">
                <span className="mb-5 mt-5 flex h-14 w-14 md:mb-8 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-[#f6620d] text-4xl text-white shadow-[0_12px_35px_rgba(246,98,13,.35)]" aria-hidden="true">✓</span>
                <p className="mb-4 text-sm font-bold uppercase tracking-[.12em] rtl:tracking-normal text-[#ff9a62]">
                  {tr({ en: 'Message received', ar: 'تم استلام رسالتك' })}
                </p>
                <h3 className="text-[clamp(1.75rem,2.7vw,2.7rem)] font-bold leading-tight text-white">
                  {tr(ui.contact.success)}
                  <span className="mt-3 block text-[1.125rem] font-semibold leading-relaxed text-[#ff8a45] sm:text-xl">{tr(ui.contact.success2)}</span>
                </h3>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-6 md:mt-10 min-h-[48px] border-b border-[#ff8a45] pb-2 text-lg font-bold text-white transition-colors hover:text-[#ff8a45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6620d]"
                >
                  {tr(ui.contact.again)} <span aria-hidden="true">↗</span>
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate aria-busy={status === 'sending'} className="relative z-10">
                <p className="mb-5 mt-3 text-[.8125rem] font-medium leading-[1.65] text-white/95 md:mb-8 md:text-[1.125rem] md:font-semibold md:leading-[1.8]">
                  {tr({
                    en: 'Tell us about your project and we’ll get back to you shortly.',
                    ar: 'أخبرنا عن مشروعك وسنعود إليك في أقرب وقت.',
                  })}
                </p>
                {/* Order matches the reference: Name / Email, Company / Phone. */}
                <div className="grid gap-x-4 gap-y-3 md:gap-y-5 sm:grid-cols-2">
                  <Field
                    id="name"
                    label={tr({ en: 'Full Name', ar: 'الاسم الكامل' })}
                    placeholder={tr({ en: 'Your name', ar: 'اسمك' })}
                    icon="person"
                    required
                    error={errors.name}
                    autoComplete="name"
                    onEdit={() => errors.name && setErrors((current) => ({ ...current, name: undefined }))}
                  />
                  <Field
                    id="email"
                    label={tr({ en: 'Email Address', ar: 'البريد الإلكتروني' })}
                    placeholder="you@company.com"
                    icon="mail"
                    type="email"
                    required
                    error={errors.email}
                    autoComplete="email"
                    onEdit={() => errors.email && setErrors((current) => ({ ...current, email: undefined }))}
                  />
                  <Field
                    id="company"
                    label={tr({ en: 'Company', ar: 'الشركة' })}
                    placeholder={tr({ en: 'Your company', ar: 'اسم الشركة' })}
                    icon="building"
                    autoComplete="organization"
                  />
                  <Field
                    id="phone"
                    label={tr({ en: 'Phone (Optional)', ar: 'رقم الهاتف (اختياري)' })}
                    placeholder={tr({ en: 'Phone number', ar: 'رقم الهاتف' })}
                    icon="phone"
                    type="tel"
                    autoComplete="tel"
                  />
                </div>
                {/* Dropdown LOOK like the reference, but multiple service choices still work. */}
                <div className="mt-4 md:mt-6">
                  <span id="contact-project-label" className="mb-1.5 block text-[12px] md:mb-2.5 md:text-[15px] font-bold text-white">
                    {tr({ en: 'Project Type', ar: 'نوع المشروع' })}
                  </span>
                  <details className="group relative">
                    <summary
                      aria-labelledby="contact-project-label"
                      className="flex min-h-[46px] md:min-h-[56px] cursor-pointer list-none items-center gap-3 rounded-[9px] border border-white/20 bg-[#152441]/70 px-3 py-2.5 text-sm md:px-4 md:py-3.5 md:text-base font-semibold text-white/95 transition-colors hover:border-white/35 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6620d] [&::-webkit-details-marker]:hidden"
                    >
                      <ContactIcon name="projects" className="h-[18px] w-[18px] shrink-0 text-white/65" />
                      <span className="min-w-0 flex-1 truncate text-start">
                        {selectedCategories.length
                          ? selectedCategories.join(', ')
                          : tr({ en: 'Select a service', ar: 'اختر خدمة' })}
                      </span>
                      <ContactIcon name="chevron" className="h-4 w-4 shrink-0 text-white/65 transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <fieldset className="absolute inset-x-0 top-[calc(100%+6px)] z-30 max-h-[230px] space-y-1 overflow-y-auto rounded-[12px] border border-white/20 bg-[#0A1832] p-2 shadow-[0_20px_48px_rgba(0,0,0,.5)]">
                      <legend className="sr-only">{tr(ui.contact.need)}</legend>
                      {ui.contact.cats.map((category) => {
                        const checked = cats.includes(category.en)
                        return (
                          <button
                            key={category.en}
                            type="button"
                            disabled={status === 'sending'}
                            aria-pressed={checked}
                            onClick={(event) => toggle(category.en, event.currentTarget)}
                            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-start text-sm md:text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f6620d] ${checked ? 'bg-[#f6620d]/20 text-white' : 'text-white/95 hover:bg-white/10 hover:text-white'}`}
                          >
                            <span>{tr(category)}</span>
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${checked ? 'border-[#f6620d] bg-[#f6620d] text-white' : 'border-white/35'}`}>
                              {checked && '✓'}
                            </span>
                          </button>
                        )
                      })}
                    </fieldset>
                  </details>
                </div>
                <div className="mt-4 md:mt-6">
                  <Field
                    id="message"
                    label={tr({ en: 'Message', ar: 'الرسالة' })}
                    placeholder={tr({
                      en: 'Tell us about your project, goals, or any questions...',
                      ar: 'حدّثنا عن مشروعك وأهدافك أو أسئلتك...',
                    })}
                    icon="chat"
                    textarea
                  />
                </div>
                {status === 'error' && (
                  <p role="alert" className="mt-4 rounded-lg border border-[#f6620d]/50 bg-[#f6620d]/10 px-4 py-3 text-base font-semibold text-[#ffd6bf]">
                    {tr(ui.contact.errSend)}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group mt-5 flex min-h-[48px] md:mt-7 md:min-h-[64px] w-full items-center justify-center gap-3 rounded-[12px] bg-[#f6620d] px-4 py-3 text-sm font-bold uppercase tracking-[.04em] md:px-7 md:py-4 md:text-xl rtl:tracking-normal text-white shadow-[0_10px_25px_rgba(246,98,13,.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e65b09] hover:shadow-[0_15px_30px_rgba(246,98,13,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f6620d] disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0"
                >
                  {status === 'sending' ? tr(ui.contact.sending) : tr({ en: 'Send Message', ar: 'إرسال الرسالة' })}
                  {status === 'sending'
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                    : <Arrow className="h-5 w-5 md:h-6 md:w-6 shrink-0 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />}
                </button>
                <p className="mt-3 flex items-start justify-center gap-2 text-center text-[11px] md:mt-5 md:text-sm font-semibold leading-[1.7] text-white/85">
                  <ContactIcon name="lock" className="mt-[1px] h-4 w-4 shrink-0" />
                  {tr({
                    en: 'We’ll use your details to reply to your inquiry.',
                    ar: 'سنستخدم بياناتك للردّ على استفسارك.',
                  })}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
