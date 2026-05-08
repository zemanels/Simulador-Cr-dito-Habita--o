/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#003087',
          dark: '#001f5e',
          medium: '#0055A5',
          light: '#e8eef7',
          accent: '#e30613',
        },
      },
      screens: {
        '2xl': '1400px',
        '3xl': '1700px',
      },
      maxWidth: {
        'screen-2xl': '1400px',
        'screen-3xl': '1700px',
      },
    },
  },
  plugins: [],
}
