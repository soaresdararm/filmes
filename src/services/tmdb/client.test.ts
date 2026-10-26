import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { server } from '@/test/msw/server'
import { TMDB_API_BASE, tmdbFetch } from './client'

const schema = z.object({ ok: z.boolean() })

function capture(body: unknown = { ok: true }, init?: ResponseInit) {
  const requests: Request[] = []
  server.use(
    http.get(`${TMDB_API_BASE}/x`, ({ request }) => {
      requests.push(request)
      return HttpResponse.json(body as never, init)
    }),
  )
  return requests
}

describe('tmdbFetch', () => {
  afterEach(() => vi.restoreAllMocks())

  it('envia token, language e region', async () => {
    const requests = capture()
    await tmdbFetch('/x', { schema })
    const url = new URL(requests[0].url)
    expect(requests[0].headers.get('authorization')).toBe('Bearer test-token')
    expect(url.searchParams.get('language')).toBe('pt-BR')
    expect(url.searchParams.get('region')).toBe('BR')
  })

  it('ignora params undefined e remove o padrão com null', async () => {
    const requests = capture()
    await tmdbFetch('/x', { schema, params: { language: null, page: 2, genre: undefined } })
    const url = new URL(requests[0].url)
    expect(url.searchParams.has('language')).toBe(false)
    expect(url.searchParams.get('page')).toBe('2')
    expect(url.searchParams.has('genre')).toBe(false)
  })

  it('valida com o schema e retorna os dados', async () => {
    capture({ ok: true, extra: 1 })
    await expect(tmdbFetch('/x', { schema })).resolves.toEqual({ ok: true })
  })

  it('404 vira TmdbError status 404', async () => {
    capture({}, { status: 404 })
    await expect(tmdbFetch('/x', { schema })).rejects.toMatchObject({ name: 'TmdbError', status: 404 })
  })

  it('401 vira TmdbError 401 e loga erro de configuração', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    capture({}, { status: 401 })
    await expect(tmdbFetch('/x', { schema })).rejects.toMatchObject({ status: 401 })
    expect(String(log.mock.calls[0][0])).toMatch(/token/i)
  })

  it('500 vira TmdbError status 500', async () => {
    capture({}, { status: 500 })
    await expect(tmdbFetch('/x', { schema })).rejects.toMatchObject({ status: 500 })
  })

  it('resposta fora do schema vira TmdbError 502 e é logada', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})
    capture({ ok: 'sim' })
    await expect(tmdbFetch('/x', { schema })).rejects.toMatchObject({ status: 502 })
    expect(log).toHaveBeenCalled()
  })

  it('falha de rede vira TmdbError 0', async () => {
    server.use(http.get(`${TMDB_API_BASE}/x`, () => HttpResponse.error()))
    await expect(tmdbFetch('/x', { schema })).rejects.toMatchObject({ name: 'TmdbError', status: 0 })
  })
})
