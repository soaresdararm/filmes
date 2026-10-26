import { cacheLife } from 'next/cache'
import { tmdbFetch } from '@/services/tmdb/client'
import { pickTrailerKey, toMovieDetails } from '../mappers'
import { rawMovieDetailsSchema, rawVideoListSchema } from '../schemas/tmdb'
import type { MovieDetails } from '../types'
import { REVALIDATE } from './revalidate'

/** Detalhes completos de um filme. Propaga TmdbError (inclusive 404). */
export async function getMovieDetails(id: number): Promise<MovieDetails> {
  'use cache'
  cacheLife({ revalidate: REVALIDATE.list })

  const raw = await tmdbFetch(`/movie/${id}`, {
    schema: rawMovieDetailsSchema,
    params: {
      append_to_response: 'credits,videos,watch/providers,recommendations',
    },
  })
  const details = toMovieDetails(raw)
  if (details.trailerKey) return details

  // poucos filmes têm trailer em pt-BR: tenta em qualquer idioma
  const videos = await tmdbFetch(`/movie/${id}/videos`, {
    schema: rawVideoListSchema,
    params: { language: null },
  })
  return { ...details, trailerKey: pickTrailerKey(videos.results) }
}
