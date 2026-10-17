/** Ícones de traço fino, no estilo do app (sem biblioteca: funciona offline). */
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };

export const SunIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const BoltIcon = () => (
  <svg {...base}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);
export const MoonIcon = () => (
  <svg {...base}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
  </svg>
);
export const ShieldIcon = () => (
  <svg {...base}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z" />
    <path d="M12 8v8M9 11h6" />
  </svg>
);
export const BookIcon = () => (
  <svg {...base}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5z" />
    <path d="M4 19a2 2 0 0 1 2-2h13M9 7h6" />
  </svg>
);
export const GearIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);
export const TriangleIcon = () => (
  <svg {...base}>
    <path d="M12 3 21.5 20h-19L12 3z" />
  </svg>
);
export const WindIcon = () => (
  <svg {...base}>
    <path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7" />
  </svg>
);
export const BreakIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="8" />
    <path d="m8 8 8 8" />
  </svg>
);
export const PillarIcon = () => (
  <svg {...base}>
    <path d="M12 2v20" />
    <circle cx="12" cy="4" r="1.6" />
    <circle cx="12" cy="8" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="16" r="1.6" />
    <circle cx="12" cy="20" r="1.6" />
  </svg>
);
export const ScrollIcon = () => (
  <svg {...base}>
    <path d="M7 3h11a2 2 0 0 1 2 2v2H9M7 3a2 2 0 0 0-2 2v12a2 2 0 0 1-2 2h11a2 2 0 0 0 2-2V7" />
    <path d="M9 11h5M9 15h4" />
  </svg>
);
export const BlocksIcon = () => (
  <svg {...base}>
    <rect x="3" y="11" width="6" height="6" />
    <rect x="9" y="11" width="6" height="6" />
    <rect x="9" y="5" width="6" height="6" />
    <rect x="15" y="11" width="6" height="6" />
  </svg>
);
export const Chevron = () => (
  <svg {...base} width={18} height={18}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const KnotIcon = () => (
  <svg {...base}>
    <path d="M4 12c3 0 4-5 8-5s4 10 8 10M4 17c4 0 4-10 8-10" />
    <path d="M20 7c-3 0-4 5-8 5" />
  </svg>
);
export const HeartIcon = () => (
  <svg {...base}>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </svg>
);
