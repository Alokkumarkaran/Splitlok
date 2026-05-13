/** @type {import('tailwindcss').Config} */
export default {
  // 1. ADD THIS EXACT LINE RIGHT HERE:
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}