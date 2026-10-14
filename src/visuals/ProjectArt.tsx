import type { ArtKind } from '../content/projects'

const O = '#F6620D'

/**
 * Generated cover art in the brand palette, used until real case imagery exists.
 * Each kind is built from the A / V / sphere vocabulary rather than stock imagery.
 */
export function ProjectArt({ kind, className = '', label }: { kind: ArtKind; className?: string; label?: string }) {
  const id = `pa-${kind}`
  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0A2466" />
          <stop offset="1" stopColor="#030E2E" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={O} stopOpacity=".55" />
          <stop offset="1" stopColor={O} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-sph`} cx=".34" cy=".28" r=".8">
          <stop offset="0" stopColor="#FFC296" />
          <stop offset=".45" stopColor={O} />
          <stop offset="1" stopColor="#B8430A" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${id}-bg)`} />

      {kind === 'ascent' && (
        <>
          <circle cx="560" cy="150" r="260" fill={`url(#${id}-glow)`} />
          <path d="M-20 600 200 330 330 470 460 280 640 600Z" fill="#0A2466" />
          <path d="M240 600 560 130 880 600Z" fill="#081D55" />
          <path d="M560 130 880 600 640 600 590 360Z" fill="#030E2E" opacity=".7" />
          <path d="M60 600 C200 520 300 540 380 450 S470 330 500 300 540 200 560 130" fill="none" stroke={O} strokeWidth="4" strokeLinecap="round" />
          <circle cx="560" cy="130" r="14" fill={`url(#${id}-sph)`} />
        </>
      )}

      {kind === 'wave' && (
        <>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M-20 ${190 + i * 44} C140 ${110 + i * 44} 260 ${270 + i * 44} 400 ${190 + i * 44} S660 ${110 + i * 44} 820 ${190 + i * 44}`}
              fill="none"
              stroke={i === 3 ? O : '#fff'}
              strokeOpacity={i === 3 ? 1 : 0.16 + i * 0.05}
              strokeWidth={i === 3 ? 5 : 1.5}
            />
          ))}
          <circle cx="400" cy="322" r="120" fill={`url(#${id}-glow)`} />
          <circle cx="400" cy="322" r="18" fill={`url(#${id}-sph)`} />
        </>
      )}

      {kind === 'screens' && (
        <>
          <g transform="translate(150 120) skewY(-8)">
            <rect width="400" height="260" rx="14" fill="#081D55" stroke="#fff" strokeOpacity=".45" />
            <rect x="28" y="54" width="210" height="16" rx="8" fill="#fff" />
            <rect x="28" y="92" width="300" height="8" rx="4" fill="#fff" opacity=".35" />
            <rect x="28" y="114" width="250" height="8" rx="4" fill="#fff" opacity=".35" />
            <rect x="28" y="170" width="110" height="36" rx="18" fill={O} />
            <circle cx="30" cy="24" r="5" fill={O} />
          </g>
          <g transform="translate(500 210) skewY(-8)">
            <rect width="160" height="310" rx="26" fill="#030E2E" stroke="#fff" strokeOpacity=".7" />
            <rect x="18" y="44" width="124" height="96" rx="10" fill={O} />
            <rect x="18" y="162" width="110" height="8" rx="4" fill="#fff" opacity=".7" />
            <rect x="18" y="184" width="80" height="8" rx="4" fill="#fff" opacity=".35" />
            <rect x="18" y="206" width="96" height="8" rx="4" fill="#fff" opacity=".35" />
          </g>
        </>
      )}

      {kind === 'converge' && (
        <>
          {Array.from({ length: 15 }, (_, i) => {
            const x = 40 + i * 51.4
            return <path key={i} d={`M${x} -10 C${x} 240 400 300 400 470`} fill="none" stroke="#fff" strokeOpacity={0.12 + Math.abs(7 - i) * 0.035} strokeWidth="1.5" />
          })}
          <path d="M40 -10 400 470 760 -10" fill="none" stroke={O} strokeWidth="3" />
          <circle cx="400" cy="480" r="150" fill={`url(#${id}-glow)`} />
          <path d="M400 470V540" stroke={O} strokeWidth="5" strokeLinecap="round" />
          <circle cx="400" cy="548" r="20" fill={`url(#${id}-sph)`} />
        </>
      )}

      {kind === 'mono' && (
        <>
          <circle cx="400" cy="300" r="300" fill={`url(#${id}-glow)`} opacity=".7" />
          <path d="M190 520 400 70 610 520H520L400 250 280 520Z" fill="#fff" />
          <path d="M400 70 610 520H520L400 250Z" fill="#fff" opacity=".55" />
          <circle cx="400" cy="448" r="40" fill={`url(#${id}-sph)`} />
        </>
      )}

      {kind === 'loop' && (
        <>
          <circle cx="400" cy="300" r="250" fill={`url(#${id}-glow)`} opacity=".5" />
          <circle cx="400" cy="300" r="190" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" />
          <circle cx="400" cy="300" r="120" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" strokeDasharray="3 12" />
          <path d="M400 110A190 190 0 0 1 590 300" fill="none" stroke={O} strokeWidth="5" strokeLinecap="round" />
          {[
            [400, 110],
            [590, 300],
            [400, 490],
            [210, 300],
          ].map(([x, y], i) => (
            <rect key={i} x={x - 26} y={y - 26} width="52" height="52" rx="13" fill="#081D55" stroke={i < 2 ? O : '#fff'} strokeOpacity={i < 2 ? 1 : 0.6} strokeWidth="1.5" />
          ))}
          <circle cx="590" cy="300" r="11" fill={`url(#${id}-sph)`} />
          <circle cx="400" cy="110" r="7" fill={O} />
        </>
      )}
    </svg>
  )
}
