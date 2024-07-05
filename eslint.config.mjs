import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import astroPlugin from 'eslint-plugin-astro';
import importPlugin from 'eslint-plugin-import';
import pluginVue from 'eslint-plugin-vue';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: dirname,
  resolvePluginRelativeTo: dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(compat.extends('airbnb-base')),
  ...pluginVue.configs['flat/recommended'],
  ...astroPlugin.configs.recommended,
  {
    // Parser settings
    files: ['**/*.ts', '**/*.vue'],
    ignores: ['.vite/', 'node_modules/', 'out/', 'dist/'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: ['./tsconfig.json'],
        sourceType: 'module',
        tsconfigRootDir: dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
  },
  {
    // Common rules
    rules: {
      'max-len': [2, { code: 120, ignoreUrls: true }],
      'no-console': [2, { allow: ['info', 'debug', 'warn', 'error'] }],
    },
  },
  {
    // TypeScript declaration file rules
    files: ['**/*.d.ts'],
    rules: {
      'no-unused-vars': 0,
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
  {
    // TypeScript and vue rules
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      'no-console': 0,
      'no-param-reassign': 0,
      'no-restricted-syntax': 0,
      'no-undef': 0,
      'no-unused-vars': 0,

      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-explicit-any': 0,
    },
  },
  {
    // Vue rules
    files: ['**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': 0,

      'vue/multi-word-component-names': 0,
    },
  },
  {
    // Import plugin settings
    settings: {
      'import/resolver': {
        alias: {
          map: [
            ['@', './src'],
          ],
          extensions: ['.js', '.ts', '.vue', '.astro'],
        },
        node: {
          extensions: ['.js', '.ts', '.vue', '.astro'],
        },
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
    plugins: {
      import: fixupPluginRules(importPlugin),
    },
    rules: {
      'import/extensions': [
        2,
        'ignorePackages',
        {
          js: 'always',
          ts: 'never',
          vue: 'always',
          astro: 'always',
        },
      ],
      'import/no-extraneous-dependencies': 0,
      'import/no-unresolved': 0,
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
    },
  },
);
