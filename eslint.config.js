import js from '@eslint/js';
import solid from 'eslint-plugin-solid/configs/recommended';
import globals from 'globals';

export default [
  {
    files: ['app/javascript/**/*.jsx', 'app/javascript/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.document,
        ...globals.browser,
        ...globals.node
      }
    }
  },
  js.configs.recommended, // replaces eslint:recommended
  solid
];
