import { siteConfig } from '@/shared/config/site'
import type {
  RawMovie,
  RawMovieDetails,
  RawPage,
  RawProvider,
  RawVideo,
} from './schemas/tmdb'
import {
  MAX_PAGE,
  type Movie,
  type MovieDetails,
  type Paginated,
  type Provider,
} from './types'

const MAX_CAST = 20

export function toMovie(raw: RawMovie): Movie {
  const year = raw.release_date
    ? Number.parseInt(raw.release_date.slice(0, 4), 10)
    : NaN
  return {
    id: raw.id,
    title: raw.title,
    posterPath: raw.poster_path ?? null,
    releaseYear: Number.isNaN(year) ? null : year,
    rating: raw.vote_count
      ? Math.round((raw.vote_average ?? 0) * 10) / 10
      : null,
  }
}

export function toPaginated(raw: RawPage): Paginated<Movie> {
  return {
    results: raw.results.map(toMovie),
    page: raw.page,
    totalPages: Math.min(raw.total_pages, MAX_PAGE),
    totalResults: raw.total_results,
  }
}

export function toProvider(raw: RawProvider): Provider {
  return {
    id: raw.provider_id,
    name: raw.provider_name,
    logoPath: raw.logo_path ?? null,
  }
}

/** Primeiro trailer do YouTube, preferindo os oficiais. */
export function pickTrailerKey(videos: RawVideo[]): string | null {
  const trailers = videos.filter(
    (v) => v.site === 'YouTube' && v.type === 'Trailer',
  )
  return (trailers.find((v) => v.official) ?? trailers[0])?.key ?? null
}

export function toMovieDetails(raw: RawMovieDetails): MovieDetails {
  const region = raw['watch/providers'].results[siteConfig.region]
  return {
    ...toMovie(raw),
    originalTitle: raw.original_title,
    overview: raw.overview || null,
    backdropPath: raw.backdrop_path ?? null,
    runtime: raw.runtime || null,
    genres: raw.genres,
    cast: raw.credits.cast.slice(0, MAX_CAST).map((member) => ({
      id: member.id,
      name: member.name,
      character: member.character ?? '',
      profilePath: member.profile_path ?? null,
    })),
    trailerKey: pickTrailerKey(raw.videos.results),
    watch: {
      link: region?.link ?? null,
      providers: (region?.flatrate ?? []).map(toProvider),
    },
  }
}
