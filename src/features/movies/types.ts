export type Movie = {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  releaseYear: number | null
  rating: number | null
}

export type Genre = { id: number; name: string }

export type Provider = { id: number; name: string; logoPath: string | null }

export type CastMember = {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export type MovieDetails = Movie & {
  originalTitle: string
  overview: string | null
  runtime: number | null
  genres: Genre[]
  cast: CastMember[]
  trailerKey: string | null
  watch: { link: string | null; providers: Provider[] }
  similar: Movie[]
}

export type Paginated<T> = {
  results: T[]
  page: number
  totalPages: number
  totalResults: number
}

export const SORT_OPTIONS = [
  'popularity.desc',
  'primary_release_date.desc',
  'vote_average.desc',
  'title.asc',
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]

export type DiscoverParams = {
  providers: number[]
  genre?: number
  yearFrom?: number
  yearTo?: number
  rating: number
  sort: SortOption
  page: number
}

/** O TMDB não pagina além da página 500. */
export const MAX_PAGE = 500
