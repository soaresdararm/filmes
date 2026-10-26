import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // o pacote server-only lança erro fora do bundle de servidor do Next
      'server-only': fileURLToPath(
        new URL('./src/test/empty.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    env: { TMDB_READ_TOKEN: 'test-token' },
  },
})
