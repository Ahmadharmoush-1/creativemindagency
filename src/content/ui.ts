import type { L } from '../lib/i18n'

/** Interface and section copy. Collections (services, projects, insights, FAQs) live in their own files. */
export const ui = {
  cta: { en: 'Start a conversation', ar: 'ابدأ الحوار' } as L,
  explore: { en: 'Explore our work', ar: 'استكشف أعمالنا' } as L,
  menu: { en: 'Menu', ar: 'القائمة' } as L,
  close: { en: 'Close', ar: 'إغلاق' } as L,
  skip: { en: 'Skip to content', ar: 'انتقل إلى المحتوى' } as L,
  scroll: { en: 'Scroll', ar: 'مرّر' } as L,
  journey: [
    { en: 'Thought', ar: 'فكر' },
    { en: 'Idea', ar: 'فكرة' },
    { en: 'System', ar: 'نظام' },
    { en: 'Action', ar: 'فعل' },
    { en: 'Growth', ar: 'نمو' },
  ] as L[],

  hero: {
    lines: {
      en: ['Mind', 'Made', 'Visible.'],
      ar: ['نجعل', 'الفكر', 'مرئيًّا.'],
    },
    sub: {
      en: 'Brands, campaigns and digital systems designed to move your business forward.',
      ar: 'علامات وحملات وأنظمة رقمية مصمَّمة لتدفع نشاطك إلى الأمام.',
    } as L,
    kicker: { en: 'Creative intelligence for modern brands', ar: 'ذكاء إبداعي للعلامات المعاصرة' } as L,
    alt: {
      en: 'The Creative Mind character stands on a ridge, looking along a glowing orange path that climbs to a mountain summit.',
      ar: 'شخصية كرييتف مايند تقف على حافة جبلية وتتأمل مسارًا برتقاليًا مضيئًا يصعد إلى القمة.',
    } as L,
  },

  belief: {
    eyebrow: { en: 'What we believe', ar: 'ما نؤمن به' } as L,
    l1: { en: 'We don’t decorate brands.', ar: 'لا نزيّن العلامات.' } as L,
    l2a: { en: 'We ', ar: 'نحن ' } as L,
    l2b: { en: 'engineer them.', ar: 'نهندسها.' } as L,
    p1: {
      en: 'Creative Mind operates at the intersection of art and science.',
      ar: 'تعمل كرييتف مايند عند نقطة التقاء الفن بالعلم.',
    } as L,
    p2: {
      en: 'Every brand we touch is built as a connected system — strategy, content, campaigns, media, digital experiences, automation and growth — engineered to compound over time.',
      ar: 'كل علامة نعمل عليها تُبنى كنظام مترابط: استراتيجية ومحتوى وحملات وإعلام وتجارب رقمية وأتمتة ونمو، مُهندَسة ليتراكم أثرها مع الوقت.',
    } as L,
    signals: [
      { en: 'Strategy', ar: 'استراتيجية' },
      { en: 'Content', ar: 'محتوى' },
      { en: 'Campaigns', ar: 'حملات' },
      { en: 'Media', ar: 'إعلام' },
      { en: 'Digital', ar: 'رقمي' },
      { en: 'Automation', ar: 'أتمتة' },
      { en: 'Growth', ar: 'نمو' },
    ] as L[],
    from: { en: 'Separate signals', ar: 'إشارات متفرقة' } as L,
    to: { en: 'One system', ar: 'نظام واحد' } as L,
  },

  symbols: {
    eyebrow: { en: 'The thinking behind the name', ar: 'الفكرة خلف الاسم' } as L,
    title: { en: ['Two symbols.', 'One system.'], ar: ['رمزان.', 'نظام واحد.'] },
    intro: {
      en: 'Two letters inside CREATIVE carry the way we work. The A lifts. The V focuses.',
      ar: 'حرفان داخل كلمة CREATIVE يحملان طريقتنا في العمل. حرف A يرفع، وحرف V يركّز.',
    } as L,
    a: {
      tag: { en: 'Growth Arrow', ar: 'سهم النمو' } as L,
      copy: {
        en: 'Upward momentum. Every move designed to lift the brand higher.',
        ar: 'زخم صاعد. كل خطوة مصمَّمة لترفع العلامة أعلى.',
      } as L,
      words: [
        { en: 'Strategy', ar: 'استراتيجية' },
        { en: 'Attention', ar: 'انتباه' },
        { en: 'Momentum', ar: 'زخم' },
        { en: 'Growth', ar: 'نمو' },
      ] as L[],
    },
    v: {
      tag: { en: 'Conversion Funnel', ar: 'مسار التحويل' } as L,
      copy: {
        en: 'Focused intent. Attention narrowed into measurable action.',
        ar: 'نيّة مركّزة. انتباه يضيق حتى يصير فعلًا قابلًا للقياس.',
      } as L,
      words: [
        { en: 'Attention', ar: 'انتباه' },
        { en: 'Interest', ar: 'اهتمام' },
        { en: 'Intent', ar: 'نيّة' },
        { en: 'Action', ar: 'فعل' },
      ] as L[],
    },
  },

  services: {
    eyebrow: { en: 'Services', ar: 'خدماتنا' } as L,
    title: { en: ['What', 'we build'], ar: ['ما', 'نبنيه'] },
    intro: {
      en: 'We don’t sell disconnected services. We build assets and systems that compound.',
      ar: 'لا نبيع خدمات متفرقة. نبني أصولًا وأنظمة يتراكم أثرها.',
    } as L,
    all: { en: 'All services', ar: 'كل الخدمات' } as L,
    includes: { en: 'Includes', ar: 'يشمل' } as L,
  },

  work: {
    eyebrow: { en: 'Our work', ar: 'أعمالنا' } as L,
    title: { en: ['Selected', 'work.'], ar: ['أعمال', 'مختارة.'] },
    intro: { en: 'Built to move businesses forward.', ar: 'بُنيت لتدفع الأعمال إلى الأمام.' } as L,
    concept: { en: 'Concept case', ar: 'حالة توضيحية' } as L,
    challenge: { en: 'Challenge', ar: 'التحدي' } as L,
    approach: { en: 'Approach', ar: 'المقاربة' } as L,
    outcome: { en: 'Outcome', ar: 'النتيجة' } as L,
    disciplines: { en: 'Disciplines', ar: 'التخصصات' } as L,
    industry: { en: 'Industry', ar: 'القطاع' } as L,
    view: { en: 'View case study', ar: 'عرض دراسة الحالة' } as L,
    all: { en: 'All work', ar: 'كل الأعمال' } as L,
    allFilter: { en: 'All', ar: 'الكل' } as L,
    next: { en: 'Next case', ar: 'الحالة التالية' } as L,
    endTitle: { en: ['Your project', 'could be next.'], ar: ['مشروعك', 'قد يكون التالي.'] },
  },

  process: {
    eyebrow: { en: 'How Creative Mind works', ar: 'كيف نعمل' } as L,
    title: { en: ['From thinking', 'to impact.'], ar: ['من الفكرة', 'إلى الأثر.'] },
    stages: [
      {
        t: { en: 'Understand', ar: 'نفهم' },
        d: { en: 'The business, the audience and the real problem.', ar: 'النشاط والجمهور والمشكلة الحقيقية.' },
      },
      {
        t: { en: 'Design', ar: 'نصمّم' },
        d: { en: 'A strategy and an idea worth building.', ar: 'استراتيجية وفكرة تستحق أن تُبنى.' },
      },
      {
        t: { en: 'Build', ar: 'نبني' },
        d: {
          en: 'Brand, content, product and the system behind them.',
          ar: 'العلامة والمحتوى والمنتج والنظام الذي خلفها.',
        },
      },
      {
        t: { en: 'Launch', ar: 'نُطلق' },
        d: { en: 'Into market, across the channels that matter.', ar: 'إلى السوق، عبر القنوات المؤثرة.' },
      },
      {
        t: { en: 'Learn', ar: 'نتعلّم' },
        d: { en: 'Read the signal. Keep what works.', ar: 'نقرأ الإشارة ونُبقي ما ينجح.' },
      },
      {
        t: { en: 'Grow', ar: 'ننمو' },
        d: { en: 'Feed what we learned into the next move.', ar: 'نضخّ ما تعلّمناه في الخطوة التالية.' },
      },
    ] as { t: L; d: L }[],
  },

  eco: {
    eyebrow: { en: 'Connected disciplines', ar: 'تخصصات مترابطة' } as L,
    title: { en: ['One connected', 'business system.'], ar: ['نظام أعمال', 'واحد مترابط.'] },
    core: { en: ['Creative', 'Intelligence'], ar: ['الذكاء', 'الإبداعي'] },
    hint: { en: 'Hover or focus a discipline', ar: 'مرّر أو ركّز على أحد التخصصات' } as L,
    hintTouch: { en: 'Tap a discipline', ar: 'اضغط على أحد التخصصات' } as L,
    nodes: [
      {
        t: { en: 'Brand', ar: 'العلامة' },
        d: { en: 'Gives everything else a point of view.', ar: 'تمنح كل ما عداها وجهة نظر.' },
      },
      {
        t: { en: 'Campaigns', ar: 'الحملات' },
        d: { en: 'Carry that point of view to people.', ar: 'تحمل وجهة النظر إلى الناس.' },
      },
      {
        t: { en: 'Systems', ar: 'الأنظمة' },
        d: { en: 'Keep the work consistent as it scales.', ar: 'تحافظ على اتساق العمل وهو يتوسّع.' },
      },
      {
        t: { en: 'Funnels', ar: 'المسارات' },
        d: { en: 'Turn attention into action.', ar: 'تحوّل الانتباه إلى فعل.' },
      },
      {
        t: { en: 'Automation', ar: 'الأتمتة' },
        d: { en: 'Keeps the path moving without manual effort.', ar: 'تُبقي المسار متحركًا دون جهد يدوي.' },
      },
      {
        t: { en: 'Digital', ar: 'الرقمي' },
        d: { en: 'Is where the brand is actually experienced.', ar: 'حيث تُعاش العلامة فعلًا.' },
      },
      {
        t: { en: 'Growth', ar: 'النمو' },
        d: { en: 'Feeds what was learned back into all of it.', ar: 'يعيد ما تعلّمناه إلى كل ذلك.' },
      },
    ] as { t: L; d: L }[],
  },

  about: {
    eyebrow: { en: 'About', ar: 'من نحن' } as L,
    title: { en: ['One mind.', 'Multiple disciplines.'], ar: ['عقل واحد.', 'تخصصات متعددة.'] },
    pageTitle: { en: ['Where intelligence', 'meets imagination.'], ar: ['حيث يلتقي الذكاء', 'بالخيال.'] },
    lead: {
      en: 'Creative Mind combines branding, advertising, digital, media, content, automation and growth as one connected system.',
      ar: 'تجمع كرييتف مايند بين بناء العلامات والإعلان والرقمي والإعلام والمحتوى والأتمتة والنمو في نظام واحد مترابط.',
    } as L,
    more: { en: 'About Creative Mind', ar: 'عن كرييتف مايند' } as L,
    charAlt: {
      en: 'The Creative Mind character: a small figure in a navy hooded suit with a glowing orange visor.',
      ar: 'شخصية كرييتف مايند: مجسّم صغير ببدلة كحلية وخوذة ذات واجهة برتقالية مضيئة.',
    } as L,
    charNote: {
      en: 'Curious by design. The character stands for the intelligence that guides every signal.',
      ar: 'فضولي بطبعه. الشخصية ترمز إلى الذكاء الذي يقود كل إشارة.',
    } as L,
    blocks: [
      {
        k: { en: 'Our philosophy', ar: 'فلسفتنا' },
        h: { en: 'Brands are engineered, not decorated.', ar: 'العلامات تُهندَس ولا تُزيَّن.' },
        p: {
          en: 'A logo and a campaign are outputs. The thing we build is the structure underneath: what the brand means, how it behaves and how it earns its next customer.',
          ar: 'الشعار والحملة مخرجات. ما نبنيه هو الهيكل الذي تحتها: ما تعنيه العلامة، وكيف تتصرف، وكيف تكسب عميلها التالي.',
        },
      },
      {
        k: { en: 'Our approach', ar: 'مقاربتنا' },
        h: { en: 'Lift, then focus.', ar: 'نرفع، ثم نركّز.' },
        p: {
          en: 'The A is how we think about growth: every move should raise the brand. The V is how we think about conversion: attention is only useful once it narrows into action. We plan both at the same table.',
          ar: 'حرف A هو طريقتنا في التفكير بالنمو: كل خطوة يجب أن ترفع العلامة. وحرف V هو طريقتنا في التفكير بالتحويل: الانتباه لا ينفع إلا حين يضيق ويصير فعلًا. ونخطط للاثنين على الطاولة نفسها.',
        },
      },
    ] as { k: L; h: L; p: L }[],
    principlesTitle: { en: 'Our principles', ar: 'مبادئنا' } as L,
    principles: [
      {
        t: { en: 'Strategic Thinking', ar: 'تفكير استراتيجي' },
        d: {
          en: 'Decide what matters before deciding how it looks.',
          ar: 'نحدّد ما يهمّ قبل أن نحدّد كيف يبدو.',
        },
      },
      {
        t: { en: 'Human-Led Creativity', ar: 'إبداع يقوده الإنسان' },
        d: { en: 'Tools speed the work. People give it meaning.', ar: 'الأدوات تسرّع العمل، والناس يمنحونه المعنى.' },
      },
      {
        t: { en: 'Systems Thinking', ar: 'تفكير منظومي' },
        d: {
          en: 'Nothing is built alone. Each piece strengthens the rest.',
          ar: 'لا شيء يُبنى منفردًا. كل جزء يقوّي الباقي.',
        },
      },
      {
        t: { en: 'Measurable Growth', ar: 'نمو قابل للقياس' },
        d: {
          en: 'If it can’t be seen in the business, it isn’t finished.',
          ar: 'ما لا يظهر أثره في النشاط لم يكتمل بعد.',
        },
      },
    ] as { t: L; d: L }[],
  },

  insights: {
    eyebrow: { en: 'Creative intelligence', ar: 'ذكاء إبداعي' } as L,
    title: { en: ['Thinking'], ar: ['أفكار'] },
    intro: {
      en: 'Notes on brand, marketing and growth from inside the work.',
      ar: 'ملاحظات عن العلامات والتسويق والنمو من داخل العمل.',
    } as L,
    all: { en: 'All thinking', ar: 'كل الأفكار' } as L,
    read: { en: 'Read', ar: 'اقرأ' } as L,
    min: { en: 'min read', ar: 'دقائق قراءة' } as L,
    back: { en: 'All thinking', ar: 'كل الأفكار' } as L,
    empty: { en: 'Nothing published in this category yet.', ar: 'لا يوجد محتوى منشور في هذا التصنيف بعد.' } as L,
  },

  contact: {
    eyebrow: { en: 'Contact', ar: 'تواصل' } as L,
    title: { en: ['Let’s build', 'what’s next.'], ar: ['لنبنِ', 'ما هو قادم.'] },
    intro: {
      en: 'Tell us where the business is and where it needs to go. We’ll reply with a clear first step.',
      ar: 'أخبرنا أين يقف نشاطك وإلى أين يجب أن يصل. سنردّ عليك بخطوة أولى واضحة.',
    } as L,
    name: { en: 'Name', ar: 'الاسم' } as L,
    company: { en: 'Company', ar: 'الشركة' } as L,
    email: { en: 'Email', ar: 'البريد الإلكتروني' } as L,
    phone: { en: 'Phone / WhatsApp', ar: 'الهاتف / واتساب' } as L,
    need: { en: 'What do you need help with?', ar: 'بماذا تحتاج المساعدة؟' } as L,
    message: { en: 'Project message', ar: 'رسالة عن المشروع' } as L,
    cats: [
      { en: 'Brand', ar: 'علامة' },
      { en: 'Campaign', ar: 'حملة' },
      { en: 'System', ar: 'نظام' },
      { en: 'Funnel', ar: 'مسار تحويل' },
      { en: 'Automation', ar: 'أتمتة' },
      { en: 'Digital Experience', ar: 'تجربة رقمية' },
      { en: 'Growth', ar: 'نمو' },
    ] as L[],
    whatsapp: { en: 'Chat on WhatsApp', ar: 'تحدّث عبر واتساب' } as L,
    sending: { en: 'Sending', ar: 'جارٍ الإرسال' } as L,
    errName: { en: 'Enter your name.', ar: 'اكتب اسمك.' } as L,
    errEmail: { en: 'Enter a valid email address.', ar: 'اكتب بريدًا إلكترونيًا صحيحًا.' } as L,
    errSend: {
      en: 'The message didn’t send. Check your connection and try again.',
      ar: 'لم تُرسَل الرسالة. تحقق من الاتصال وحاول مجددًا.',
    } as L,
    success: { en: 'Message received.', ar: 'وصلت رسالتك.' } as L,
    success2: { en: 'Let’s make something visible.', ar: 'لنجعل شيئًا مرئيًّا.' } as L,
    again: { en: 'Send another message', ar: 'أرسل رسالة أخرى' } as L,
    required: { en: 'required', ar: 'مطلوب' } as L,
  },

  faq: {
    eyebrow: { en: 'FAQ', ar: 'أسئلة شائعة' } as L,
    title: { en: ['Good', 'questions.'], ar: ['أسئلة', 'في محلّها.'] },
  },

  footer: {
    nav: { en: 'Navigate', ar: 'تصفّح' } as L,
    services: { en: 'Services', ar: 'الخدمات' } as L,
    language: { en: 'Language', ar: 'اللغة' } as L,
    social: { en: 'Follow', ar: 'تابعنا' } as L,
    rights: { en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' } as L,
  },

  notFound: {
    title: { en: ['Off the', 'path.'], ar: ['خارج', 'المسار.'] },
    p: { en: 'This page doesn’t exist. The way back is below.', ar: 'هذه الصفحة غير موجودة. طريق العودة في الأسفل.' } as L,
    home: { en: 'Back to home', ar: 'العودة إلى الرئيسية' } as L,
  },
}
