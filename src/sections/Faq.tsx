// import { useState } from 'react'
// import { useLang } from '../lib/i18n'
// import { ScrollTrigger } from '../lib/gsap'
// import { faqs } from '../content/faqs'
// import { ui } from '../content/ui'
// import { Eyebrow, Lines, dot } from '../components/Brand'

// export function Faq() {
//   const { tr, lang } = useLang()
//   const [open, setOpen] = useState<number | null>(0)
//   const toggle = (i: number) => {
//     setOpen((o) => (o === i ? null : i))
//     // The page height changes as a panel opens; re-measure once the transition ends.
//     window.setTimeout(() => ScrollTrigger.refresh(), 650)
//   }
//   return (
//     <section className="section">
//       <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
//         <div>
//           <Eyebrow className="mb-7 text-white/70">{tr(ui.faq.eyebrow)}</Eyebrow>
//           <Lines className="t-display !text-[clamp(2.4rem,5.4vw,5.4rem)]" lines={[<span className="thin">{ui.faq.title[lang][0]}</span>, dot(ui.faq.title[lang][1])]} />
//         </div>
//         <div data-reveal="up">
//           <div className="acc-line" />
//           {faqs.map((f, i) => (
//             <div key={f.q.en}>
//               <div className="acc-item" data-open={open === i}>
//                 <h3>
//                   <button
//                     type="button"
//                     id={`faq-b-${i}`}
//                     aria-expanded={open === i}
//                     aria-controls={`faq-p-${i}`}
//                     onClick={() => toggle(i)}
//                     className="flex w-full items-center justify-between gap-6 py-6 text-start text-[clamp(1.05rem,1.5vw,1.35rem)] font-medium transition-colors duration-300 hover:text-signal"
//                   >
//                     {tr(f.q)}
//                     <span className="acc-plus relative block h-4 w-4 shrink-0" aria-hidden="true" />
//                   </button>
//                 </h3>
//                 <div className="acc-panel" id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} {...({ inert: open !== i ? '' : undefined } as object)}>
//                   <div>
//                     <p className="muted max-w-[60ch] pb-7 leading-relaxed rtl:leading-loose">{tr(f.a)}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="acc-line" />
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }
