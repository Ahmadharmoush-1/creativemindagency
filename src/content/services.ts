import type { L } from '../lib/i18n'

/**
 * Main service categories shown on the website.
 *
 * We keep IDs that already exist in ServiceVisual so the
 * existing visual/GSAP system continues working.
 */
export type ServiceId =
  | 'brands'
  | 'growth'
  | 'systems'
  | 'digital'

export type Service = {
  id: ServiceId
  title: L
  line: L
  detail: L
  includes: L[]
}

/**
 * CMS collection: Services.
 *
 * Website structure:
 *
 * 01 — Branding
 * 02 — Marketing & Growth
 * 03 — Systems & Automation
 * 04 — Digital Experiences
 */
export const services: Service[] = [
  {
    id: 'brands',

    title: {
      en: 'Branding',
      ar: 'بناء العلامات التجارية',
    },

    line: {
      en: 'Brands built to be recognised, remembered and trusted.',
      ar: 'علامات تجارية تُبنى لتُعرف وتُتذكر وتكسب الثقة.',
    },

    detail: {
      en: 'We build brands from the strategic foundation to the final visual system — creating a clear identity that gives every campaign, product and digital experience a strong foundation.',
      ar: 'نبني العلامات التجارية من الأساس الاستراتيجي وحتى النظام البصري الكامل، لنصنع هوية واضحة تمنح الحملات والمنتجات والتجارب الرقمية أساسًا قويًا ومتّسقًا.',
    },

    includes: [
      {
        en: 'Brand strategy & positioning',
        ar: 'استراتيجية العلامة والتموضع',
      },
      {
        en: 'Naming & narrative',
        ar: 'التسمية والسردية',
      },
      {
        en: 'Visual identity',
        ar: 'الهوية البصرية',
      },
      {
        en: 'Brand guidelines',
        ar: 'دليل العلامة التجارية',
      },
    ],
  },

  {
    id: 'growth',

    title: {
      en: 'Marketing & Growth',
      ar: 'التسويق والنمو',
    },

    line: {
      en: 'Campaigns, funnels and growth systems designed to turn attention into revenue.',
      ar: 'حملات ومسارات نمو مصممة لتحويل الانتباه إلى نتائج وإيرادات.',
    },

    detail: {
      en: 'We connect campaigns, acquisition funnels and ongoing growth programs into one measurable system — attracting the right audience, converting demand and continuously improving performance.',
      ar: 'نربط الحملات ومسارات الاستحواذ وبرامج النمو المستمرة ضمن نظام واحد قابل للقياس، لجذب الجمهور المناسب وتحويل الاهتمام إلى طلب وتحسين الأداء باستمرار.',
    },

    includes: [
      {
        en: 'Campaign strategy & creative',
        ar: 'استراتيجية الحملات والإبداع',
      },
      {
        en: 'Funnels & landing pages',
        ar: 'مسارات التحويل وصفحات الهبوط',
      },
      {
        en: 'Paid acquisition',
        ar: 'الاستحواذ المدفوع',
      },
      {
        en: 'Content & performance marketing',
        ar: 'المحتوى وتسويق الأداء',
      },
      {
        en: 'Conversion optimisation',
        ar: 'تحسين معدلات التحويل',
      },
      {
        en: 'Growth experiments',
        ar: 'تجارب النمو',
      },
      {
        en: 'Analytics & insight loops',
        ar: 'التحليلات وحلقات التعلّم',
      },
    ],
  },

  {
    id: 'systems',

    title: {
      en: 'Systems & Automation',
      ar: 'الأنظمة والأتمتة',
    },

    line: {
      en: 'Connected systems that remove repetitive work and keep growth moving.',
      ar: 'أنظمة مترابطة تقلّل العمل المتكرر وتحافظ على استمرارية النمو.',
    },

    detail: {
      en: 'We design the operational infrastructure behind marketing and sales — connecting CRM, lead management, communication, reporting and AI-powered automation into workflows that operate reliably at scale.',
      ar: 'نصمم البنية التشغيلية خلف التسويق والمبيعات، ونربط إدارة العملاء والفرص والتواصل والتقارير والأتمتة المدعومة بالذكاء الاصطناعي ضمن مسارات عمل تعمل بكفاءة وقابلية للتوسع.',
    },

    includes: [
      {
        en: 'CRM systems',
        ar: 'أنظمة إدارة العملاء',
      },
      {
        en: 'Lead routing & pipelines',
        ar: 'توزيع العملاء ومسارات المبيعات',
      },
      {
        en: 'WhatsApp & email automation',
        ar: 'أتمتة واتساب والبريد الإلكتروني',
      },
      {
        en: 'Marketing operations',
        ar: 'عمليات التسويق',
      },
      {
        en: 'Reporting & dashboards',
        ar: 'التقارير ولوحات البيانات',
      },
      {
        en: 'AI-assisted workflows',
        ar: 'مسارات عمل مدعومة بالذكاء الاصطناعي',
      },
      {
        en: 'Internal systems & playbooks',
        ar: 'الأنظمة الداخلية وأدلة العمل',
      },
    ],
  },

  {
    id: 'digital',

    title: {
      en: 'Digital Experiences',
      ar: 'التجارب الرقمية',
    },

    line: {
      en: 'Websites, platforms and digital products built around real user behaviour.',
      ar: 'مواقع ومنصات ومنتجات رقمية مصممة حول سلوك المستخدم الحقيقي.',
    },

    detail: {
      en: 'We design and build digital experiences that carry the brand, communicate clearly and guide people naturally toward the next action — across websites, applications and interactive products.',
      ar: 'نصمم ونبني تجارب رقمية تعكس العلامة بوضوح، وتوصل الرسالة بكفاءة، وتقود المستخدم بشكل طبيعي نحو الخطوة التالية عبر المواقع والتطبيقات والمنتجات التفاعلية.',
    },

    includes: [
      {
        en: 'Websites',
        ar: 'المواقع الإلكترونية',
      },
      {
        en: 'Landing experiences',
        ar: 'تجارب صفحات الهبوط',
      },
      {
        en: 'Web & mobile applications',
        ar: 'تطبيقات الويب والجوال',
      },
      {
        en: 'UX & UI design',
        ar: 'تصميم تجربة وواجهة المستخدم',
      },
      {
        en: 'Interactive experiences',
        ar: 'التجارب التفاعلية',
      },
      {
        en: 'Digital product design',
        ar: 'تصميم المنتجات الرقمية',
      },
    ],
  },
]

export const serviceById = (id: ServiceId) =>
  services.find((service) => service.id === id)!

export const num = (i: number) =>
  String(i + 1).padStart(2, '0')