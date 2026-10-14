import type { L } from '../lib/i18n'

/** Global site settings. Replace the placeholders before launch. */
export const site = {
  name: 'Creative Mind',
  tagline: { en: 'Mind Made Visible.', ar: 'نجعل الفكر مرئيًّا.' } as L,
  // TODO: real WhatsApp number in international format, digits only (e.g. 9665XXXXXXXX).
  whatsapp: '',
  // TODO: real inbox.
  email: 'hello@creativemind.example',
  social: [
    { label: 'Instagram', href: '#' },
    { label: 'LinkedIn', href: '#' },
    { label: 'Behance', href: '#' },
  ],
}

/**
 * Landing-page navigation. Each entry points at a section id on the page
 * (the ids are set in src/pages/Home.tsx and in the sections themselves).
 */
export const nav: { to: string; label: L }[] = [
  { to: '#belief', label: { en: 'What we believe', ar: 'ما نؤمن به' } },
  { to: '#symbols', label: { en: 'Symbols', ar: 'الرموز' } },
  { to: '#services', label: { en: 'Services', ar: 'خدماتنا' } },
  { to: '#selected-work', label: { en: 'Work', ar: 'أعمالنا' } },
  { to: '#about', label: { en: 'About', ar: 'من نحن' } },
  { to: '#contact', label: { en: 'Contact', ar: 'تواصل' } },
]
