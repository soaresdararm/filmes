import { cacheLife } from 'next/cache'
import { tmdbFetch } from '@/services/tmdb/client'
import { rawGenreListSchema } from '../schemas/tmdb'
import type { Genre } from '../types'
import { REVALIDATE } from './revalidate'

export async function getGenres(): Promise<Genre[]> {
  'use cache'
  cacheLife({ revalidate: REVALIDATE.static })

  const raw = await tmdbFetch('/genre/movie/list', { schema: rawGenreListSchema })
  return raw.genres
}
