import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const featureInternals = {
  group: ['@/features/*/*'],
  message: 'Importe a feature pelo index: @/features/<nome>',
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      'no-restricted-imports': ['error', { patterns: [featureInternals] }],
    },
  },
  {
    // shared/ é agnóstico de domínio: não conhece features, serviços nem stores
    files: ['src/shared/**'],
    ignores: ['src/shared/hooks/useUserInfo.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            featureInternals,
            {
              group: ['@/features/*', '@/services/*', '@/store/*'],
              message: 'shared/ não pode depender de features, services ou store',
            },
          ],
        },
      ],
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', '.superpowers/**']),
])

export default eslintConfig
