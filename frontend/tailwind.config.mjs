/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forge: {
          bg: '#0b0f1a',
          panel: '#111726',
          panel2: '#161d2f',
          border: '#232c42',
          text: '#e6ecff',
          muted: '#8ea0c9',
          brand: '#6366f1',
          brand2: '#22d3ee',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      minHeight: {
        touch: '48px',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .3s ease-out both',
      },
    },
  },
  plugins: [],
};
