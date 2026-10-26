import { describe, expect, it } from 'vitest'
import { pickTrailerKey, toMovie, toMovieDetails, toPaginated } from './mappers'
import type { RawMovie, RawMovieDetails, RawVideo } from './schemas/tmdb'

const rawMovie: RawMovie = {
  id: 1,
  title: 'X',
  poster_path: null,
  release_date: '',
  vote_average: 0,
  vote_count: 0,
}

function rawDetails(overrides: Partial<RawMovieDetails> = {}): RawMovieDetails {
  return {
    ...rawMovie,
    original_title: 'X',
    overview: '',
    backdrop_path: null,
    runtime: null,
    genres: [],
    credits: { cast: [] },
    videos: { results: [] },
    'watch/providers': { results: {} },
    ...overrides,
  }
}

const video = (key: string, type: string, official: boolean): RawVideo => ({
  key,
  site: 'YouTube',
  type,
  official,
})

describe('toMovie', () => {
  it('campos vazios viram null', () => {
    expect(toMovie(rawMovie)).toEqual({
      id: 1,
      title: 'X',
      posterPath: null,
      releaseYear: null,
      rating: null,
    })
  })

  it('extrai o ano e arredonda a nota', () => {
    expect(
      toMovie({
        ...rawMovie,
        release_date: '2023-05-02',
        vote_average: 7.456,
        vote_count: 10,
      }),
    ).toMatchObject({ releaseYear: 2023, rating: 7.5 })
  })
})

describe('toPaginated', () => {
  it('limita totalPages a 500', () => {
    const page = toPaginated({
      page: 1,
      results: [rawMovie],
      total_pages: 9000,
      total_results: 180000,
    })
    expect(page).toMatchObject({
      page: 1,
      totalPages: 500,
      totalResults: 180000,
    })
    expect(page.results).toHaveLength(1)
  })
})

describe('toMovieDetails', () => {
  it('sem BR, onde assistir fica vazio', () => {
    const details = toMovieDetails(
      rawDetails({
        'watch/providers': { results: { US: { link: 'x', flatrate: [] } } },
      }),
    )
    expect(details.watch).toEqual({ link: null, providers: [] })
  })

  it('usa flatrate do BR e ignora aluguel', () => {
    const br = {
      link: 'https://www.themoviedb.org/movie/1/watch?locale=BR',
      flatrate: [
        { provider_id: 8, provider_name: 'Netflix', logo_path: '/n.png' },
      ],
      rent: [
        { provider_id: 2, provider_name: 'Apple TV', logo_path: '/a.png' },
      ],
    }
    const details = toMovieDetails(
      rawDetails({ 'watch/providers': { results: { BR: br } } }),
    )
    expect(details.watch).toEqual({
      link: 'https://www.themoviedb.org/movie/1/watch?locale=BR',
      providers: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }],
    })
  })

  it('limita o elenco a 20', () => {
    const cast = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      name: `Ator ${i}`,
      character: 'Papel',
      profile_path: null,
    }))
    expect(toMovieDetails(rawDetails({ credits: { cast } })).cast).toHaveLength(
      20,
    )
  })

  it('sinopse vazia vira null', () => {
    expect(toMovieDetails(rawDetails({ overview: '' })).overview).toBeNull()
  })
})

describe('pickTrailerKey', () => {
  it('prioriza trailer oficial do YouTube', () => {
    expect(
      pickTrailerKey([
        video('t', 'Teaser', true),
        video('n', 'Trailer', false),
        video('o', 'Trailer', true),
      ]),
    ).toBe('o')
  })

  it('aceita trailer não oficial', () => {
    expect(pickTrailerKey([video('n', 'Trailer', false)])).toBe('n')
  })

  it('ignora outros sites e retorna null sem trailer', () => {
    expect(
      pickTrailerKey([
        { key: 'v', site: 'Vimeo', type: 'Trailer', official: true },
      ]),
    ).toBeNull()
  })
})
