import { cacheLife } from 'next/cache'
import { tmdbFetch } from '@/services/tmdb/client'
import { toPaginated } from '../mappers'
import { rawPageSchema } from '../schemas/tmdb'
import type { Movie, Paginated } from '../types'
import { REVALIDATE } from './revalidate'

/** Busca por título em todo o TMDB (o endpoint não filtra por streaming). */
export async function searchMovies(query: string, page: number): Promise<Paginated<Movie>> {
  'use cache'
  cacheLife({ revalidate: REVALIDATE.search })

  const raw = await tmdbFetch('/search/movie', {
    schema: rawPageSchema,
    params: { query, page, include_adult: 'false' },
  })
  return toPaginated(raw)
}
