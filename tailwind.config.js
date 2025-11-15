/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        'indigo': {
          900: '#312e81',
          800: '#3730a3',
          700: '#4338ca',
        },
        'light-blue': {
          400: '#60a5fa',
          300: '#93c5fd',
          200: '#bfdbfe',
        }
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, #0f172a, #1e293b)',
      }
    },
  },
  plugins: [],
}