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
          DEFAULT: '#0d9488', // Teal 600 - distinct from the generic indigo/violet "AI SaaS" default
          light: '#2dd4bf',   // Teal 400
          dark: '#0f766e',    // Teal 700
        },
        secondary: {
          DEFAULT: '#64748b', // Slate 500
          light: '#94a3b8',    // Slate 400
          dark: '#475569',    // Slate 600
        },
      },
      fontFamily: {
        // Plus Jakarta Sans reads less generic than the ubiquitous Inter
        // default while staying just as legible for body copy.
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
