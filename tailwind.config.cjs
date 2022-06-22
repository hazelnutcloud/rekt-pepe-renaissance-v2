const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['sernes', ...defaultTheme.fontFamily.serif],
        'sans': ['kiona', ...defaultTheme.fontFamily.sans],
        'Montserrat': ['Montserrat', ...defaultTheme.fontFamily.sans],
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        renaissance: {

          "primary": "#e07a5f",

          "secondary": "#3d405b",

          "accent": "#81b29a",

          "neutral": "#f2cc8f",

          "base-100": "#f4f1de",

          "info": "#8CCAC1",

          "success": "#9CB686",

          "warning": "#FFD261",

          "error": "#FC9783",
        },
      },
      "luxury",
    ],
  }
}
