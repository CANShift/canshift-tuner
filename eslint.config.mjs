import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import { INLINE_STYLE_BASELINE } from './eslint-inline-style-baseline.mjs'

const KEEP_COMMENT_PATTERN =
  /^[\s/]*(eslint-(disable|enable)|@ts-(expect-error|ignore|nocheck)|@typescript-eslint|<reference)/

const noCommentsPlugin = {
  rules: {
    'no-comments': {
      meta: {
        type: 'problem',
        docs: { description: 'Disallow comments; allow only load-bearing directives.' },
        schema: [],
        messages: {
          forbidden:
            'Comments are forbidden in this package. Allowed directives: eslint-*, @ts-expect-error.',
        },
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (KEEP_COMMENT_PATTERN.test(comment.value)) continue
              context.report({ loc: comment.loc, messageId: 'forbidden' })
            }
          },
        }
      },
    },
  },
}

const noInlineStylePlugin = {
  rules: {
    'no-inline-style': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow the style prop; the stack is Tailwind + shadcn. Computed geometry opts out with an eslint-disable.',
        },
        schema: [],
        messages: {
          forbidden:
            'Use Tailwind classes, or a primitive from src/components/ui/. Only runtime-computed geometry keeps style, with an eslint-disable-next-line.',
        },
      },
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name.type !== 'JSXIdentifier' || node.name.name !== 'style') return
            context.report({ node, messageId: 'forbidden' })
          },
        }
      },
    },
  },
}

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      'no-comments': noCommentsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs', '*.config.ts', 'scripts/*.ts'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { react: { version: '18' } },
    rules: {
      'no-comments/no-comments': 'error',
      'func-style': ['error', 'expression'],
      'max-depth': ['error', 3],
      'prefer-const': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['src/**/*.tsx'],
    plugins: { 'no-inline-style': noInlineStylePlugin },
    rules: {
      'no-inline-style/no-inline-style': 'error',
    },
  },
  {
    files: INLINE_STYLE_BASELINE,
    rules: {
      'no-inline-style/no-inline-style': 'off',
    },
  },
  {
    files: ['eslint.config.mjs'],
    rules: {
      '@typescript-eslint/no-deprecated': 'off',
    },
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.vite/**',
      'scripts/**',
      'vite.config.ts',
      'tailwind.config.ts',
      'postcss.config.cjs',
      '**/*.config.cjs',
      '**/*.config.js',
    ],
  }
)
