import { describe, expect, it } from 'vitest'
import { mockTmdbGet, rawPage } from '@/test/fixtures/tmdb'
import { searchMovies } from './search'

describe('searchMovies', () => {
  it('envia a query intacta e a página', async () => {
    const requests = mockTmdbGet('/search/movie', rawPage())
    const result = await searchMovies('ação & aventura', 2)
    expect(requests[0].searchParams.get('query')).toBe('ação & aventura')
    expect(requests[0].searchParams.get('page')).toBe('2')
    expect(requests[0].searchParams.get('include_adult')).toBe('false')
    expect(result.results).toHaveLength(1)
  })
})
