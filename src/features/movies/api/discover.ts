import { cacheLife } from 'next/cache'
import { tmdbFetch } from '@/services/tmdb/client'
import { CURATED_PROVIDER_IDS, siteConfig } from '@/shared/config/site'
import { toPaginated } from '../mappers'
import { rawPageSchema } from '../schemas/tmdb'
import type { DiscoverParams, Movie, Paginated } from '../types'
import { REVALIDATE } from './revalidate'

const MIN_VOTES_FOR_RATING = 50

/** Filmes disponíveis por assinatura no Brasil, filtrados. */
export async function discoverMovies(params: DiscoverParams): Promise<Paginated<Movie>> {
  'use cache'
  cacheLife({ revalidate: REVALIDATE.list })

  const providers = params.providers.length > 0 ? params.providers : CURATED_PROVIDER_IDS
  const hasRating = params.rating > 0

  const raw = await tmdbFetch('/discover/movie', {
    schema: rawPageSchema,
    params: {
      watch_region: siteConfig.region,
      with_watch_monetization_types: 'flatrate',
      with_watch_providers: providers.join('|'),
      include_adult: 'false',
      with_genres: params.genre,
      'primary_release_date.gte': params.yearFrom ? `${params.yearFrom}-01-01` : undefined,
      'primary_release_date.lte': params.yearTo ? `${params.yearTo}-12-31` : undefined,
      'vote_average.gte': hasRating ? params.rating : undefined,
      'vote_count.gte': hasRating ? MIN_VOTES_FOR_RATING : undefined,
      sort_by: params.sort,
      page: params.page,
    },
  })
  return toPaginated(raw)
}
