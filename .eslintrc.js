/* eslint-disable vue/max-len */
require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('node:path');

module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:import/recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:vue/vue3-recommended',
    // WARN: airbnb必须放在prettier后面
    // skip-formatting会覆盖许多重要的设定
    '@vue/eslint-config-airbnb',
    // WARN: typescript必须放在airbnb后面
    // airbnb会对一些正确的typescript语法产生报错
    '@vue/eslint-config-typescript',
    'plugin:import/electron',
    'plugin:import/typescript',
  ],
  env: {
    node: true,
    es6: true,
    browser: true,
  },
  settings: {
    'import/extensions': ['.js', '.ts', '.vue'],
    'import/resolver': {
      typescript: {},
      alias: {
        map: [['@', path.join(__dirname, 'src/')]],
        extensions: ['.js', '.ts', '.vue'],
      },
    },
  },
  rules: {
    // basic
    'no-bitwise': 0,
    'no-param-reassign': 0,
    'no-console': 0,
    'no-continue': 0,
    'no-restricted-syntax': 0,
    'prefer-destructuring': ['error', { AssignmentExpression: { array: false } }],

    // import plugin
    'import/extensions': [
      2,
      {
        js: 'never',
        mjs: 'always',
        ts: 'never',
        json: 'always',
        vue: 'always',
      },
    ],
    'import/no-extraneous-dependencies': 0,
    'import/order': [
      2,
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: false,
        },
      },
    ],
    'import/prefer-default-export': 0,

    // vue
    'vue/component-tags-order': ['error', {
      order: ['template', 'script', 'style'],
    }],
    'vue/max-len': [2, 120],
    'vue/multi-word-component-names': 0,

    'vuejs-accessibility/label-has-for': 0,
    'vuejs-accessibility/click-events-have-key-events': 0,
  },
  overrides: [{
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-empty-function': 0,
      /**
       * 因为eslint的一个BUG，会对typescript中的enum产生no-shadow报错
       * 这里通过关闭eslint的no-shadow后开启typescript-eslint的no-shaodw来修复
       */
      'no-shadow': 0,
      /**
       * eslint不会使用typescript对全局TS类型进行检查，因此会一些全局TS类型会触发这个报错
       *
       * 详见：[https://typescript-eslint.io](https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors)
       */
      'no-undef': 0,
      'no-useless-constructor': 0,
      'no-use-before-define': 0,

      '@typescript-eslint/no-empty-function': 2,
      '@typescript-eslint/no-shadow': 2,
      '@typescript-eslint/no-use-before-define': 2,
    },
  }],
};
