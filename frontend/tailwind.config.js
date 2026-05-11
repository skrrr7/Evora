import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Satoshi", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [daisyui],
  daisyui:{
    themes: ["pastel"],
  },
}