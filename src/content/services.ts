import type { L } from '../lib/i18n'

export type ServiceId = 'brands' | 'campaigns' | 'systems' | 'funnels' | 'automations' | 'digital' | 'growth'

export type Service = {
  id: ServiceId
  title: L
  line: L
  detail: L
  includes: L[]
}

/** CMS collection: Services. Order is the order shown on the site. */
export const services: Service[] = [
  {
    id: 'brands',
    title: { en: 'Brands', ar: 'العلامات' },
    line: { en: 'Identities engineered to last decades, not seasons.', ar: 'هويات تُهندَس لتدوم عقودًا، لا مواسم.' },
    detail: {
      en: 'Positioning, naming, verbal and visual identity built as one structure, so every later decision has something solid to stand on.',
      ar: 'تموضع وتسمية وهوية لفظية وبصرية تُبنى كهيكل واحد، ليجد كل قرار لاحق أرضًا صلبة يقف عليها.',
    },
    includes: [
      { en: 'Positioning & narrative', ar: 'التموضع والسردية' },
      { en: 'Naming', ar: 'التسمية' },
      { en: 'Visual identity', ar: 'الهوية البصرية' },
      { en: 'Brand guidelines', ar: 'دليل العلامة' },
    ],
  },
  {
    id: 'campaigns',
    title: { en: 'Campaigns', ar: 'الحملات' },
    line: {
      en: 'Integrated stories that move audiences and pipelines.',
      ar: 'قصص متكاملة تحرّك الجمهور وتحرّك المبيعات.',
    },
    detail: {
      en: 'One idea carried across film, social, media and activation, planned so each channel strengthens the others.',
      ar: 'فكرة واحدة تمتد عبر الفيلم والمنصات الاجتماعية والإعلام والتفعيل، ومخطَّطة لتقوّي كل قناة ما سواها.',
    },
    includes: [
      { en: 'Campaign strategy', ar: 'استراتيجية الحملة' },
      { en: 'Creative & production', ar: 'الإبداع والإنتاج' },
      { en: 'Media planning', ar: 'التخطيط الإعلامي' },
      { en: 'Measurement', ar: 'القياس' },
    ],
  },
  {
    id: 'systems',
    title: { en: 'Systems', ar: 'الأنظمة' },
    line: {
      en: 'Brand systems and operating systems for marketing teams.',
      ar: 'أنظمة للعلامة وأنظمة تشغيل لفرق التسويق.',
    },
    detail: {
      en: 'Design systems, content operations and playbooks that let a team produce consistent work without starting from zero each time.',
      ar: 'أنظمة تصميم وعمليات محتوى وأدلة عمل تمكّن الفريق من إنتاج عمل متّسق دون البدء من الصفر في كل مرة.',
    },
    includes: [
      { en: 'Design systems', ar: 'أنظمة التصميم' },
      { en: 'Content operations', ar: 'عمليات المحتوى' },
      { en: 'Templates & toolkits', ar: 'القوالب والأدوات' },
      { en: 'Team playbooks', ar: 'أدلة عمل الفريق' },
    ],
  },
  {
    id: 'funnels',
    title: { en: 'Funnels', ar: 'مسارات التحويل' },
    line: { en: 'Acquisition engines optimized for revenue.', ar: 'محركات استحواذ مُحسَّنة لتحقيق الإيراد.' },
    detail: {
      en: 'Landing pages, offers, ads and follow-up designed as one path, from first attention to a measurable action.',
      ar: 'صفحات هبوط وعروض وإعلانات ومتابعة تُصمَّم كمسار واحد، من أول انتباه إلى فعل قابل للقياس.',
    },
    includes: [
      { en: 'Offer & journey design', ar: 'تصميم العرض والرحلة' },
      { en: 'Landing pages', ar: 'صفحات الهبوط' },
      { en: 'Paid acquisition', ar: 'الاستحواذ المدفوع' },
      { en: 'Conversion optimisation', ar: 'تحسين التحويل' },
    ],
  },
  {
    id: 'automations',
    title: { en: 'Automations', ar: 'الأتمتة' },
    line: {
      en: 'Workflows that remove manual drag from growth.',
      ar: 'مسارات عمل تزيل العبء اليدوي من طريق النمو.',
    },
    detail: {
      en: 'CRM flows, lead routing, messaging and reporting that run on their own, so people spend their time on judgement, not repetition.',
      ar: 'مسارات إدارة العملاء وتوزيع الفرص والمراسلة والتقارير تعمل تلقائيًا، ليصرف الفريق وقته على التقدير لا على التكرار.',
    },
    includes: [
      { en: 'CRM & lead routing', ar: 'إدارة العملاء وتوزيع الفرص' },
      { en: 'WhatsApp & email flows', ar: 'مسارات واتساب والبريد' },
      { en: 'Reporting', ar: 'التقارير' },
      { en: 'AI-assisted workflows', ar: 'مسارات عمل مدعومة بالذكاء الاصطناعي' },
    ],
  },
  {
    id: 'digital',
    title: { en: 'Digital Experiences', ar: 'التجارب الرقمية' },
    line: { en: 'Sites, apps, and interactive products.', ar: 'مواقع وتطبيقات ومنتجات تفاعلية.' },
    detail: {
      en: 'Interfaces designed and built to carry the brand, load fast and make the next step obvious on any screen.',
      ar: 'واجهات تُصمَّم وتُبنى لتحمل العلامة، وتُحمَّل بسرعة، وتجعل الخطوة التالية واضحة على أي شاشة.',
    },
    includes: [
      { en: 'Websites', ar: 'المواقع' },
      { en: 'Mobile & web apps', ar: 'تطبيقات الجوال والويب' },
      { en: 'Interactive content', ar: 'المحتوى التفاعلي' },
      { en: 'UX & UI design', ar: 'تصميم التجربة والواجهات' },
    ],
  },
  {
    id: 'growth',
    title: { en: 'Growth Engines', ar: 'محركات النمو' },
    line: { en: 'Compounding programs that learn and improve.', ar: 'برامج تراكمية تتعلّم وتتحسّن.' },
    detail: {
      en: 'Ongoing programs where each cycle of content, media and testing feeds the next, so results build instead of resetting.',
      ar: 'برامج مستمرة تغذّي فيها كل دورة من المحتوى والإعلام والاختبار الدورة التالية، فتتراكم النتائج بدل أن تبدأ من جديد.',
    },
    includes: [
      { en: 'Always-on content', ar: 'محتوى مستمر' },
      { en: 'Performance media', ar: 'إعلام الأداء' },
      { en: 'Experimentation', ar: 'التجريب' },
      { en: 'Insight loops', ar: 'حلقات التعلّم' },
    ],
  },
]

export const serviceById = (id: ServiceId) => services.find((s) => s.id === id)!
export const num = (i: number) => String(i + 1).padStart(2, '0')
