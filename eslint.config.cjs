module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // disables ESLint rules that clash with Prettier
  ],
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  rules: {
    // 🧹 Import sorting
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // 🪶 Optional niceties
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}
