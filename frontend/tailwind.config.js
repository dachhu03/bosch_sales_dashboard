/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bosch: {
          blue: '#005691',
          lightBlue: '#008ecf',
          darkBlue: '#002f6c',
          accent: '#00e1d9'
        },
        premium: {
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            800: '#1e293b',
            950: '#0f172a'
          },
          emerald: '#10b981',
          rose: '#f43f5e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 25px -2px rgba(0, 0, 0, 0.04), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'premium-hover': '0 12px 35px -5px rgba(0, 0, 0, 0.08), 0 4px 15px -3px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.06)',
        'glow-blue': '0 0 25px -4px rgba(0, 86, 145, 0.22)',
        'glow-accent': '0 0 25px -4px rgba(0, 225, 217, 0.22)'
      }
    },
  },
  plugins: [],
}
