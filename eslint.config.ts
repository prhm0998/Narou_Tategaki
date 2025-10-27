import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    ignores: ['.output/', '.wxt/', 'node_modules/'],
  },
  // 共通設定: JS/TS/Vue全般
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,vue}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // JSルール
      'comma-dangle': [
        'error',
        {
          'arrays': 'always-multiline',
          'objects': 'always-multiline',
          'imports': 'always-multiline',
          'exports': 'always-multiline',
          'functions': 'never',
        },
      ],
      'brace-style': ['error', 'stroustrup'],
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-trailing-spaces': 'warn',
      'quotes': ['error', 'single'],
      'function-paren-newline': ['error', 'consistent'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'semi': ['error', 'never', { 'beforeStatementContinuationChars': 'never' }],
      'semi-spacing': ['error', { 'after': true, 'before': false }],
      'semi-style': ['error', 'first'],
      'no-extra-semi': 'error',
      'no-unexpected-multiline': 'error',
      'no-unreachable': 'error',

    },
  },

  // TypeScript推奨ルール
  tseslint.configs.recommended,

  // Vue推奨ルール (Flat Config 対応)
  pluginVue.configs['flat/recommended'],

  // Vueファイル専用のparser設定
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // Vueカスタムルール
      'vue/no-root-v-if': 'warn',
      'vue/no-multiple-template-root': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/require-v-for-key': 'error',
      'vue/no-use-v-if-with-v-for': 'error',
      'vue/no-parsing-error': 'off',
      'vue/block-tag-newline': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/no-irregular-whitespace': 'error',
      'vue/require-default-prop': 'warn',
      'vue/html-indent': 'off',
      'vue/multiline-html-element-content-newline': 0,
      'vue/html-closing-bracket-newline': 0,
      'vue/max-attributes-per-line': 'off',
      'vue/html-self-closing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/static-class-names-order': 'error',
    },
  },
])
