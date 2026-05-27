/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cc: {
          bg: '#0a0e1a',
          surface: '#111827',
          surface2: '#1a2235',
          accent: '#00d4aa',
          accent2: '#00b4d8',
          text: '#e2e8f0',
          muted: '#64748b',
          warn: '#f59e0b',
          danger: '#ef4444',
          border: '#1e293b',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'brukare-time': ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        'brukare-name': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'brukare-body': ['1.5rem', { lineHeight: '1.4' }],
        'brukare-greeting': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
      }
    },
  },
  plugins: [],
}
