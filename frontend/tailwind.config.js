/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        charcoal: '#141414',
        panel: '#1b1b1b',
        line: '#2a2a2a',
        blaze: '#e11d2e',
        blazeDim: '#8c1420',
        paper: '#f5f5f3',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        blaze: '0 0 0 1px rgba(225,29,46,0.4), 0 8px 30px -8px rgba(225,29,46,0.35)',
      },
    },
  },
  plugins: [],
};
