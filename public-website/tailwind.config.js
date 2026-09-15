/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f172a', // Slate 900
          light: '#1e293b',    // Slate 800
          dark: '#020617',     // Slate 950
        },
        accent: {
          DEFAULT: '#3b82f6', // Blue 500
          light: '#60a5fa',   // Blue 400
          dark: '#1d4ed8',    // Blue 700
        },
        secondary: {
          DEFAULT: '#64748b', // Slate 500
          light: '#94a3b8',    // Slate 400
          dark: '#475569',    // Slate 600
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
