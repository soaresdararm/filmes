import { http, HttpResponse } from 'msw'
import { server } from '@/test/msw/server'

export const TMDB = 'https://api.themoviedb.org/3'

export const rawPage = (overrides: Record<string, unknown> = {}) => ({
  page: 1,
  results: [
    {
      id: 1,
      title: 'Filme',
      poster_path: '/p.jpg',
      release_date: '2020-01-01',
      vote_average: 7,
      vote_count: 100,
    },
  ],
  total_pages: 1,
  total_results: 1,
  ...overrides,
})

export const rawDetails = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  title: 'Filme',
  original_title: 'Film',
  overview: 'Sinopse',
  poster_path: '/p.jpg',
  backdrop_path: '/b.jpg',
  release_date: '2020-01-01',
  runtime: 120,
  vote_average: 7,
  vote_count: 100,
  genres: [{ id: 28, name: 'Ação' }],
  credits: { cast: [] },
  videos: { results: [] },
  'watch/providers': { results: {} },
  ...overrides,
})

/** Registra um handler GET que responde `body` e devolve as requisições recebidas. */
export function mockTmdbGet(path: string, body: unknown, init?: ResponseInit) {
  const requests: URL[] = []
  server.use(
    http.get(`${TMDB}${path}`, ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json(body as never, init)
    }),
  )
  return requests
}
