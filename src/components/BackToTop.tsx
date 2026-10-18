import { useLang } from '../lib/i18n'
import { scrollToHash } from '../lib/scroll'

export function BackToTop() {
  const { tr } = useLang()

  return (
    <>
      <style>{`
        .cm-back-to-top {
          position: fixed;
          right: max(20px, env(safe-area-inset-right));
          bottom: calc(20px + env(safe-area-inset-bottom));
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 50%;
          background: #f6620d;
          color: #ffffff;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: background 180ms ease, transform 180ms ease;
        }

        @media (hover: hover) {
          .cm-back-to-top:hover {
            background: #df5206;
            transform: translateY(-3px);
          }
        }

        .cm-back-to-top:focus-visible {
          outline: 3px solid #ffffff;
          outline-offset: 4px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cm-back-to-top {
            transition: none;
          }
        }
      `}</style>

      <button
        type="button"
        className="cm-back-to-top"
        aria-label={tr({
          en: 'Back to top',
          ar: 'العودة إلى الأعلى',
        })}
        onClick={() => scrollToHash('#page-top')}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 19V5" />
          <path d="m5 12 7-7 7 7" />
        </svg>
      </button>
    </>
  )
}