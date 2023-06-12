/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'base': ['Courier New', 'sans-serif'],
      }, 
      backgroundImage: {
        'tapa': "url('/tapa.png')"
      }
    },
  },
  plugins: [],
}
