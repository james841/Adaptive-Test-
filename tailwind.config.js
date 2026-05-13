/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bebas Neue"', 'cursive'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink:   '#0a0a0a',
        paper: '#f5f5f0',
        ash:   '#1a1a1a',
        mist:  '#e8e8e4',
        steel: '#4a4a4a',
        chalk: '#ffffff',
      },
      animation: {
        'fade-up':   'fadeUp 0.5s ease forwards',
        'slide-in':  'slideIn 0.4s ease forwards',
        'pulse-slow':'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeUp:  { '0%': { opacity:'0', transform:'translateY(16px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
        slideIn: { '0%': { opacity:'0', transform:'translateX(-16px)' }, '100%': { opacity:'1', transform:'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
