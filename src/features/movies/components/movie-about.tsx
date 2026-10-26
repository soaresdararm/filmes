import type { ReactNode } from 'react'
import { formatRating } from '@/shared/lib/format'
import type { MovieDetails } from '../types'
import { formatRuntime } from './movie-hero'

const CAST_PREVIEW = 4

/** Ficha técnica, no formato "Sobre <título>". */
export function MovieAbout({ movie }: { movie: MovieDetails }) {
  const runtime = formatRuntime(movie.runtime)
  const castPreview = movie.cast.slice(0, CAST_PREVIEW)

  const rows = [
    castPreview.length > 0 && {
      term: 'Elenco',
      detail: (
        <>
          {castPreview.map((member) => member.name).join(', ')}
          {movie.cast.length > CAST_PREVIEW && (
            <>
              ,{' '}
              <a
                href="#elenco"
                className="rounded-sm italic underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
              >
                mais
              </a>
            </>
          )}
        </>
      ),
    },
    movie.genres.length > 0 && {
      term: 'Gêneros',
      detail: movie.genres.map((genre) => genre.name).join(', '),
    },
    movie.originalTitle !== movie.title && {
      term: 'Título original',
      detail: movie.originalTitle,
    },
    movie.releaseYear !== null && {
      term: 'Lançamento',
      detail: movie.releaseYear,
    },
    runtime && { term: 'Duração', detail: runtime },
    movie.rating !== null && {
      term: 'Nota no TMDB',
      detail: `${formatRating(movie.rating)} de 10`,
    },
  ].filter(Boolean) as { term: string; detail: ReactNode }[]

  return (
    <section aria-labelledby="sobre" className="space-y-4">
      <h2
        id="sobre"
        className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl"
      >
        Sobre {movie.title}
      </h2>
      <dl className="space-y-2.5 text-sm leading-relaxed">
        {rows.map((row) => (
          <div key={row.term}>
            <dt className="inline text-muted">{row.term}: </dt>
            <dd className="inline">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
