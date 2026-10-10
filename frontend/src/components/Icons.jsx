// Inline SVG icon set (stroke-based, currentColor) — no external deps.
const PATHS = {
  braces: 'M8 3H7a2 2 0 0 0-2 2v4l-2 3 2 3v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4l2 3-2 3v4a2 2 0 0 1-2 2h-1',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01',
  database: 'M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6',
  layers: 'M12 3 3 8l9 5 9-5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  rocket: 'M5 15c-1 1-1.5 4-1.5 4s3-.5 4-1.5M9 15l-3-3a12 12 0 0 1 9-9l4-1-1 4a12 12 0 0 1-9 9zM14 9h.01',
  code: 'M8 6 3 12l5 6M16 6l5 6-5 6',
  check: 'M4 12l5 5L20 6',
  copy: 'M8 8h10v12H8zM6 4h10v2M6 4H4v12h2',
  chevron: 'M9 6l6 6-6 6',
  sparkles: 'M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3',
  shield: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z',
  activity: 'M3 12h4l2 6 4-14 2 8h6',
  cpu: 'M6 6h12v12H6zM9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3',
  play: 'M6 4l14 8-14 8z',
  terminal: 'M5 7l5 5-5 5M13 17h6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4 3.6-6 8-6s8 2 8 6',
  logout: 'M9 6V4h10v16H9v-2M4 12h10M11 9l3 3-3 3',
};

export function Icon({ name, size = 20, className = '', ...rest }) {
  const d = PATHS[name] || PATHS.code;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
