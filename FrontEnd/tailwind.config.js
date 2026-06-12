/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0f0f1a',
          secondary: '#1a1a2e',
          card: '#1e1e30',
          hover: '#252540',
        },
        accent: {
          gold: '#f0a500',
          orange: '#ff6b35',
          light: '#ffb347',
        },
        city: {
          visited: '#f0a500',
          lived: '#ff6b35',
          transit: '#8888aa',
          unvisited: '#2a2a3e',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
