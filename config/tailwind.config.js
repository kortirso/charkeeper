const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'selector',
  content: [
    './public/*.html',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.jsx',
    './app/views/**/*.{erb,html}'
  ],
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/container-queries'),
  ],
  theme: {
    fontFamily: {
      'sans': ['CascadiaMono-SemiLight', 'sans-serif', ...fontFamily.sans],
      'cascadia-light': ['CascadiaMono-Light', ...fontFamily.sans],
      'cascadia': ['CascadiaMono-SemiLight', ...fontFamily.sans],
      'cascadia-bold': ['CascadiaMono', ...fontFamily.sans]
    }
  },
}
