import type { L } from '../lib/i18n'
import type { ServiceId } from './services'

export type ArtKind = 'ascent' | 'wave' | 'screens' | 'converge' | 'mono' | 'loop'

export type Project = {
  slug: string
  name: L
  industry: L
  category: L
  challenge: L
  approach: L
  outcome: L
  disciplines: ServiceId[]
  /** Generated cover art. Swap for `image` (WebP/AVIF path) when real case imagery exists. */
  art: ArtKind
  image?: string
  featured?: boolean
  /** Placeholder entries are labelled "Concept case" on the site. Remove the flag on real work. */
  placeholder?: boolean
}

/**
 * CMS collection: Projects.
 * Everything below is placeholder content written to show the layout.
 * No client names, results or figures here are real. Outcomes are qualitative on purpose.
 */
export const projects: Project[] = [
  {
    slug: 'northline',
    name: { en: 'Northline', ar: 'نورث لاين' },
    industry: { en: 'Logistics', ar: 'الخدمات اللوجستية' },
    category: { en: 'Brand Transformation', ar: 'تحوّل العلامة' },
    challenge: {
      en: 'A regional carrier had outgrown the identity it started with and was being read as smaller than it was.',
      ar: 'شركة نقل إقليمية تجاوزت الهوية التي بدأت بها، وصارت تُقرأ أصغر من حجمها الحقيقي.',
    },
    approach: {
      en: 'We rebuilt the brand from positioning outward: one idea, one visual structure, then every touchpoint from fleet to sales deck.',
      ar: 'أعدنا بناء العلامة من التموضع إلى الخارج: فكرة واحدة، وهيكل بصري واحد، ثم كل نقطة تماس من الأسطول إلى عرض المبيعات.',
    },
    outcome: {
      en: 'One brand system across fleet, digital and sales material, adopted by every business unit.',
      ar: 'نظام علامة واحد يشمل الأسطول والقنوات الرقمية ومواد المبيعات، وتعتمده كل وحدات العمل.',
    },
    disciplines: ['brands', 'systems', 'digital'],
    art: 'ascent',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'sada',
    name: { en: 'Sada Hotels', ar: 'فنادق صدى' },
    industry: { en: 'Hospitality', ar: 'الضيافة' },
    category: { en: 'Campaign', ar: 'حملة' },
    challenge: {
      en: 'A seasonal launch needed one story across film, social and on-property activation.',
      ar: 'إطلاق موسمي يحتاج إلى قصة واحدة تمتد بين الفيلم والمنصات الاجتماعية والتفعيل داخل الفندق.',
    },
    approach: {
      en: 'A single campaign idea, produced once and cut for every channel, with media planned around how guests actually book.',
      ar: 'فكرة حملة واحدة تُنتَج مرة وتُعدّ لكل قناة، مع تخطيط إعلامي مبني على طريقة الحجز الفعلية لدى الضيوف.',
    },
    outcome: {
      en: 'A campaign platform the in-house team continues to extend each season.',
      ar: 'منصة حملة يواصل الفريق الداخلي البناء عليها في كل موسم.',
    },
    disciplines: ['campaigns', 'funnels'],
    art: 'wave',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'mada',
    name: { en: 'Mada Clinics', ar: 'عيادات مدى' },
    industry: { en: 'Healthcare', ar: 'الرعاية الصحية' },
    category: { en: 'Digital Product', ar: 'منتج رقمي' },
    challenge: {
      en: 'Booking was spread across phone calls, forms and messaging, with no single view of the patient journey.',
      ar: 'الحجز موزّع بين المكالمات والنماذج والرسائل، دون رؤية واحدة لرحلة المريض.',
    },
    approach: {
      en: 'We mapped the journey with the front desk, then designed one booking flow for web and mobile with automated reminders.',
      ar: 'رسمنا الرحلة مع موظفي الاستقبال، ثم صمّمنا مسار حجز واحدًا للويب والجوال مع تذكيرات تلقائية.',
    },
    outcome: {
      en: 'A booking experience the front desk and patients use the same way.',
      ar: 'تجربة حجز يستخدمها موظفو الاستقبال والمرضى بالطريقة نفسها.',
    },
    disciplines: ['digital', 'automations', 'systems'],
    art: 'screens',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'atlas',
    name: { en: 'Atlas Properties', ar: 'أطلس العقارية' },
    industry: { en: 'Real Estate', ar: 'العقارات' },
    category: { en: 'Growth System', ar: 'نظام نمو' },
    challenge: {
      en: 'Leads arrived from many channels with no shared path from enquiry to viewing.',
      ar: 'الفرص تصل من قنوات كثيرة دون مسار مشترك من الاستفسار إلى المعاينة.',
    },
    approach: {
      en: 'One funnel for every source, automated follow-up on WhatsApp and email, and a single report both teams trust.',
      ar: 'مسار واحد لكل المصادر، ومتابعة تلقائية عبر واتساب والبريد، وتقرير واحد يثق به الفريقان.',
    },
    outcome: {
      en: 'A connected funnel with automated follow-up and one reporting view for sales and marketing.',
      ar: 'مسار مترابط بمتابعة تلقائية ورؤية تقارير واحدة للمبيعات والتسويق.',
    },
    disciplines: ['funnels', 'automations', 'growth'],
    art: 'converge',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'qamar',
    name: { en: 'Qamar Coffee', ar: 'قهوة قمر' },
    industry: { en: 'Food & Beverage', ar: 'الأغذية والمشروبات' },
    category: { en: 'Brand Identity', ar: 'هوية علامة' },
    challenge: {
      en: 'A new roaster entering a crowded specialty market needed to be recognised from across the street.',
      ar: 'محمصة جديدة تدخل سوقًا مزدحمًا وتحتاج أن تُعرَف من الجهة المقابلة للشارع.',
    },
    approach: {
      en: 'A name, mark and packaging language built around one strong shape that works on a cup, a bag and a storefront.',
      ar: 'اسم وشعار ولغة تغليف مبنية حول شكل واحد قوي يعمل على الكوب والكيس وواجهة المتجر.',
    },
    outcome: {
      en: 'An identity, packaging and store language built to extend to new locations.',
      ar: 'هوية وتغليف ولغة متجر مبنية لتمتد إلى فروع جديدة.',
    },
    disciplines: ['brands', 'campaigns'],
    art: 'mono',
    featured: true,
    placeholder: true,
  },
  {
    slug: 'rukn',
    name: { en: 'Rukn Academy', ar: 'أكاديمية ركن' },
    industry: { en: 'Education', ar: 'التعليم' },
    category: { en: 'Automation', ar: 'أتمتة' },
    challenge: {
      en: 'Admissions staff spent most of the week on manual follow-up instead of conversations.',
      ar: 'فريق القبول يقضي معظم الأسبوع في المتابعة اليدوية بدل الحوار مع المتقدمين.',
    },
    approach: {
      en: 'We automated the path from enquiry to enrolment and defined the exact moments a person should step in.',
      ar: 'أتمتنا المسار من الاستفسار إلى التسجيل، وحدّدنا اللحظات التي يجب أن يتدخل فيها إنسان.',
    },
    outcome: {
      en: 'Enquiry-to-enrolment workflows that run on their own and hand over at the right moment.',
      ar: 'مسارات عمل من الاستفسار إلى التسجيل تعمل تلقائيًا وتُسلِّم في اللحظة المناسبة.',
    },
    disciplines: ['automations', 'systems', 'growth'],
    art: 'loop',
    placeholder: true,
  },
]

export const projectBySlug = (slug?: string) => projects.find((p) => p.slug === slug)
