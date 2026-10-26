import { describe, expect, it } from 'vitest'
import { mockTmdbGet, rawDetails } from '@/test/fixtures/tmdb'
import { getMovieDetails } from './details'

const trailer = {
  key: 'EN_KEY',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
}

describe('getMovieDetails', () => {
  it('pede credits, videos e watch/providers numa chamada', async () => {
    const requests = mockTmdbGet(
      '/movie/1',
      rawDetails({ videos: { results: [trailer] } }),
    )
    const movie = await getMovieDetails(1)
    expect(requests[0].searchParams.get('append_to_response')).toBe(
      'credits,videos,watch/providers',
    )
    expect(movie).toMatchObject({
      id: 1,
      originalTitle: 'Film',
      trailerKey: 'EN_KEY',
      runtime: 120,
    })
  })

  it('sem trailer em pt-BR busca vídeos sem idioma', async () => {
    mockTmdbGet('/movie/1', rawDetails())
    const videoRequests = mockTmdbGet('/movie/1/videos', { results: [trailer] })
    const movie = await getMovieDetails(1)
    expect(videoRequests[0].searchParams.has('language')).toBe(false)
    expect(movie.trailerKey).toBe('EN_KEY')
  })

  it('propaga 404 como TmdbError', async () => {
    mockTmdbGet('/movie/999', { status_message: 'not found' }, { status: 404 })
    await expect(getMovieDetails(999)).rejects.toMatchObject({
      name: 'TmdbError',
      status: 404,
    })
  })
})
