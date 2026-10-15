import { useEffect, useRef, useState } from 'react'
import { useLang } from '../lib/i18n'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { gsap, prefersReduced, useGsap } from '../lib/gsap'
type Localized = {
  en: string
  ar: string
}
type PortfolioProject = {
  id: string
  name: Localized
  description: Localized
  image: string
}
type WorkCategory = {
  id: string
  title: Localized
  projects: PortfolioProject[]
}
/*
  Files inside public are referenced without "/public".
  Example:
  public/images/work/sbat-branding.jpg
  becomes:
  /images/work/sbat-branding.jpg
*/
export const workCategories: WorkCategory[] = [
  {
    id: 'branding',
    title: { en: 'Branding', ar: 'الهوية البصرية' },
    projects: [
      {
        id: 'sbat',
        name: { en: 'SBAT Branding', ar: 'هوية SBAT' },
        description: {
          en: 'Saudi Businessmen Association in Turkey',
          ar: 'جمعية رجال الأعمال السعوديين في تركيا',
        },
        image: '/images/work/sbat-branding.jpg',
      },
      {
        id: 'kaser-alpasha',
        name: {
          en: 'Kaser Alpasha Branding',
          ar: 'هوية قصر الباشا',
        },
        description: {
          en: 'Import & Export Company',
          ar: 'شركة استيراد وتصدير',
        },
        image: '/images/work/kaser-alpasha-branding.jpg',
      },
      {
        id: 'brooj',
        name: { en: 'Brooj Branding', ar: 'هوية بروج' },
        description: {
          en: 'Brooj Investment Holding',
          ar: 'بروج القابضة للاستثمار',
        },
        image: '/images/work/brooj-branding.jpg',
      },
    ],
  },
  {
    id: 'printing',
    title: { en: 'Printing Design', ar: 'تصميم المطبوعات' },
    projects: [
      {
        id: 'economic-vision',
        name: { en: 'Economic Vision', ar: 'الرؤية الاقتصادية' },
        description: {
          en: 'Saudi Economic Magazine',
          ar: 'مجلة اقتصادية سعودية',
        },
        image: '/images/work/economic-vision.jpg',
      },
      {
        id: 'saudi-aramco',
        name: { en: 'Saudi Aramco', ar: 'أرامكو السعودية' },
        description: {
          en: 'Printing Design',
          ar: 'تصميم المطبوعات',
        },
        image: '/images/work/saudi-aramco.jpg',
      },
      {
        id: 'super-fiber',
        name: { en: 'Super Fiber', ar: 'سوبر فايبر' },
        description: {
          en: 'Packaging Design',
          ar: 'تصميم التغليف',
        },
        image: '/images/work/super-fiber.jpg',
      },
    ],
  },
  {
    id: 'social',
    title: { en: 'Social Media', ar: 'التواصل الاجتماعي' },
    projects: [
      {
        id: 'flamingo',
        name: { en: 'Flamingo', ar: 'فلامينغو' },
        description: {
          en: 'Istanbul Tourism',
          ar: 'السياحة في إسطنبول',
        },
        image: '/images/work/flamingo.jpg',
      },
      {
        id: 'baazex',
        name: { en: 'BaazEx', ar: 'BaazEx' },
        description: {
          en: 'Online Trading',
          ar: 'التداول عبر الإنترنت',
        },
        image: '/images/work/baazex.jpg',
      },
      {
        id: 'abc-horizon',
        name: { en: 'ABC Horizon', ar: 'ABC Horizon' },
        description: {
          en: 'Person UK University College',
          ar: 'Person UK University College',
        },
        image: '/images/work/abc-horizon.jpg',
      },
    ],
  },
  {
    id: 'web',
    title: { en: 'Web design', ar: 'تصميم المواقع' },
    projects: [
      {
        id: 'zaatar',
        name: { en: 'Zaatar', ar: 'زعتر' },
        description: {
          en: 'United States Based Restaurant',
          ar: 'مطعم في الولايات المتحدة',
        },
        image: '/images/work/zaatar.jpg',
      },
      {
        id: 'tour-4-arabs',
        name: { en: 'Tour 4 Arabs', ar: 'تور فور آرابز' },
        description: {
          en: 'Tourism Agency in Turkey',
          ar: 'وكالة سياحية في تركيا',
        },
        image: '/images/work/tour-4-arabs.jpg',
      },
      {
        id: 'este-pearl',
        name: { en: 'Este Pearl', ar: 'إستي بيرل' },
        description: {
          en: 'Hair Transplant Clinic',
          ar: 'عيادة زراعة الشعر',
        },
        image: '/images/work/este-pearl.jpg',
      },
    ],
  },
  {
    id: 'funnels',
    title: { en: 'Sales Funnel', ar: 'مسارات البيع' },
    projects: [
      {
        id: 'jihan-fawaz',
        name: { en: 'Jihan Fawaz', ar: 'جيهان فواز' },
        description: {
          en: 'Business Development',
          ar: 'تطوير الأعمال',
        },
        image: '/images/work/jihan-fawaz.jpg',
      },
      {
        id: 'fatima-ibrahim',
        name: { en: 'Fatima Ibrahim', ar: 'فاطمة إبراهيم' },
        description: {
          en: 'Leadership Coaching',
          ar: 'التدريب القيادي',
        },
        image: '/images/work/fatima-ibrahim.jpg',
      },
    ],
  },
]
/*
  Web-sized copies of every project image live in public/images/work/web
  (720 px and 1400 px wide WebP). The originals stay where they are and are
  used as a fallback if a web copy is missing.
*/
const webCopy = (src: string, width: 720 | 1400) =>
  src
    .replace('/images/work/', '/images/work/web/')
    .replace(/\.\w+$/, `-${width}.webp`)
/* One complete image per project, without cropping. */
function PortfolioImage({ project }: { project: PortfolioProject }) {
  const { tr } = useLang()
  const [source, setSource] = useState<'web' | 'original' | 'failed'>('web')
  return (
    <div className="sw-frame group/frame relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_26px_60px_-30px_rgba(5,23,70,0.5)] ring-1 ring-[#051746]/10">
      {source === 'failed' ? (
        <p className="px-6 text-center text-sm text-[#051746]/60">
          {tr({
            en: 'Project image unavailable',
            ar: 'صورة المشروع غير متوفرة',
          })}
        </p>
      ) : (
        <img
          src={source === 'web' ? webCopy(project.image, 1400) : project.image}
          srcSet={
            source === 'web'
              ? `${webCopy(project.image, 720)} 720w, ${webCopy(project.image, 1400)} 1400w`
              : undefined
          }
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
          alt={`${tr(project.name)} — ${tr(project.description)}`}
          loading="lazy"
          decoding="async"
          onError={() => setSource((current) => (current === 'web' ? 'original' : 'failed'))}
          className="h-full w-full object-contain transition-transform duration-700 ease-out motion-safe:group-hover/frame:scale-[1.04]"
        />
      )}
    </div>
  )
}
/*
  Styles for the Selected Work "studio wall".
  A light wall, dark tiles. Each tile carries a fanned stack of the real work
  in that discipline; the stack spreads when the tile is hovered or focused.
*/
const studioStyles = `
.sw {
  --sw-navy: #051746;
  --sw-signal: #f6620d;
  background: #f3f5fa;
  color: var(--sw-navy);
}
.sw-grid-bg {
  position: absolute; inset: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(5,23,70,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(5,23,70,.06) 1px, transparent 1px);
  background-size: 72px 72px;
  -webkit-mask-image: radial-gradient(ellipse 90% 70% at 72% 0%, #000 0%, transparent 72%);
  mask-image: radial-gradient(ellipse 90% 70% at 72% 0%, #000 0%, transparent 72%);
}
.sw-glow {
  position: absolute; left: 0; top: 0;
  width: 46vmax; height: 46vmax; margin: -23vmax 0 0 -23vmax;
  border-radius: 50%; pointer-events: none; will-change: transform;
  background: radial-gradient(circle, rgba(246,98,13,.22), rgba(246,98,13,0) 62%);
}
.sw-ghost {
  position: absolute; left: 0; top: clamp(2.5rem, 7vw, 6rem);
  white-space: nowrap; pointer-events: none; user-select: none; will-change: transform;
  font-weight: 800; line-height: 1; letter-spacing: -.04em; text-transform: uppercase;
  font-size: clamp(6rem, 17vw, 17rem);
  color: transparent; -webkit-text-stroke: 1px rgba(5,23,70,.1);
}
.sw-ghost b { font-weight: inherit; -webkit-text-stroke-color: rgba(246,98,13,.38); }
[dir='rtl'] .sw-ghost { letter-spacing: 0; line-height: 1.5; font-size: clamp(5rem, 13vw, 13rem); }
.sw-line { display: block; overflow: hidden; padding-block: .08em; margin-block: -.08em; }
[dir='rtl'] .sw-line { padding-block: .2em; margin-block: -.2em; }
.sw-line > span { display: block; will-change: transform; }
.sw-card {
  --rx: 0deg; --ry: 0deg; --mx: 50%; --my: 100%;
  position: relative; display: block; width: 100%;
  text-align: start; border-radius: 1.75rem; perspective: 1100px;
}
.sw-card:focus-visible { outline: 2px solid var(--sw-signal); outline-offset: 6px; }
.sw-card-in {
  position: relative; display: flex; flex-direction: column;
  height: 100%; min-height: 24rem; overflow: hidden; border-radius: inherit;
  color: #fff;
  background: linear-gradient(160deg, #0a2466 0%, #051746 55%, #030e2e 100%);
  box-shadow: 0 30px 60px -34px rgba(5,23,70,.6);
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s cubic-bezier(.16,1,.3,1);
}
.sw-card:hover .sw-card-in, .sw-card:focus-visible .sw-card-in { box-shadow: 0 46px 80px -30px rgba(5,23,70,.75); }
.sw-card-glow {
  position: absolute; inset: 0; opacity: 0; transition: opacity .5s;
  background: radial-gradient(440px circle at var(--mx) var(--my), rgba(246,98,13,.34), transparent 60%);
}
.sw-card:hover .sw-card-glow, .sw-card:focus-visible .sw-card-glow { opacity: 1; }
.sw-stack { position: relative; display: block; height: clamp(11.5rem, 19vw, 15rem); margin-top: 1.5rem; }
.sw-shot { position: absolute; left: 50%; top: 50%; display: block; width: min(56%, 17rem); aspect-ratio: 4 / 3; }
.sw-shot-in {
  display: block; width: 100%; height: 100%; overflow: hidden;
  border-radius: .7rem; background: #fff;
  box-shadow: 0 18px 40px -14px rgba(0,0,0,.6);
  transition: transform .75s cubic-bezier(.16,1,.3,1);
}
.sw-shot-in img { display: block; width: 100%; height: 100%; object-fit: cover; }
.sw-shot-l .sw-shot-in { transform: translate(-84%, -50%) rotate(-10deg); }
.sw-shot-r .sw-shot-in { transform: translate(-16%, -46%) rotate(8deg); }
.sw-shot-c .sw-shot-in { transform: translate(-50%, -42%) rotate(-2deg); }
.sw-card:hover .sw-shot-l .sw-shot-in, .sw-card:focus-visible .sw-shot-l .sw-shot-in { transform: translate(-106%, -56%) rotate(-15deg); }
.sw-card:hover .sw-shot-r .sw-shot-in, .sw-card:focus-visible .sw-shot-r .sw-shot-in { transform: translate(6%, -52%) rotate(13deg); }
.sw-card:hover .sw-shot-c .sw-shot-in, .sw-card:focus-visible .sw-shot-c .sw-shot-in { transform: translate(-50%, -50%) rotate(0deg) scale(1.07); }
.sw-card-body { position: relative; display: flex; flex-direction: column; flex: 1; padding: 1.5rem 1.75rem 1.6rem; }
.sw-card-title { display: block; margin: .6rem 0 1.4rem; font-weight: 600; line-height: 1.05; letter-spacing: -.03em; font-size: clamp(1.9rem, 2.7vw, 2.7rem); }
[dir='rtl'] .sw-card-title { letter-spacing: 0; line-height: 1.4; }
.sw-card-foot {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-top: auto; padding-top: 1.1rem; border-top: 1px solid rgba(255,255,255,.16);
  font-size: .8rem; font-weight: 600; letter-spacing: .16em; text-transform: uppercase;
  transition: border-color .5s;
}
[dir='rtl'] .sw-card-foot { letter-spacing: 0; font-size: .95rem; }
.sw-card:hover .sw-card-foot, .sw-card:focus-visible .sw-card-foot { border-top-color: var(--sw-signal); }
.sw-card-arrow {
  display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.3); font-size: 1.1rem;
  transition: background-color .5s, border-color .5s, transform .5s cubic-bezier(.16,1,.3,1);
}
.sw-card:hover .sw-card-arrow, .sw-card:focus-visible .sw-card-arrow { background: var(--sw-signal); border-color: var(--sw-signal); transform: scale(1.08); }
@media (prefers-reduced-motion: reduce) {
  .sw-card-in, .sw-shot-in { transition: none; transform: none; }
  .sw-shot-l .sw-shot-in { transform: translate(-84%, -50%) rotate(-10deg); }
  .sw-shot-r .sw-shot-in { transform: translate(-16%, -46%) rotate(8deg); }
  .sw-shot-c .sw-shot-in { transform: translate(-50%, -42%) rotate(-2deg); }
}
`
function CategoryCard({
  category,
  index,
  count,
  setRef,
  className,
}: {
  category: WorkCategory
  index: number
  count: string
  setRef: (element: HTMLAnchorElement | null) => void
  className: string
}) {
  const { tr, rtl } = useLang()
  const shots = category.projects.slice(0, 3)
  const fan = shots.length === 2 ? ['sw-shot-l', 'sw-shot-c'] : ['sw-shot-l', 'sw-shot-r', 'sw-shot-c']
  // Mouse only: the tile leans toward the cursor and its glow follows it.
  const lean = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== 'mouse') return
    const tile = event.currentTarget
    const box = tile.getBoundingClientRect()
    const px = (event.clientX - box.left) / box.width - 0.5
    const py = (event.clientY - box.top) / box.height - 0.5
    tile.style.setProperty('--ry', `${(px * 7).toFixed(2)}deg`)
    tile.style.setProperty('--rx', `${(-py * 7).toFixed(2)}deg`)
    tile.style.setProperty('--mx', `${((px + 0.5) * 100).toFixed(1)}%`)
    tile.style.setProperty('--my', `${((py + 0.5) * 100).toFixed(1)}%`)
  }
  const settle = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty('--ry', '0deg')
    event.currentTarget.style.setProperty('--rx', '0deg')
  }
  return (
    <a
      ref={setRef}
      href={`/work/${category.id}`}
      onPointerMove={lean}
      onPointerLeave={settle}
      aria-label={`${tr(category.title)} — ${count}`}
      className={`sw-card ${className}`}
    >
      <span className="sw-card-in">
        <span className="sw-card-glow" aria-hidden="true" />
        <span className="sw-stack" aria-hidden="true">
          {shots.map((project, i) => (
            <span key={project.id} className={`sw-shot ${fan[i]}`}>
              <span className="sw-shot-in">
                <img
                  src={webCopy(project.image, 720)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    const image = event.currentTarget
                    if (image.dataset.fallback) return
                    image.dataset.fallback = '1'
                    image.src = project.image
                  }}
                />
              </span>
            </span>
          ))}
        </span>
        <span className="sw-card-body">
          <span className="flex items-center gap-3 text-xs tracking-wide text-white/55">
            <span className="latin tabular-nums text-signal">{String(index + 1).padStart(2, '0')}</span>
            <span aria-hidden="true">·</span>
            <span>{count}</span>
          </span>
          <span className="sw-card-title">{tr(category.title)}</span>
          <span className="sw-card-foot">
            <span>{tr({ en: 'Explore', ar: 'استكشف' })}</span>
            <span className="sw-card-arrow" aria-hidden="true">
              {rtl ? '←' : '→'}
            </span>
          </span>
        </span>
      </span>
    </a>
  )
}
/*
 * Credibility / company track record.
 * Reveals when scrolled into view, with eased counters and staggered cards.
 * Uses built-in browser APIs only (no additional animation dependency).
 */
const credibilityStats = [
  {
    value: 25,
    suffix: '+',
    label: { en: 'Years Experience', ar: 'سنوات من الخبرة' },
  },
  {
    value: 4500,
    suffix: '+',
    label: { en: 'Projects Delivered', ar: 'مشروع تم إنجازه' },
  },
  {
    value: 1200,
    suffix: '+',
    label: { en: 'Clients Served', ar: 'عميل تم خدمته' },
  },
  {
    value: 13,
    suffix: '',
    label: { en: 'Countries', ar: 'دولة' },
  },
] satisfies { value: number; suffix: string; label: Localized }[]
function useRevealOnScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.13, rootMargin: '0px 0px -5% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}
function AnimatedCounter({
  target,
  suffix,
  play,
  delay = 0,
}: {
  target: number
  suffix: string
  play: boolean
  delay?: number
}) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!play) return
    const reducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (reducedMotion) {
      setCurrent(target)
      return
    }
    let frame = 0
    let startTime: number | null = null
    const duration = 1750
    const animate = (time: number) => {
      if (startTime === null) startTime = time
      const elapsed = Math.max(0, time - startTime - delay)
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 4)
      setCurrent(Math.round(target * eased))
      if (progress < 1) {
        frame = window.requestAnimationFrame(animate)
      }
    }
    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [target, play, delay])
  const format = (value: number) => value.toLocaleString('en-US') + suffix
  return (
    <>
      <span aria-hidden="true">{format(current)}</span>
      <span className="sr-only">{format(target)}</span>
    </>
  )
}
export function Credibility() {
  const { tr, rtl } = useLang()
  const header = useRevealOnScroll<HTMLDivElement>()
  const metrics = useRevealOnScroll<HTMLDListElement>()
  const revealClass = (visible: boolean) =>
    `motion-safe:transition-[opacity,transform] motion-safe:duration-700 motion-safe:ease-out ${
      visible
        ? 'translate-y-0 opacity-100'
        : 'motion-safe:translate-y-8 motion-safe:opacity-0'
    } motion-reduce:translate-y-0 motion-reduce:opacity-100`
  return (
    <section
      id="credibility"
      dir={rtl ? 'rtl' : 'ltr'}
      aria-labelledby="credibility-title"
      className="section relative isolate scroll-mt-24 overflow-hidden bg-[#06143a]"
    >
      {/* Subtle ambient lighting that matches the site palette. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_15%,rgba(255,106,0,0.10),transparent_38%),radial-gradient(ellipse_at_10%_100%,rgba(37,99,235,0.18),transparent_45%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <div className="wrap relative py-4 sm:py-8">
        <div
          ref={header.ref}
          className={`grid items-end gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 ${revealClass(header.visible)}`}
        >
          <div>
            <p className="eyebrow mb-6 inline-flex items-center gap-3 text-signal">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_14px_rgba(255,106,0,0.70)]"
              />
              {tr({ en: 'Credibility', ar: 'المصداقية' })}
            </p>
            <h2
              id="credibility-title"
              className="max-w-[15ch] text-[clamp(2.8rem,6.2vw,6.1rem)] font-light leading-[1.03] tracking-tight text-white rtl:max-w-none rtl:leading-tight rtl:tracking-normal"
            >
              {tr({ en: 'Built on decades', ar: 'خبرة تمتد' })}{' '}
              <span className="font-semibold">
                {tr({ en: 'of craft', ar: 'لعقود من الإبداع' })}
                <span className="text-signal">.</span>
              </span>
            </h2>
          </div>
          <p className="max-w-[58ch] text-base leading-[1.85] text-white/65 sm:text-lg lg:pb-2">
            {tr({
              en: 'Creative Mind is built on more than 25 years of experience across branding, advertising, marketing, digital experiences, print production, automation, and business growth initiatives throughout the Middle East and beyond.',
              ar: 'ترتكز كرييتف مايند على أكثر من 25 عامًا من الخبرة في بناء العلامات التجارية والإعلان والتسويق والتجارب الرقمية والإنتاج الطباعي والأتمتة ومبادرات نمو الأعمال في الشرق الأوسط وخارجه.',
            })}
          </p>
        </div>
        <dl
          ref={metrics.ref}
          className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4 lg:mt-20 lg:grid-cols-4"
        >
          {credibilityStats.map((stat, index) => (
            <div
              key={stat.label.en}
              className={`min-w-0 ${revealClass(metrics.visible)}`}
              style={{
                transitionDelay: metrics.visible ? `${index * 115}ms` : '0ms',
              }}
            >
              <div className="group relative flex h-full min-h-[175px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-6 transition-[transform,border-color,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-signal/45 hover:bg-white/[0.06] hover:shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:min-h-[218px] sm:rounded-3xl sm:px-7 sm:py-8 motion-reduce:transform-none">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-signal/70 via-signal/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100 rtl:bg-gradient-to-l"
                />
                <div
                  aria-hidden="true"
                  className="absolute -end-12 -top-16 h-32 w-32 rounded-full bg-signal/[0.055] blur-3xl transition-colors duration-300 group-hover:bg-signal/[0.11]"
                />
                <div className="relative flex items-center justify-between">
                  <span className="latin text-xs font-medium tracking-[0.16em] text-white/35">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                </div>
                <div className="relative mt-7 flex flex-col">
                  <dt className="order-2 mt-3 text-xs font-medium uppercase leading-relaxed tracking-[0.08em] text-white/60 sm:text-sm rtl:tracking-normal">
                    {tr(stat.label)}
                  </dt>
                  <dd className="latin order-1 whitespace-nowrap text-[clamp(1.7rem,5.6vw,4.25rem)] font-semibold leading-none tracking-[-0.055em] text-white tabular-nums">
                    <AnimatedCounter
                      target={stat.value}
                      suffix={stat.suffix}
                      play={metrics.visible}
                      delay={index * 115}
                    />
                  </dd>
                </div>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
export function Work({ categoryId }: { categoryId?: string } = {}) {
  const { tr, rtl, lang } = useLang()
  const activeId = categoryId ?? null
  const sectionRef = useRef<HTMLElement>(null)
  const categoryHeadingRef = useRef<HTMLHeadingElement>(null)
  const categoryButtons = useRef<Record<string, HTMLAnchorElement | null>>({})
  const activeCategory = workCategories.find((category) => category.id === activeId)
  const totalProjects = workCategories.reduce((sum, category) => sum + category.projects.length, 0)
  const projectCount = (count: number) =>
    tr({
      en: `${count} projects`,
      ar:
        count === 1
          ? 'مشروع واحد'
          : count === 2
            ? 'مشروعان'
            : count <= 10
              ? `${count} مشاريع`
              : `${count} مشروعًا`,
    })
  // Ambient motion: the glow drifts toward the cursor, the outlined words slide
  // with the scroll, and the headline rises out of its mask once.
  useGsap(
    sectionRef,
    () => {
      const section = sectionRef.current
      if (!section || prefersReduced()) return
      gsap.from('.sw-line > span', {
        yPercent: 115,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      })
      gsap.from('.sw-intro', {
        opacity: 0,
        y: 24,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: section, start: 'top 66%', once: true },
      })
      gsap.fromTo(
        '.sw-ghost',
        { xPercent: rtl ? -22 : 4 },
        {
          xPercent: rtl ? 4 : -22,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
        },
      )
      const glow = section.querySelector<HTMLElement>('.sw-glow')
      if (!glow) return
      gsap.set(glow, { x: section.offsetWidth * (rtl ? 0.18 : 0.82), y: 160 })
      if (!window.matchMedia('(hover: hover)').matches) return
      const moveX = gsap.quickTo(glow, 'x', { duration: 1.4, ease: 'power3.out' })
      const moveY = gsap.quickTo(glow, 'y', { duration: 1.4, ease: 'power3.out' })
      const follow = (event: PointerEvent) => {
        const box = section.getBoundingClientRect()
        moveX(event.clientX - box.left)
        moveY(event.clientY - box.top)
      }
      section.addEventListener('pointermove', follow)
      return () => section.removeEventListener('pointermove', follow)
    },
    [lang],
  )
  // The tiles (or the opened discipline's projects) arrive each time the view changes.
  useGsap(
    sectionRef,
    () => {
      if (prefersReduced()) return
      if (activeId) {
        gsap.from('.sw-detail-head > *', { opacity: 0, y: 26, duration: 0.8, ease: 'power3.out', stagger: 0.07 })
        gsap.from('.sw-project', {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'expo.out',
          stagger: 0.1,
          delay: 0.1,
        })
        gsap.from('.sw-project .sw-frame', {
          clipPath: 'inset(100% 0% 0% 0%)',
          duration: 1.2,
          ease: 'expo.inOut',
          stagger: 0.1,
          clearProps: 'clipPath',
        })
        return
      }
      const tiles = gsap.utils.toArray<HTMLElement>('.sw-card')
      const trigger = { trigger: '.sw-tiles', start: 'top 82%', once: true }
      gsap.from(tiles, {
        opacity: 0,
        y: 90,
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.09,
        scrollTrigger: trigger,
        clearProps: 'transform',
      })
      // Each stack starts as one pile and deals itself out into the fan.
      tiles.forEach((tile, index) => {
        gsap.from(tile.querySelectorAll('.sw-shot'), {
          opacity: 0,
          yPercent: 70,
          scale: 0.7,
          rotate: () => gsap.utils.random(-18, 18),
          duration: 1.1,
          ease: 'back.out(1.5)',
          stagger: 0.08,
          delay: 0.25 + index * 0.09,
          scrollTrigger: trigger,
        })
      })
    },
    [activeId, lang],
  )
  const ghostWords = workCategories.map((category) => tr(category.title))
  return (
    <>
      <style>{studioStyles}</style>
      <section
        ref={sectionRef}
        id="selected-work"
        dir={rtl ? 'rtl' : 'ltr'}
        aria-labelledby={activeId ? "category-title" : "selected-work-title"}
        className={`sw section relative scroll-mt-24 overflow-hidden ${activeId ? "min-h-screen pt-32" : ""}`}
      >
        {/* Studio wall: drafting grid, a warm light that follows the cursor, outlined discipline names. */}
        <div className="sw-grid-bg" aria-hidden="true" />
        <div className="sw-glow" aria-hidden="true" />
        <p className="sw-ghost" aria-hidden="true" dir="ltr">
          {ghostWords.map((word, index) => (
            <span key={word}>
              {word}
              <b> {index === ghostWords.length - 1 ? '' : '· '}</b>
            </span>
          ))}
        </p>
        <div className="wrap relative">
          {!activeId && <header className="mb-12 grid items-end gap-8 sm:mb-16 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="sw-intro eyebrow mb-6 flex items-center gap-3 text-signal">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal" />
                {tr({ en: 'Selected work', ar: 'أعمال مختارة' })}
              </p>
              <h2
                id="selected-work-title"
                className="max-w-[15ch] text-[clamp(2.8rem,6.5vw,6.5rem)] font-light leading-[1.02] tracking-tight rtl:max-w-none rtl:leading-tight rtl:tracking-normal"
              >
                <span className="sw-line">
                  <span>{tr({ en: 'A look inside', ar: 'نظرة داخل' })}</span>
                </span>
                <span className="sw-line">
                  <span className="font-semibold">
                    {tr({ en: 'the studio', ar: 'الاستوديو' })}
                    <span className="text-signal">.</span>
                  </span>
                </span>
              </h2>
              <p className="sw-intro mt-6 text-base leading-relaxed text-[#051746]/65 sm:text-lg">
                {tr({
                  en: 'Curated work across five disciplines.',
                  ar: 'أعمال منتقاة عبر خمسة تخصصات.',
                })}
              </p>
            </div>
            <dl className="sw-intro flex gap-10 border-t border-[#051746]/15 pt-5 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0">
              <div>
                <dd className="latin text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {String(workCategories.length).padStart(2, '0')}
                </dd>
                <dt className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#051746]/55 rtl:tracking-normal">
                  {tr({ en: 'Disciplines', ar: 'تخصصات' })}
                </dt>
              </div>
              <div>
                <dd className="latin text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
                  {totalProjects}
                </dd>
                <dt className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-[#051746]/55 rtl:tracking-normal">
                  {tr({ en: 'Projects shown', ar: 'مشروعًا معروضًا' })}
                </dt>
              </div>
            </dl>
          </header>}
          {!activeCategory ? (
            <div className="sw-tiles grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              {workCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  count={projectCount(category.projects.length)}
                  setRef={(element) => {
                    categoryButtons.current[category.id] = element
                  }}
                  // Three tiles on the first row, two wider ones on the second.
                  className={
                    index < 3
                      ? 'lg:col-span-2'
                      : index === workCategories.length - 1
                        ? 'md:col-span-2 lg:col-span-3'
                        : 'lg:col-span-3'
                  }
                />
              ))}
            </div>
          ) : (
            <div key={activeCategory.id}>
              <div className="sw-detail-head">
                <a
                  href="/#selected-work"
                  className="group/back mb-8 inline-flex items-center gap-3 rounded-full border border-[#051746]/20 py-2.5 ps-3 pe-5 text-sm font-medium text-[#051746] transition-colors hover:border-signal hover:bg-signal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 place-items-center rounded-full bg-[#051746] text-white transition-colors group-hover/back:bg-white group-hover/back:text-signal"
                  >
                    {rtl ? '→' : '←'}
                  </span>
                  {tr({ en: 'Back to home', ar: 'العودة إلى الصفحة الرئيسية' })}
                </a>
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#051746]/15 pb-6">
                  <h1
                    id="category-title"
                    ref={categoryHeadingRef}
                    tabIndex={-1}
                    style={{ outline: 'none' }}
                    className="text-4xl font-semibold tracking-tight sm:text-6xl rtl:tracking-normal"
                  >
                    {tr(activeCategory.title)}
                    <span className="text-signal">.</span>
                  </h1>
                  <p className="text-sm text-[#051746]/55">{projectCount(activeCategory.projects.length)}</p>
                </div>
              </div>
              <div
                className={`grid items-start gap-x-6 gap-y-12 md:grid-cols-2 ${
                  activeCategory.projects.length > 2 ? 'xl:grid-cols-3' : ''
                }`}
              >
                {activeCategory.projects.map((project, index) => (
                  <article key={project.id} className="sw-project min-w-0">
                    <PortfolioImage project={project} />
                    <div className="flex gap-4 px-1 pt-5">
                      <span className="latin pt-1.5 text-xs font-medium text-signal tabular-nums">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="text-xl font-semibold leading-snug sm:text-2xl">{tr(project.name)}</h4>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#051746]/60">{tr(project.description)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      {!activeId && <Credibility />}
    </>
  )
}
