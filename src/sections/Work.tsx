import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getLenis } from '../lib/gsap'
import { useLang } from '../lib/i18n'
import { jumpTo } from '../lib/scroll'

type Localized = {
  en: string
  ar: string
}

type PortfolioProject = {
  id: string
  name: Localized
  description: Localized
  image: string
  optimized?: boolean
}

type WorkCategory = {
  id: string
  title: Localized
  projects: PortfolioProject[]
  collections?: WorkCategory[]
}

/*
  Files inside public are referenced without "/public".

  public/images/work/sbat-branding.jpg
  becomes:
  /images/work/sbat-branding.jpg
*/

const existingWorkCategories: WorkCategory[] = [
  {
    id: 'branding',
    title: { en: 'Branding', ar: 'الهوية البصرية' },
    projects: [
      {
        id: 'sbat',
        name: {
          en: 'SBAT Branding',
          ar: 'هوية إس بات',
        },
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
        name: {
          en: 'Brooj Branding',
          ar: 'هوية بروج',
        },
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
    title: {
      en: 'Printing Design',
      ar: 'تصميم المطبوعات',
    },
    projects: [
      {
        id: 'economic-vision',
        name: {
          en: 'Economic Vision',
          ar: 'الرؤية الاقتصادية',
        },
        description: {
          en: 'Saudi Economic Magazine',
          ar: 'مجلة اقتصادية سعودية',
        },
        image: '/images/work/economic-vision.jpg',
      },
      {
        id: 'saudi-aramco',
        name: {
          en: 'Saudi Aramco',
          ar: 'أرامكو السعودية',
        },
        description: {
          en: 'Printing Design',
          ar: 'تصميم المطبوعات',
        },
        image: '/images/work/saudi-aramco.jpg',
      },
      {
        id: 'super-fiber',
        name: {
          en: 'Super Fiber',
          ar: 'سوبر فايبر',
        },
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
    title: {
      en: 'Social Media',
      ar: 'التواصل الاجتماعي',
    },
    projects: [
      {
        id: 'flamingo',
        name: {
          en: 'Flamingo',
          ar: 'فلامينغو',
        },
        description: {
          en: 'Istanbul Tourism',
          ar: 'السياحة في إسطنبول',
        },
        image: '/images/work/flamingo.jpg',
      },
      {
        id: 'baazex',
        name: {
          en: 'BaazEx',
          ar: 'باز إكس',
        },
        description: {
          en: 'Online Trading',
          ar: 'التداول عبر الإنترنت',
        },
        image: '/images/work/baazex.jpg',
      },
      {
        id: 'abc-horizon',
        name: {
          en: 'ABC Horizon',
          ar: 'إيه بي سي هورايزون',
        },
        description: {
          en: 'Person UK University College',
          ar: 'كلية بيرسون الجامعية في المملكة المتحدة',
        },
        image: '/images/work/abc-horizon.jpg',
      },
    ],
  },
  {
    id: 'web',
    title: {
      en: 'Web design',
      ar: 'تصميم المواقع',
    },
    projects: [
      {
        id: 'zaatar',
        name: {
          en: 'Zaatar',
          ar: 'زعتر',
        },
        description: {
          en: 'United States Based Restaurant',
          ar: 'مطعم في الولايات المتحدة',
        },
        image: '/images/work/zaatar.jpg',
      },
      {
        id: 'tour-4-arabs',
        name: {
          en: 'Tour 4 Arabs',
          ar: 'تور فور آرابز',
        },
        description: {
          en: 'Tourism Agency in Turkey',
          ar: 'وكالة سياحية في تركيا',
        },
        image: '/images/work/tour-4-arabs.jpg',
      },
      {
        id: 'este-pearl',
        name: {
          en: 'Este Pearl',
          ar: 'إستي بيرل',
        },
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
    title: {
      en: 'Sales Funnel',
      ar: 'مسارات البيع',
    },
    projects: [
      {
        id: 'jihan-fawaz',
        name: {
          en: 'JIHAN FAWAZ',
          ar: 'جيهان فواز',
        },
        description: {
          en: 'Business Development',
          ar: 'تطوير الأعمال',
        },
        image: '/images/work/jihan-fawaz.jpg',
      },
      {
        id: 'fatima-ibrahim',
        name: {
          en: 'FATIMA IBRAHIM',
          ar: 'فاطمة إبراهيم',
        },
        description: {
          en: 'Leadership Coaching',
          ar: 'التدريب القيادي',
        },
        image: '/images/work/fatima-ibrahim.jpg',
      },
    ],
  },
]

// Each row is:
// [filename, English project name, Arabic project name]
//
// Paths are relative to public/images/work.
// Add another row to add more work.

function projectsFromFiles(
  folder: string,
  prefix: string,
  files: readonly (readonly [string, string, string])[],
): PortfolioProject[] {
  return files.map(([filename, en, ar], index) => ({
    id: `${prefix}-${index + 1}`,
    name: { en, ar },
    description: { en: '', ar: '' },
    image: `/images/work/${folder}/${filename}`,
    optimized: true,
  }))
}

export const brandingCollections: WorkCategory[] = [
  {
    id: 'bags',
    title: { en: 'Bags', ar: 'الأكياس' },
    projects: projectsFromFiles('branding/bags', 'bag', [
      ['Bag-01.jpg', 'Bag project 01', 'مشروع أكياس 01'],
      ['Bag-02.jpg', 'SCS', 'إس سي إس'],
      ['Bag-03.jpg', 'Saudi Aramco', 'أرامكو السعودية'],
    ]),
  },
  {
    id: 'brochure',
    title: { en: 'Brochure', ar: 'البروشورات' },
    projects: projectsFromFiles('branding/brochure', 'brochure', [
      ['Brochure_Bifold-01.jpg', 'KHAN AL SABOON', 'خان الصابون'],
      ['Brochure_Bifold-02.jpg', 'HMO', 'إتش إم أو'],
      ['Brochure_Bifold-03.jpg', 'ABBOTT', 'أبوت'],
    ]),
  },
  {
    id: 'rollup',
    title: { en: 'Roll-up', ar: 'لوحات رول أب' },
    projects: projectsFromFiles('branding/rollup', 'rollup', [
      ['Rollup-01.jpg', 'SAUDI ARAMCO', 'أرامكو السعودية'],
      ['Rollup-02.jpg', 'BARLEY MIX', 'بارلي ميكس'],
      [
        'Rollup-03.jpg',
        'SCS X SAUDI ARAMCO',
        'إس سي إس × أرامكو السعودية',
      ],
      ['Rollup-04.jpg', 'SIMILAC', 'سيميلاك'],
      ['Rollup-05.jpg', 'ABBOTT', 'أبوت'],
    ]),
  },
  {
    id: 'company-profile',
    title: {
      en: 'Company Profile',
      ar: 'الملفات التعريفية',
    },
    projects: projectsFromFiles(
      'branding/company profile',
      'company-profile',
      [
        ['Co-Pro-01.jpg', 'MIM', 'ميم'],
        ['Co-Profile-01.jpg', 'WEQAYAT WATAN', 'وقاية وطن'],
        ['Co-Profile-02.jpg', 'SCS', 'إس سي إس'],
        ['Company-Pro-02.jpg', 'SNASCO', 'سناسكو'],
        ['Branding Identity MockUp Vol6.jpg', 'MIRA CARE', 'ميرا كير'],
        ['Branding-01.jpg', 'IMDAD TURKI', 'إمداد تركي'],
        ['Identity.jpg', 'DMASS SOMY', 'دماس سومي'],
        ['photo_2019-08-18_22-57-43.jpg', 'BARELY MIX', 'بارلي ميكس'],
      ],
    ),
  },
  {
    id: 'magazine',
    title: { en: 'Magazine', ar: 'المجلات' },
    projects: projectsFromFiles('branding/magazine', 'magazine', [
      ['MAG-01.jpg', 'TOUJAR AL MAMLAKA', 'تجار المملكة'],
      ['MAG-02.jpg', 'ECONOMIC VISION', 'الرؤية الاقتصادية'],
      [
        'MAG-03.jpg',
        'AL IKTISADIYAH AL AALAMIYAH',
        'الاقتصادية العالمية',
      ],
    ]),
  },
  {
    id: 'packaging',
    title: { en: 'Packaging', ar: 'التغليف' },
    projects: projectsFromFiles('branding/packaging', 'packaging', [
      ['BOX 01.png', 'ENSURE', 'إنشور'],
      ['BOX 02.png', 'TOUCH CARE', 'تاتش كير'],
      ['Box1.jpg', 'NESTLE', 'نستله'],
      ['i24.jpg', 'HEPCO', 'هيبكو'],
      ['Mockup2.jpg', 'ZAHRAT BAN', 'زهرة بان'],
      ['Packaging1.jpg', 'SE7EB-BEES', 'سيحب بيز'],
      ['Screen Shot 2020-09-08 at 4.01.28 PM.png', 'FINE', 'فاين'],
    ]),
  },
  {
    id: 'signs',
    title: { en: 'Signs', ar: 'اللوحات' },
    projects: projectsFromFiles('branding/signs', 'sign', [
      ['o01.png', 'RED RUBY', 'ريد روبي'],
      ['o05.png', 'RED RUBY', 'ريد روبي'],
      ['o09.png', 'PANASONIC', 'باناسونيك'],
    ]),
  },
]

const threeDCategory: WorkCategory = {
  id: '3d',
  title: { en: '3D', ar: 'ثلاثي الأبعاد' },
  projects: projectsFromFiles('3D', '3d', [
    ['Fine-Stand (2) 2x1.jpg', 'FINE', 'فاين'],
    ['FSU2.jpg', 'PALMOLIVE', 'بالموليف'],
    ['LG -4.jpg', 'LG', 'إل جي'],
    ['Preview1.jpg', 'BARLEY MIX', 'بارلي ميكس'],
    ['Stand 1x1 (3).jpg', 'FINE', 'فاين'],
    ['Stand 3.jpg', 'COLGATE', 'كولجيت'],
    [
      'Stand2 2.jpg',
      'SAUDI DENTAL SOCIETY',
      'الجمعية السعودية لطب الأسنان',
    ],
    ['Stand3.jpg', 'BAYT SHAHD', 'بيت شهد'],
    ['Vis2.jpg', 'NESTLE FITNESS', 'نستله فيتنس'],
  ]),
}

const extraProjects: Record<string, PortfolioProject[]> = {
  social: projectsFromFiles('socialmedia', 'social-new', [
    ['FB-01.jpg', '2RAVEL', 'تو رافل'],
    ['Insta-02.jpg', 'FLAMINGO OF ISTANBUL', 'فلامينغو إسطنبول'],
  ]),
  web: projectsFromFiles('website', 'website-new', [
    ['Web Banner-03.jpg', 'A GRAND PETITE PAS', 'آ غراند بيتي با'],
    ['Web Banner-04.jpg', 'NOUH', 'نوح'],
    ['Web Banner-05.jpg', 'BABY RUB', 'بيبي راب'],
    ['Web Banner-06.jpg', 'COLGATE', 'كولجيت'],
    [
      'Web Banner-07.jpg',
      'TURKEY TOURS PLANENERS',
      'تركيا تورز بلانرز',
    ],
    ['Website-01.png', 'PRPERTY SUPERIORS', 'بروبرتي سوبيريورز'],
    ['Website-03.png', 'DND TOUR', 'دي إن دي تور'],
  ]),
  funnels: projectsFromFiles('funnel', 'funnel-new', [
    ['01-SalesLoop.jpg', 'SALES LOOP', 'سيلز لوب'],
    ['04-4tourisim.jpg', 'TOURISM', 'السياحة'],
    ['05-EstePearl.jpg', 'ESTE PEARL', 'إستي بيرل'],
    [
      '06-PropertySuperious.jpg',
      'PRPERTY SUPERIORS',
      'بروبرتي سوبيريورز',
    ],
    ['09-Taj Clinics.jpg', 'TAJ CLINCS', 'عيادات تاج'],
    ['10-SMO.jpg', 'SMO FUNNEL', 'مسار مبيعات إس إم أو'],
  ]),
}

export const workCategories: WorkCategory[] =
  existingWorkCategories.flatMap((category) => {
    const updated: WorkCategory = {
      ...category,
      projects: [
        ...category.projects.map((project) => ({
          ...project,
          optimized: true,
        })),
        ...(extraProjects[category.id] ?? []),
      ],
      ...(category.id === 'branding'
        ? { collections: brandingCollections }
        : {}),
    }

    return category.id === 'branding'
      ? [updated, threeDCategory]
      : [updated]
  })

function allProjects(category: WorkCategory): PortfolioProject[] {
  return [
    ...category.projects,
    ...(category.collections ?? []).flatMap(allProjects),
  ]
}

// Encode filename segments while preserving folder separators.

const imageUrl = (src: string) =>
  src.split('/').map(encodeURIComponent).join('/')

// App's router reads the query and passes collectionId.

function collectionHref(categoryId: string, collectionId: string) {
  return `/work/${categoryId}?collection=${encodeURIComponent(collectionId)}`
}

/*
  Web-sized copies live in public/images/work/web:
  720 px and 1400 px wide WebP.

  Cards and grids use them; the viewer uses the original.
  Missing web copies fall back to the original.
*/

const webCopy = (src: string, width: 720 | 1400) =>
  src
    .replace('/images/work/', '/images/work/web/')
    .replace(/\.\w+$/, `-${width}.webp`)

function PortfolioImage({ project }: { project: PortfolioProject }) {
  const { tr } = useLang()

  const [source, setSource] = useState<
    'web' | 'original' | 'failed'
  >(project.optimized ? 'web' : 'original')

  return (
    <div className="sw-frame group/frame relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_26px_60px_-30px_rgba(5,23,70,0.5)] ring-1 ring-[#051746]/10">
      {source === 'failed' ? (
        <p className="px-6 text-center text-base font-semibold text-[#051746]/85">
          {tr({
            en: 'Project image unavailable',
            ar: 'صورة المشروع غير متوفرة',
          })}
        </p>
      ) : (
        <img
          src={imageUrl(
            source === 'web'
              ? webCopy(project.image, 1400)
              : project.image,
          )}
          srcSet={
            source === 'web'
              ? `${imageUrl(webCopy(project.image, 720))} 720w, ${imageUrl(webCopy(project.image, 1400))} 1400w`
              : undefined
          }
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 92vw"
          alt={[tr(project.name), tr(project.description)]
            .filter(Boolean)
            .join(' — ')}
          loading="lazy"
          decoding="async"
          onError={() =>
            setSource((current) =>
              current === 'web' ? 'original' : 'failed',
            )
          }
          className="h-full w-full object-contain"
        />
      )}
    </div>
  )
}

const studioStyles = `
.sw {
  --sw-navy:#051746;
  --sw-signal:#f6620d;
  background:#f3f5fa;
  color:var(--sw-navy);
}
.sw-grid-bg {
  position:absolute;
  inset:0;
  pointer-events:none;
  background-image:
    linear-gradient(rgba(5,23,70,.035) 1px,transparent 1px),
    linear-gradient(90deg,rgba(5,23,70,.035) 1px,transparent 1px);
  background-size:72px 72px;
}
.sw-glow, .sw-ghost, .sw-card-glow { display:none; }
.sw-line { display:block; padding-block:.08em; }
[dir='rtl'] .sw-line { padding-block:.15em; }
.sw-line > span { display:block; }

.sw-card {
  display:block;
  width:100%;
  text-align:start;
  border-radius:1.75rem;
}
.sw-card:focus-visible,
.sw-project-open:focus-visible {
  outline:3px solid var(--sw-signal);
  outline-offset:5px;
}
.sw-card-in {
  display:flex;
  flex-direction:column;
  height:100%;
  min-height:24rem;
  overflow:hidden;
  border-radius:inherit;
  color:#fff;
  background:linear-gradient(160deg,#0a2466,#051746 65%,#030e2e);
  border:1px solid rgba(5,23,70,.12);
}
.sw-stack {
  position:relative;
  display:block;
  height:clamp(11.5rem,19vw,15rem);
  margin-top:1.5rem;
}
.sw-shot {
  position:absolute;
  left:50%;
  top:50%;
  display:block;
  width:min(56%,17rem);
  aspect-ratio:4 / 3;
}
.sw-shot-in {
  display:block;
  width:100%;
  height:100%;
  overflow:hidden;
  border-radius:.7rem;
  background:#fff;
  box-shadow:0 18px 40px -14px rgba(0,0,0,.6);
  transition:transform .75s cubic-bezier(.16,1,.3,1);
}
.sw-shot-in img {
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
}
@media (hover:hover) {
  .sw-shot-in {
    will-change:transform;
    backface-visibility:hidden;
  }
}
.sw-shot-l .sw-shot-in {
  transform:translate(-84%,-50%) rotate(-10deg);
}
.sw-shot-r .sw-shot-in {
  transform:translate(-16%,-46%) rotate(8deg);
}
.sw-shot-c .sw-shot-in {
  transform:translate(-50%,-42%) rotate(-2deg);
}
@media (hover:hover) and (prefers-reduced-motion:no-preference) {
  .sw-card:hover .sw-shot-l .sw-shot-in {
    transform:translate(-106%,-56%) rotate(-15deg);
  }
  .sw-card:hover .sw-shot-r .sw-shot-in {
    transform:translate(6%,-52%) rotate(13deg);
  }
  .sw-card:hover .sw-shot-c .sw-shot-in {
    transform:translate(-50%,-50%) rotate(0deg) scale(1.07);
  }
}
@media (prefers-reduced-motion:no-preference) {
  .sw-card:focus-visible .sw-shot-l .sw-shot-in {
    transform:translate(-106%,-56%) rotate(-15deg);
  }
  .sw-card:focus-visible .sw-shot-r .sw-shot-in {
    transform:translate(6%,-52%) rotate(13deg);
  }
  .sw-card:focus-visible .sw-shot-c .sw-shot-in {
    transform:translate(-50%,-50%) rotate(0deg) scale(1.07);
  }
  .sw-stack[data-revealed='false'] .sw-shot {
    opacity:0;
  }
  .sw-stack[data-revealed='true'] .sw-shot {
    animation:sw-deal .8s cubic-bezier(.16,1,.3,1) both;
  }
}
@keyframes sw-deal {
  from { opacity:0; transform:translateY(45px) scale(.82); }
  to { opacity:1; transform:translateY(0) scale(1); }
}
@media (prefers-reduced-motion:reduce) {
  .sw-shot-in { transition:none; }
}
.sw-card-body {
  display:flex;
  flex-direction:column;
  flex:1;
  padding:1.25rem 1.5rem;
}
.sw-card-title {
  display:block;
  margin:.6rem 0 1.25rem;
  font-weight:700;
  line-height:1.15;
  letter-spacing:-.03em;
  font-size:clamp(1.65rem,2.4vw,2.3rem);
}
[dir='rtl'] .sw-card-title {
  letter-spacing:0;
  line-height:1.4;
}
.sw-card-foot {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:1rem;
  margin-top:auto;
  padding-top:1rem;
  border-top:1px solid rgba(255,255,255,.16);
  font-size:1rem;
  font-weight:700;
}
.sw-card-arrow {
  display:grid;
  place-items:center;
  width:2.8rem;
  height:2.8rem;
  border-radius:50%;
  border:1px solid rgba(255,255,255,.3);
  font-size:1.3rem;
}
@media (hover:hover) {
  .sw-card:hover .sw-card-arrow {
    background:var(--sw-signal);
    border-color:var(--sw-signal);
  }
  .sw-project-open:hover .sw-open-label {
    text-decoration:underline;
  }
}
.sw-project-open {
  display:block;
  width:100%;
  border:0;
  padding:0;
  background:transparent;
  color:inherit;
  text-align:start;
  cursor:pointer;
  border-radius:1rem;
}
.sw-project {
  content-visibility:auto;
  contain-intrinsic-size:auto 420px;
}
.sw-frame { box-shadow:none!important; }

.sw-viewer {
  width:calc(100% - 24px);
  max-width:1200px;
  max-height:92vh;
  max-height:92dvh;
  margin:auto;
  padding:0;
  border:0;
  border-radius:16px;
  background:#fff;
  color:#051746;
  box-shadow:0 20px 70px rgba(0,0,0,.35);
}
.sw-viewer::backdrop { background:rgba(1,9,30,.87); }
.sw-viewer-head {
  display:flex;
  align-items:center;
  justify-content:space-between;
  flex-wrap:wrap;
  gap:12px;
  padding:16px 20px;
  border-bottom:1px solid #e3e7ee;
}
.sw-viewer-title {
  margin:0;
  font-size:clamp(1rem,2vw,1.4rem);
  font-weight:700;
}
.sw-viewer-controls {
  display:flex;
  align-items:center;
  gap:8px;
  flex-wrap:wrap;
}
.sw-viewer-control {
  min-height:44px;
  min-width:44px;
  padding:8px 12px;
  border:1px solid #c9d0dc;
  border-radius:8px;
  background:#fff;
  color:#051746;
  cursor:pointer;
  font-weight:600;
}
.sw-viewer-control:hover { background:#f3f5fa; }
.sw-viewer-control:focus-visible {
  outline:3px solid #f6620d;
  outline-offset:2px;
}
.sw-viewer-body {
  overflow:auto;
  overscroll-behavior:contain;
  max-height:75vh;
  max-height:75dvh;
  padding:12px;
  background:#f3f5fa;
}
.sw-viewer-image {
  display:block;
  width:100%;
  height:auto;
  max-height:70vh;
  max-height:70dvh;
  object-fit:contain;
  margin:auto;
}
.sw-viewer-image[data-expanded='true'] { max-height:none; }
.sw-viewer-message { padding:24px; text-align:center; }
`

function CategoryCard({
  category,
  index,
  count,
  setRef,
  className,
  href,
}: {
  category: WorkCategory
  index: number
  count: string
  setRef: (element: HTMLAnchorElement | null) => void
  className: string
  href?: string
}) {
  const { tr, rtl } = useLang()

  const shots = allProjects(category).slice(0, 3)

  const fan =
    shots.length === 1
      ? ['sw-shot-c']
      : shots.length === 2
        ? ['sw-shot-l', 'sw-shot-c']
        : ['sw-shot-l', 'sw-shot-r', 'sw-shot-c']

  const stackReveal = useRevealOnScroll<HTMLSpanElement>()

  return (
    <a
      ref={setRef}
      href={href ?? `/work/${category.id}`}
      aria-label={`${tr(category.title)} — ${count}`}
      className={`sw-card ${className}`}
    >
      <span className="sw-card-in">
        <span className="sw-card-glow" aria-hidden="true" />

        <span
          ref={stackReveal.ref}
          className="sw-stack"
          data-revealed={stackReveal.visible}
          aria-hidden="true"
        >
          {shots.map((project, shotIndex) => (
            <span
              key={project.id}
              className={`sw-shot ${fan[shotIndex]}`}
              style={{
                animationDelay: `${shotIndex * 80}ms`,
              }}
            >
              <span className="sw-shot-in">
                <img
                  src={imageUrl(
                    project.optimized
                      ? webCopy(project.image, 720)
                      : project.image,
                  )}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    const image = event.currentTarget

                    if (!project.optimized || image.dataset.fallback) {
                      image.style.visibility = 'hidden'
                      return
                    }

                    image.dataset.fallback = '1'
                    image.src = imageUrl(project.image)
                  }}
                />
              </span>
            </span>
          ))}
        </span>

        <span className="sw-card-body">
          <span className="flex items-center gap-3 text-sm font-semibold tracking-wide text-white/90 sm:text-base">
            <span className="latin tabular-nums text-signal">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span aria-hidden="true">·</span>
            <span>{count}</span>
          </span>

          <span className="sw-card-title">
            {tr(category.title)}
          </span>

          <span className="sw-card-foot">
            <span>
              {tr({ en: 'Explore', ar: 'استكشف' })}
            </span>

            <span className="sw-card-arrow" aria-hidden="true">
              {rtl ? '←' : '→'}
            </span>
          </span>
        </span>
      </span>
    </a>
  )
}

function ProjectViewer({
  projects,
  initialIndex,
  onClose,
}: {
  projects: PortfolioProject[]
  initialIndex: number
  onClose: () => void
}) {
  const { tr, rtl } = useLang()

  const [index, setIndex] = useState(initialIndex)
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<
    'loading' | 'loaded' | 'failed'
  >('loading')

  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const project = projects[index]

  const move = (direction: number) => {
    setIndex(
      (current) =>
        (current + direction + projects.length) % projects.length,
    )
    setStatus('loading')
    setExpanded(false)
  }

  // Start at the top when opening or changing projects.
  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0
    if (dialogRef.current) dialogRef.current.scrollTop = 0
  }, [index])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const root = document.documentElement
    const savedY = window.scrollY

    const old = {
      html: root.style.overflow,
      body: document.body.style.overflow,
      padding: document.body.style.paddingRight,
    }

    const scrollbar = window.innerWidth - root.clientWidth

    const lenis = getLenis()
    lenis?.stop()

    root.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    if (scrollbar > 0) {
      document.body.style.paddingRight = `${
        parseFloat(getComputedStyle(document.body).paddingRight || '0') +
        scrollbar
      }px`
    }

    dialog.showModal()

    return () => {
      dialog.close()

      root.style.overflow = old.html
      document.body.style.overflow = old.body
      document.body.style.paddingRight = old.padding

      lenis?.start()

      if (Math.abs(window.scrollY - savedY) > 1) {
        jumpTo(savedY)
      }

      if (previousFocus?.isConnected) {
        previousFocus.focus({ preventScroll: true })
      }
    }
  }, [])

  if (!project || typeof document === 'undefined') return null

  return createPortal(
    <dialog
      ref={dialogRef}
      className="sw-viewer"
      aria-labelledby="sw-viewer-title"
      dir={rtl ? 'rtl' : 'ltr'}
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      onKeyDown={(event) => {
        if (projects.length < 2) return

        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowLeft'
        ) {
          event.preventDefault()

          move(
            (event.key === 'ArrowRight' ? 1 : -1) *
              (rtl ? -1 : 1),
          )
        }
      }}
    >
      <div>
        <header className="sw-viewer-head">
          <div>
            <h2
              id="sw-viewer-title"
              className="sw-viewer-title"
            >
              {tr(project.name)}
            </h2>

            {tr(project.description) && (
              <p>{tr(project.description)}</p>
            )}
          </div>

          <div className="sw-viewer-controls">
            {projects.length > 1 && (
              <>
                <button
                  type="button"
                  className="sw-viewer-control"
                  onClick={() => move(-1)}
                  aria-label={tr({
                    en: 'Previous project',
                    ar: 'المشروع السابق',
                  })}
                >
                  {rtl ? '→' : '←'}
                </button>

                <span aria-live="polite">
                  {index + 1} / {projects.length}
                </span>

                <button
                  type="button"
                  className="sw-viewer-control"
                  onClick={() => move(1)}
                  aria-label={tr({
                    en: 'Next project',
                    ar: 'المشروع التالي',
                  })}
                >
                  {rtl ? '←' : '→'}
                </button>
              </>
            )}

            <button
              type="button"
              className="sw-viewer-control"
              aria-pressed={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded
                ? tr({
                    en: 'Fit image',
                    ar: 'ملاءمة الصورة',
                  })
                : tr({
                    en: 'Expand image',
                    ar: 'تكبير الصورة',
                  })}
            </button>

            <button
              type="button"
              autoFocus
              className="sw-viewer-control"
              onClick={onClose}
              aria-label={tr({
                en: 'Close project',
                ar: 'إغلاق المشروع',
              })}
            >
              ✕
            </button>
          </div>
        </header>

        <div
          ref={bodyRef}
          className="sw-viewer-body"
          data-lenis-prevent
        >
          {status === 'loading' && (
            <p role="status" className="sw-viewer-message">
              {tr({
                en: 'Loading project…',
                ar: 'جارٍ تحميل المشروع…',
              })}
            </p>
          )}

          {status === 'failed' ? (
            <p role="alert" className="sw-viewer-message">
              {tr({
                en: 'Project image unavailable. Check the image file path.',
                ar: 'صورة المشروع غير متوفرة. تحقق من مسار الصورة.',
              })}
            </p>
          ) : (
            <img
              key={project.image}
              src={imageUrl(project.image)}
              alt={tr(project.name)}
              decoding="async"
              className="sw-viewer-image"
              data-expanded={expanded}
              onLoad={() => setStatus('loaded')}
              onError={() => setStatus('failed')}
            />
          )}
        </div>
      </div>
    </dialog>,
    document.body,
  )
}

const credibilityStats = [
  {
    value: 25,
    suffix: '+',
    label: {
      en: 'Years Experience',
      ar: 'سنوات من الخبرة',
    },
  },
  {
    value: 4500,
    suffix: '+',
    label: {
      en: 'Projects Delivered',
      ar: 'مشروع تم إنجازه',
    },
  },
  {
    value: 1200,
    suffix: '+',
    label: {
      en: 'Clients Served',
      ar: 'عميل تم خدمته',
    },
  },
  {
    value: 13,
    suffix: '',
    label: {
      en: 'Countries',
      ar: 'دولة',
    },
  },
] satisfies {
  value: number
  suffix: string
  label: Localized
}[]

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
      {
        threshold: 0.13,
        rootMargin: '0px 0px -5% 0px',
      },
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

  const format = (value: number) =>
    value.toLocaleString('en-US') + suffix

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
            <p className="eyebrow mb-6 inline-flex items-center gap-3 !text-[0.95rem] !font-bold text-signal lg:!text-[1rem]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_14px_rgba(255,106,0,0.70)]"
              />

              {tr({
                en: 'Credibility',
                ar: 'المصداقية',
              })}
            </p>

            <h2
              id="credibility-title"
              className="max-w-[15ch] text-[clamp(2.25rem,5.3vw,5.2rem)] font-bold leading-[1.03] tracking-tight text-white rtl:max-w-none rtl:leading-tight rtl:tracking-normal"
            >
              {tr({
                en: 'Built on decades',
                ar: 'خبرة تمتد',
              })}{' '}
              <span className="font-bold">
                {tr({
                  en: 'of craft',
                  ar: 'لعقود من الإبداع',
                })}
                <span className="text-signal">.</span>
              </span>
            </h2>
          </div>

          <p className="max-w-[58ch] text-[1.125rem] font-semibold leading-[1.85] text-white/95 sm:text-xl lg:pb-2">
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
                transitionDelay: metrics.visible
                  ? `${index * 115}ms`
                  : '0ms',
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
                  <span className="latin text-sm font-bold tracking-[0.12em] text-white/80">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-signal"
                  />
                </div>

                <div className="relative mt-7 flex flex-col">
                  <dt className="order-2 mt-3 text-sm font-bold uppercase leading-relaxed tracking-[0.04em] text-white/95 sm:text-base rtl:tracking-normal">
                    {tr(stat.label)}
                  </dt>

                  <dd className="latin order-1 whitespace-nowrap text-[clamp(1.7rem,5.6vw,4.25rem)] font-bold leading-none tracking-[-0.055em] text-white tabular-nums">
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

export function Work({
  categoryId,
  collectionId,
}: {
  categoryId?: string
  collectionId?: string
} = {}) {
  const { tr, rtl } = useLang()

  const activeId = categoryId?.toLowerCase() ?? null
  const selectedCollectionId = collectionId ?? null

  const categoryHeadingRef = useRef<HTMLHeadingElement>(null)

  const categoryButtons = useRef<
    Record<string, HTMLAnchorElement | null>
  >({})

  const activeCategory = workCategories.find(
    (category) => category.id === activeId,
  )

  const activeCollection = activeCategory?.collections?.find(
    (collection) => collection.id === selectedCollectionId,
  )

  const invalidCollection = Boolean(
    activeCategory?.collections &&
      selectedCollectionId &&
      !activeCollection,
  )

  const visibleProjects =
    activeCollection?.projects ??
    activeCategory?.projects ??
    []

  const viewTitle =
    activeCollection?.title ?? activeCategory?.title

  const totalProjects = workCategories.reduce(
    (sum, category) => sum + allProjects(category).length,
    0,
  )

  const projectCount = (count: number) =>
    tr({
      en: `${count} ${count === 1 ? 'project' : 'projects'}`,
      ar:
        count === 1
          ? 'مشروع واحد'
          : count === 2
            ? 'مشروعان'
            : count <= 10
              ? `${count} مشاريع`
              : `${count} مشروعًا`,
    })

  const [openProject, setOpenProject] = useState<number | null>(
    null,
  )

  useEffect(() => {
    setOpenProject(null)
  }, [activeId, selectedCollectionId])

  const ghostWords = workCategories.map((category) =>
    tr(category.title),
  )

  return (
    <>
      <style>{studioStyles}</style>

      <section
        id="selected-work"
        dir={rtl ? 'rtl' : 'ltr'}
        aria-labelledby={
          activeId ? 'category-title' : 'selected-work-title'
        }
        className={`sw section relative scroll-mt-24 overflow-hidden ${
          activeId ? 'min-h-screen pt-32' : ''
        }`}
      >
        <div className="sw-grid-bg" aria-hidden="true" />
        <div className="sw-glow" aria-hidden="true" />

        <p className="sw-ghost" aria-hidden="true" dir="ltr">
          {ghostWords.map((word, index) => (
            <span key={word}>
              {word}
              <b>
                {' '}
                {index === ghostWords.length - 1 ? '' : '· '}
              </b>
            </span>
          ))}
        </p>

        <div className="wrap relative">
          {!activeId && (
            <header className="mb-12 grid items-end gap-8 sm:mb-16 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="sw-intro eyebrow mb-6 flex items-center gap-3 !text-[0.95rem] !font-bold text-signal lg:!text-[1rem]">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-signal"
                  />

                  {tr({
                    en: 'Selected work',
                    ar: 'أعمال مختارة',
                  })}
                </p>

                <h2
                  id="selected-work-title"
                  className="max-w-[15ch] text-[clamp(2.25rem,5.5vw,5.5rem)] font-bold leading-[1.02] tracking-tight rtl:max-w-none rtl:leading-tight rtl:tracking-normal"
                >
                  <span className="sw-line">
                    <span>
                      {tr({
                        en: 'A look inside',
                        ar: 'نظرة داخل',
                      })}
                    </span>
                  </span>

                  <span className="sw-line">
                    <span className="font-bold">
                      {tr({
                        en: 'the studio',
                        ar: 'الاستوديو',
                      })}
                      <span className="text-signal">.</span>
                    </span>
                  </span>
                </h2>

                <p className="sw-intro mt-6 text-[1.125rem] font-semibold leading-relaxed text-[#051746]/90 sm:text-xl">
                  {tr({
                    en: `Curated work across ${workCategories.length} disciplines.`,
                    ar: `أعمال منتقاة عبر ${workCategories.length} تخصصات.`,
                  })}
                </p>
              </div>

              <dl className="sw-intro flex gap-10 border-t border-[#051746]/15 pt-5 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0">
                <div>
                  <dd className="latin text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                    {String(workCategories.length).padStart(
                      2,
                      '0',
                    )}
                  </dd>

                  <dt className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#051746]/85 sm:text-base rtl:tracking-normal">
                    {tr({
                      en: 'Disciplines',
                      ar: 'تخصصات',
                    })}
                  </dt>
                </div>

                <div>
                  <dd className="latin text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
                    {totalProjects}
                  </dd>

                  <dt className="mt-2 text-sm font-bold uppercase tracking-[0.08em] text-[#051746]/85 sm:text-base rtl:tracking-normal">
                    {tr({
                      en: 'Projects shown',
                      ar: 'مشروعًا معروضًا',
                    })}
                  </dt>
                </div>
              </dl>
            </header>
          )}

          {!activeId ? (
            <div className="sw-tiles grid gap-5 md:grid-cols-2 lg:grid-cols-6">
              {workCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  count={projectCount(
                    allProjects(category).length,
                  )}
                  setRef={(element) => {
                    categoryButtons.current[category.id] =
                      element
                  }}
                  className="lg:col-span-2"
                />
              ))}
            </div>
          ) : !activeCategory ? (
            <div className="relative py-20">
              <h1
                id="category-title"
                className="text-3xl font-bold"
              >
                {tr({
                  en: 'Collection not found',
                  ar: 'المجموعة غير موجودة',
                })}
              </h1>

              <a
                href="/#selected-work"
                className="mt-6 inline-block font-bold text-signal"
              >
                {tr({
                  en: 'Back to all work',
                  ar: 'العودة إلى جميع الأعمال',
                })}
              </a>
            </div>
          ) : (
            <div
              key={`${activeCategory.id}-${selectedCollectionId ?? 'all'}`}
            >
              <div className="sw-detail-head">
                <a
                  href={
                    activeCollection || invalidCollection
                      ? `/work/${activeCategory.id}`
                      : '/#selected-work'
                  }
                  className="group/back mb-8 inline-flex items-center gap-3 rounded-full border border-[#051746]/20 min-h-[3.75rem] py-3.5 ps-4 pe-6 text-base font-bold sm:text-lg text-[#051746] transition-colors hover:border-signal hover:bg-signal hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                >
                  <span
                    aria-hidden="true"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#051746] text-white transition-colors group-hover/back:bg-white group-hover/back:text-signal"
                  >
                    {rtl ? '→' : '←'}
                  </span>

                  {activeCollection || invalidCollection
                    ? tr({
                        en: 'Back to Branding',
                        ar: 'العودة إلى الهوية البصرية',
                      })
                    : tr({
                        en: 'Back to all work',
                        ar: 'العودة إلى جميع الأعمال',
                      })}
                </a>

                <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-[#051746]/15 pb-6">
                  <h1
                    id="category-title"
                    ref={categoryHeadingRef}
                    tabIndex={-1}
                    style={{ outline: 'none' }}
                    className="text-[clamp(2rem,4.5vw,3.25rem)] font-bold tracking-tight rtl:tracking-normal"
                  >
                    {invalidCollection
                      ? tr({
                          en: 'Collection not found',
                          ar: 'المجموعة غير موجودة',
                        })
                      : tr(viewTitle ?? activeCategory.title)}

                    <span className="text-signal">.</span>
                  </h1>

                  <p className="text-base font-semibold text-[#051746]/85 sm:text-lg">
                    {projectCount(
                      invalidCollection
                        ? 0
                        : activeCollection
                          ? visibleProjects.length
                          : allProjects(activeCategory).length,
                    )}
                  </p>
                </div>
              </div>

              {activeCategory.collections &&
                !activeCollection &&
                !invalidCollection && (
                  <div className="mb-14">
                    <h2 className="mb-6 text-2xl font-bold">
                      {tr({
                        en: 'Explore collections',
                        ar: 'استكشف المجموعات',
                      })}
                    </h2>

                    <div className="sw-tiles grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                      {activeCategory.collections.map(
                        (collection, index) => (
                          <CategoryCard
                            key={collection.id}
                            category={collection}
                            index={index}
                            count={projectCount(
                              collection.projects.length,
                            )}
                            href={collectionHref(
                              activeCategory.id,
                              collection.id,
                            )}
                            setRef={() => {}}
                            className=""
                          />
                        ),
                      )}
                    </div>

                    <h2 className="mt-14 text-2xl font-bold">
                      {tr({
                        en: 'Brand identity projects',
                        ar: 'مشاريع الهوية البصرية',
                      })}
                    </h2>
                  </div>
                )}

              {!invalidCollection && (
                <div
                  className={`grid items-start gap-x-6 gap-y-12 md:grid-cols-2 ${
                    visibleProjects.length > 2
                      ? 'xl:grid-cols-3'
                      : ''
                  }`}
                >
                  {visibleProjects.map((project, index) => (
                    <article
                      key={project.id}
                      className="sw-project min-w-0"
                    >
                      <button
                        type="button"
                        className="sw-project-open"
                        onClick={() => setOpenProject(index)}
                        aria-haspopup="dialog"
                        aria-label={`${tr({
                          en: 'Open project',
                          ar: 'افتح المشروع',
                        })}: ${tr(project.name)}`}
                      >
                        <PortfolioImage
                          key={project.image}
                          project={project}
                        />

                        <span className="sw-open-label mt-3 block text-sm font-bold text-signal">
                          {tr({
                            en: 'View project',
                            ar: 'عرض المشروع',
                          })}{' '}
                          {rtl ? '←' : '→'}
                        </span>
                      </button>

                      <div className="flex gap-4 px-1 pt-5">
                        <span className="latin pt-1.5 text-sm font-bold text-signal tabular-nums">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div>
                          <h3 className="text-xl font-bold leading-snug sm:text-2xl">
                            <button
                              type="button"
                              className="text-start hover:text-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-signal"
                              onClick={() =>
                                setOpenProject(index)
                              }
                              aria-haspopup="dialog"
                            >
                              {tr(project.name)}
                            </button>
                          </h3>

                          {tr(project.description) && (
                            <p className="mt-1.5 text-base font-semibold leading-relaxed text-[#051746]/85 sm:text-lg">
                              {tr(project.description)}
                            </p>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {openProject !== null &&
        visibleProjects[openProject] && (
          <ProjectViewer
            key={`${activeId}-${selectedCollectionId ?? 'all'}`}
            projects={visibleProjects}
            initialIndex={openProject}
            onClose={() => setOpenProject(null)}
          />
        )}

      {!activeId && <Credibility />}
    </>
  )
}