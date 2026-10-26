import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/test/msw/server'

// Radix Slider mede o elemento com ResizeObserver, ausente no jsdom
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// 'use cache' é no-op fora do Next; cacheLife precisa do runtime do Next
vi.mock('next/cache', () => ({ cacheLife: () => {}, cacheTag: () => {} }))

// next/image depende do loader do Next; nos testes vira um <img> simples
vi.mock('next/image', async () => {
  const { createElement } = await import('react')
  return {
    default: ({ src, alt, className }: Record<string, unknown>) =>
      createElement('img', { src, alt, className }),
  }
})

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
