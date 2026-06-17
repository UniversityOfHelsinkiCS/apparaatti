import path from 'node:path'
import { fileURLToPath } from 'node:url'

import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import { defineConfig } from 'eslint/config'
import react from 'eslint-plugin-react'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig([
  js.configs.recommended,
  typescriptEslint.configs['flat/recommended'],
  react.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['eslint.config.mjs'],
        },
        tsconfigRootDir: __dirname,
      },
    },

    plugins: {
      'simple-import-sort': simpleImportSort,
    },

    rules: {
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      'linebreak-style': ['error', 'unix'],
      semi: ['error', 'never'],

      'react/react-in-jsx-scope': 'off',

      '@typescript-eslint/no-explicit-any': 'off',
      // NOTE: enable these when cba to fix problems
      // '@typescript-eslint/no-floating-promises': 'error',
      // '@typescript-eslint/no-misused-promises': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/client/**/*'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['src/server/**/*'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/tests/**/*'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
])
