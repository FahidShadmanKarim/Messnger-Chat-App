/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: { height: {
      '128': '32rem',
      '144': '36rem',
      '160': '50rem',
      '164': '51rem'
      // Add more custom heights as needed
    }},
  },
  plugins: [],
}