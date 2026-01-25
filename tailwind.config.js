/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        neon: {
          cyan: '#00f5ff',
          purple: '#a855f7',
          magenta: '#ec4899',
          lime: '#39ff14',
        },
        surface: {
          dark: '#1f2937',
          light: '#334155',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Main text
        display: ['Orbitron', 'sans-serif'], // Headings/counters
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(to bottom right, rgba(17, 24, 39, 0.8), rgba(0, 0, 0, 0.6))',
      },
    },
  },
  plugins: [],
}
