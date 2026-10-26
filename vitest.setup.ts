import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll, vi } from 'vitest'
import { server } from '@/test/msw/server'

// 'use cache' é no-op fora do Next; cacheLife precisa do runtime do Next
vi.mock('next/cache', () => ({ cacheLife: () => {}, cacheTag: () => {} }))

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
})
afterAll(() => server.close())
