import type { ReactNode } from 'react'
import type { Movie } from '../types'
import { MovieCard } from './movie-card'

export const movieGridClass =
  'grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'

export function MovieGrid({ movies, empty }: { movies: Movie[]; empty: ReactNode }) {
  if (movies.length === 0) return <>{empty}</>

  return (
    <ul className={movieGridClass}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} />
        </li>
      ))}
    </ul>
  )
}
