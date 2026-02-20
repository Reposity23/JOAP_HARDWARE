/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { panel: '#0f172a', card: '#111827', accent: '#2563eb' }
    }
  },
  plugins: []
};
