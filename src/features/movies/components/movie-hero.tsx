import { Star } from 'lucide-react'
import Image from 'next/image'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { formatRating } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import type { MovieDetails } from '../types'

/** 136 → "2h 16min" */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}min`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`
}

export function MovieHero({ movie }: { movie: MovieDetails }) {
  const backdrop = tmdbImageUrl(movie.backdropPath, 'w1280')
  const poster = tmdbImageUrl(movie.posterPath, 'w342')
  const runtime = formatRuntime(movie.runtime)

  return (
    <section className="relative -mx-4 -mt-8 overflow-hidden bg-surface">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-60"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-linear-to-r from-background/80 to-transparent" />

      <div className="relative flex flex-col gap-6 px-4 pt-24 pb-8 sm:flex-row sm:items-end sm:pt-40">
        <div className="relative aspect-2/3 w-36 shrink-0 overflow-hidden rounded-xl bg-surface shadow-2xl ring-1 ring-white/10 sm:w-52">
          {poster ? (
            <Image
              src={poster}
              alt={`Pôster de ${movie.title}`}
              fill
              priority
              sizes="208px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Sem pôster
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{movie.title}</h1>
          {movie.originalTitle !== movie.title && (
            <p className="text-muted italic">{movie.originalTitle}</p>
          )}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
            {movie.rating !== null && (
              <Badge variant="rating" aria-label={`Nota ${formatRating(movie.rating)}`}>
                <Star aria-hidden className="size-3 fill-current" />
                {formatRating(movie.rating)}
              </Badge>
            )}
            {movie.releaseYear !== null && <span>{movie.releaseYear}</span>}
            {runtime && <span>{runtime}</span>}
          </div>
          {movie.genres.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <li key={genre.id}>
                  <Badge>{genre.name}</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
