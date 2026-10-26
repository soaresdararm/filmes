import { describe, expect, it } from 'vitest'
import { CURATED_PROVIDER_IDS } from '@/shared/config/site'
import { mockTmdbGet, rawPage } from '@/test/fixtures/tmdb'
import type { DiscoverParams } from '../types'
import { discoverMovies } from './discover'

const base: DiscoverParams = { providers: [], rating: 0, sort: 'popularity.desc', page: 1 }

describe('discoverMovies', () => {
  it('envia região, monetização e provedores curados por padrão', async () => {
    const requests = mockTmdbGet('/discover/movie', rawPage())
    await discoverMovies(base)
    const params = requests[0].searchParams
    expect(params.get('watch_region')).toBe('BR')
    expect(params.get('with_watch_monetization_types')).toBe('flatrate')
    expect(params.get('with_watch_providers')).toBe(CURATED_PROVIDER_IDS.join('|'))
    expect(params.get('include_adult')).toBe('false')
    expect(params.get('sort_by')).toBe('popularity.desc')
    expect(params.get('page')).toBe('1')
  })

  it('usa os provedores escolhidos e o gênero', async () => {
    const requests = mockTmdbGet('/discover/movie', rawPage())
    await discoverMovies({ ...base, providers: [8, 119], genre: 28 })
    expect(requests[0].searchParams.get('with_watch_providers')).toBe('8|119')
    expect(requests[0].searchParams.get('with_genres')).toBe('28')
  })

  it('com nota mínima envia vote_count.gte=50', async () => {
    const requests = mockTmdbGet('/discover/movie', rawPage())
    await discoverMovies({ ...base, rating: 7 })
    expect(requests[0].searchParams.get('vote_average.gte')).toBe('7')
    expect(requests[0].searchParams.get('vote_count.gte')).toBe('50')
  })

  it('sem nota mínima não envia filtros de voto', async () => {
    const requests = mockTmdbGet('/discover/movie', rawPage())
    await discoverMovies(base)
    expect(requests[0].searchParams.has('vote_average.gte')).toBe(false)
    expect(requests[0].searchParams.has('vote_count.gte')).toBe(false)
  })

  it('converte anos em datas', async () => {
    const requests = mockTmdbGet('/discover/movie', rawPage())
    await discoverMovies({ ...base, yearFrom: 2000, yearTo: 2010 })
    expect(requests[0].searchParams.get('primary_release_date.gte')).toBe('2000-01-01')
    expect(requests[0].searchParams.get('primary_release_date.lte')).toBe('2010-12-31')
  })

  it('limita totalPages a 500 e mapeia os filmes', async () => {
    mockTmdbGet('/discover/movie', rawPage({ total_pages: 9000, total_results: 180000 }))
    const result = await discoverMovies(base)
    expect(result.totalPages).toBe(500)
    expect(result.results[0]).toMatchObject({ id: 1, releaseYear: 2020, rating: 7 })
  })
})
