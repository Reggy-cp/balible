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
        ivory:      '#F3EEE5',
        sand:       '#E8E4DE',
        coconut:    '#6F675C',
        charcoal:   '#1D1D1D',
        gold:       '#B58A4B',
        forest:     '#2E4A35',
        moss:       '#1E2F23',
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
