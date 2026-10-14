import type { L } from '../lib/i18n'
import type { ArtKind } from './projects'

export const insightCategories: { id: string; label: L }[] = [
  { id: 'brand', label: { en: 'Brand', ar: 'العلامة' } },
  { id: 'marketing', label: { en: 'Marketing', ar: 'التسويق' } },
  { id: 'advertising', label: { en: 'Advertising', ar: 'الإعلان' } },
  { id: 'digital', label: { en: 'Digital', ar: 'الرقمي' } },
  { id: 'growth', label: { en: 'Growth', ar: 'النمو' } },
  { id: 'ai', label: { en: 'AI', ar: 'الذكاء الاصطناعي' } },
  { id: 'culture', label: { en: 'Culture', ar: 'الثقافة' } },
]

export type Insight = {
  slug: string
  category: string
  title: L
  excerpt: L
  body: L[]
  minutes: number
  art: ArtKind
}

/** CMS collection: Insights. Starter articles, written to be replaced or extended. */
export const insights: Insight[] = [
  {
    slug: 'brand-is-a-system',
    category: 'brand',
    title: { en: 'A brand is a system, not a surface.', ar: 'العلامة نظام، لا سطح.' },
    excerpt: {
      en: 'Why the logo is the last thing to decide, and what should come before it.',
      ar: 'لماذا يكون الشعار آخر ما نقرره، وما الذي يجب أن يسبقه.',
    },
    body: [
      {
        en: 'Most rebrands start with the surface: a new mark, a new palette, a new typeface. Those are the visible parts, so they feel like the work. But a surface without a structure underneath it starts drifting the moment a second person has to use it.',
        ar: 'معظم مشاريع تجديد العلامة تبدأ من السطح: شعار جديد، ألوان جديدة، خط جديد. هذه هي الأجزاء المرئية، فتبدو كأنها العمل كله. لكن سطحًا بلا هيكل تحته يبدأ بالانحراف منذ اللحظة التي يستخدمه فيها شخص ثانٍ.',
      },
      {
        en: 'The structure is a small set of decisions: who the brand is for, what it refuses to be, how it speaks, and how it behaves when it has to choose. Once those are settled, the visual identity stops being a matter of taste and becomes the most direct way to make those decisions visible.',
        ar: 'الهيكل مجموعة صغيرة من القرارات: لمن هذه العلامة، وما الذي ترفض أن تكونه، وكيف تتحدث، وكيف تتصرف حين يجب أن تختار. وحين تُحسَم هذه القرارات تتوقف الهوية البصرية عن كونها مسألة ذوق، وتصير أقصر طريق لجعل تلك القرارات مرئية.',
      },
    ],
    minutes: 4,
    art: 'mono',
  },
  {
    slug: 'the-funnel-is-about-focus',
    category: 'marketing',
    title: { en: 'The funnel is a story about focus.', ar: 'مسار التحويل حكاية عن التركيز.' },
    excerpt: {
      en: 'Reading the V in our name as a discipline rather than a diagram.',
      ar: 'قراءة حرف V في اسمنا بوصفه انضباطًا لا رسمًا توضيحيًا.',
    },
    body: [
      {
        en: 'A funnel diagram makes conversion look like gravity: pour people in at the top and some fall out of the bottom. In practice nothing falls. At every stage a person decides whether what they see next is worth more of their attention.',
        ar: 'رسم مسار التحويل يجعل التحويل يبدو كالجاذبية: نصبّ الناس من الأعلى فيخرج بعضهم من الأسفل. في الواقع لا شيء يسقط. في كل مرحلة يقرر الإنسان هل ما سيراه تاليًا يستحق مزيدًا من انتباهه.',
      },
      {
        en: 'So we treat the funnel as an exercise in removal. Each step should ask for one thing and take away everything that competes with it. The narrowing is the point: broad attention only becomes useful once it has somewhere specific to go.',
        ar: 'لهذا نتعامل مع المسار كتمرين في الحذف. كل خطوة تطلب شيئًا واحدًا وتُبعد كل ما ينافسه. التضييق هو الغاية: الانتباه الواسع لا يصير نافعًا إلا حين يجد وجهة محددة.',
      },
    ],
    minutes: 3,
    art: 'converge',
  },
  {
    slug: 'attention-rented-memory-owned',
    category: 'advertising',
    title: { en: 'Attention is rented. Memory is owned.', ar: 'الانتباه مُستأجَر. والذاكرة مملوكة.' },
    excerpt: {
      en: 'What a campaign should leave behind after the media budget ends.',
      ar: 'ما الذي يجب أن تتركه الحملة بعد انتهاء ميزانية الإعلام.',
    },
    body: [
      {
        en: 'Media buys attention for a fixed period. When the spend stops, the attention stops with it. What stays is whatever people can still recall: a line, a shape, a feeling about who you are.',
        ar: 'الإعلام يشتري الانتباه لمدة محددة. حين يتوقف الإنفاق يتوقف الانتباه معه. وما يبقى هو ما يستطيع الناس تذكّره: عبارة، شكل، إحساس بمن تكون.',
      },
      {
        en: 'That is why we plan campaigns around distinctive assets before we plan them around channels. A campaign that builds memory makes the next one cheaper to run. One that only rents attention has to start again from nothing.',
        ar: 'لهذا نخطط الحملات حول الأصول المميِّزة قبل أن نخططها حول القنوات. الحملة التي تبني ذاكرة تجعل الحملة التالية أقل كلفة. والتي تستأجر الانتباه فقط تبدأ من الصفر في كل مرة.',
      },
    ],
    minutes: 3,
    art: 'wave',
  },
  {
    slug: 'your-website-is-the-brand',
    category: 'digital',
    title: {
      en: 'Your website is the brand most people actually meet.',
      ar: 'موقعك هو العلامة التي يلتقيها معظم الناس فعلًا.',
    },
    excerpt: {
      en: 'Speed, clarity and the next step matter more than the mood board.',
      ar: 'السرعة والوضوح والخطوة التالية أهم من لوحة الإلهام.',
    },
    body: [
      {
        en: 'For most businesses the first real encounter with the brand is a page loading on a phone. In that moment, the brand is how fast the page appears, whether the first sentence makes sense, and whether it is obvious what to do next.',
        ar: 'عند معظم الأعمال، أول لقاء حقيقي بالعلامة هو صفحة تُحمَّل على هاتف. في تلك اللحظة تكون العلامة هي سرعة ظهور الصفحة، ووضوح الجملة الأولى، وبداهة الخطوة التالية.',
      },
      {
        en: 'We design digital experiences from that moment outward. Expression matters, and we care about it a great deal, but it has to be carried by an interface that respects the visitor’s time.',
        ar: 'نصمّم التجارب الرقمية انطلاقًا من تلك اللحظة. التعبير مهم ونعتني به كثيرًا، لكنه يجب أن يُحمَل على واجهة تحترم وقت الزائر.',
      },
    ],
    minutes: 4,
    art: 'screens',
  },
  {
    slug: 'growth-compounds-when-pieces-talk',
    category: 'growth',
    title: {
      en: 'Growth compounds only when the pieces talk.',
      ar: 'النمو لا يتراكم إلا حين تتحاور الأجزاء.',
    },
    excerpt: {
      en: 'Disconnected services reset every quarter. Connected ones build.',
      ar: 'الخدمات المتفرقة تبدأ من جديد كل ربع سنة. والمترابطة تبني.',
    },
    body: [
      {
        en: 'When brand, media, content and sales tools are bought separately, each one optimises for its own number. The result is activity that looks healthy in every report and still fails to add up.',
        ar: 'حين تُشترى العلامة والإعلام والمحتوى وأدوات المبيعات كلٌّ على حدة، يحسّن كل طرف رقمه الخاص. والنتيجة نشاط يبدو سليمًا في كل تقرير، ومع ذلك لا يصنع مجموعًا.',
      },
      {
        en: 'Compounding needs a loop: what the campaign learns should change the landing page, what sales hears should change the content, and what the data shows should change the next brief. Our job is to build that loop and keep it turning.',
        ar: 'التراكم يحتاج إلى حلقة: ما تتعلمه الحملة يغيّر صفحة الهبوط، وما يسمعه فريق المبيعات يغيّر المحتوى، وما تُظهره البيانات يغيّر الموجز التالي. عملنا أن نبني هذه الحلقة ونُبقيها دائرة.',
      },
    ],
    minutes: 4,
    art: 'loop',
  },
  {
    slug: 'ai-makes-more-judgement-decides',
    category: 'ai',
    title: { en: 'AI makes more. Judgement decides what matters.', ar: 'الذكاء الاصطناعي يُنتج أكثر. والتقدير يقرر ما يهمّ.' },
    excerpt: {
      en: 'How we use AI in the studio, and where we keep it out.',
      ar: 'كيف نستخدم الذكاء الاصطناعي في الاستوديو، وأين نُبقيه خارجًا.',
    },
    body: [
      {
        en: 'AI has made production abundant. Variations, drafts, formats and translations that used to take days now take minutes. That is useful, and we use it wherever it removes repetition.',
        ar: 'جعل الذكاء الاصطناعي الإنتاج وفيرًا. التنويعات والمسودات والمقاسات والترجمات التي كانت تستغرق أيامًا صارت تستغرق دقائق. هذا نافع، ونستخدمه حيثما يزيل التكرار.',
      },
      {
        en: 'What it has not changed is the decision about which idea is worth making and whether it is true to the brand. That decision stays with people who know the business and are accountable for the outcome.',
        ar: 'ما لم يتغير هو القرار: أي فكرة تستحق التنفيذ، وهل هي صادقة مع العلامة. هذا القرار يبقى عند أناس يعرفون النشاط ويتحملون مسؤولية النتيجة.',
      },
    ],
    minutes: 3,
    art: 'ascent',
  },
  {
    slug: 'arabic-first-not-arabic-too',
    category: 'culture',
    title: { en: 'Designing for Arabic first, not Arabic too.', ar: 'نصمّم للعربية أولًا، لا للعربية أيضًا.' },
    excerpt: {
      en: 'A mirrored layout is not a translated experience.',
      ar: 'التصميم المعكوس ليس تجربة مترجمة.',
    },
    body: [
      {
        en: 'Flipping a layout from left to right is the easy part of a bilingual brand. The harder part is rhythm: Arabic type sits differently on the line, needs more room to breathe, and carries emphasis in other ways than capital letters and tight tracking.',
        ar: 'قلب التصميم من اليسار إلى اليمين هو الجزء السهل في علامة ثنائية اللغة. الأصعب هو الإيقاع: الحرف العربي يجلس على السطر بطريقة مختلفة، ويحتاج إلى مساحة أوسع ليتنفس، ويحمل التأكيد بوسائل غير الحروف الكبيرة وتقارب المسافات.',
      },
      {
        en: 'So we write and design the two languages side by side from the first day. Each one gets its own line breaks, its own scale and its own voice, and neither is treated as the copy of the other.',
        ar: 'لهذا نكتب ونصمّم اللغتين جنبًا إلى جنب منذ اليوم الأول. لكل لغة فواصل أسطرها ومقاسها وصوتها، ولا تُعامَل أي منهما كنسخة عن الأخرى.',
      },
    ],
    minutes: 3,
    art: 'mono',
  },
]

export const insightBySlug = (slug?: string) => insights.find((i) => i.slug === slug)
export const categoryLabel = (id: string) => insightCategories.find((c) => c.id === id)!.label
