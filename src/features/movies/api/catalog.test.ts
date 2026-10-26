import { describe, expect, it } from 'vitest'
import { mockTmdbGet } from '@/test/fixtures/tmdb'
import { getGenres } from './genres'
import { getProviders } from './providers'

const provider = (id: number, name: string) => ({ provider_id: id, provider_name: name, logo_path: `/${id}.png` })

describe('getProviders', () => {
  it('mantém só os curados, na ordem curada, e ignora IDs ausentes', async () => {
    const requests = mockTmdbGet('/watch/providers/movie', {
      results: [provider(337, 'Disney Plus'), provider(8, 'Netflix'), provider(999, 'Outro')],
    })
    const providers = await getProviders()
    expect(requests[0].searchParams.get('watch_region')).toBe('BR')
    expect(providers.map((p) => p.id)).toEqual([8, 337])
    expect(providers[0]).toEqual({ id: 8, name: 'Netflix', logoPath: '/8.png' })
  })
})

describe('getGenres', () => {
  it('retorna a lista de gêneros', async () => {
    mockTmdbGet('/genre/movie/list', { genres: [{ id: 28, name: 'Ação' }] })
    await expect(getGenres()).resolves.toEqual([{ id: 28, name: 'Ação' }])
  })
})
