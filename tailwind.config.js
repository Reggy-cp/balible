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
        ivory:      '#F5F1EB',
        sand:       '#E8E4DE',
        coconut:    '#6F675C',
        charcoal:   '#111111',
        gold:       '#C8A97E',
        forest:     '#4A7C59',
        terracotta: '#B66A45',
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'serif'],
        body:    ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
