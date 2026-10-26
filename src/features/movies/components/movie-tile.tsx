import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { formatRating } from '@/shared/lib/format'
import type { Movie } from '../types'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground'

/** Card horizontal das fileiras: backdrop com o título em letra de cartaz por cima. */
export function MovieTile({ movie }: { movie: Movie }) {
  const image =
    tmdbImageUrl(movie.backdropPath, 'w780') ??
    tmdbImageUrl(movie.posterPath, 'w342')

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group/tile relative block aspect-video overflow-hidden rounded-md bg-surface ring-1 ring-white/5 transition duration-300 ease-out hover:z-10 hover:scale-[1.04] hover:ring-white/30 motion-reduce:transition-none motion-reduce:hover:scale-100 ${focusRing}`}
    >
      {image && (
        <Image
          src={image}
          alt=""
          fill
          sizes="(min-width: 1536px) 16vw, (min-width: 1280px) 19vw, (min-width: 768px) 24vw, (min-width: 640px) 32vw, 44vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
        <h3 className="line-clamp-2 font-display text-xl leading-[0.95] tracking-wide text-balance drop-shadow-md sm:text-2xl">
          {movie.title}
        </h3>
        <p className="flex h-0 items-center gap-2.5 overflow-hidden text-xs font-medium text-foreground/85 opacity-0 transition-all duration-300 group-hover/tile:mt-1 group-hover/tile:h-4 group-hover/tile:opacity-100 group-focus-visible/tile:mt-1 group-focus-visible/tile:h-4 group-focus-visible/tile:opacity-100">
          {movie.rating !== null && (
            <span
              aria-label={`Nota ${formatRating(movie.rating)}`}
              className="inline-flex items-center gap-1 text-amber-400"
            >
              <Star aria-hidden className="size-3 fill-current" />
              {formatRating(movie.rating)}
            </span>
          )}
          {movie.releaseYear !== null && <span>{movie.releaseYear}</span>}
        </p>
      </div>
    </Link>
  )
}

/** Pôster com o numeral do ranking ao lado, discreto: o destaque é a capa. */
export function RankedTile({ movie, rank }: { movie: Movie; rank: number }) {
  const poster = tmdbImageUrl(movie.posterPath, 'w342')

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group/rank @container relative flex aspect-[1.08] items-end justify-end rounded-md ${focusRing}`}
    >
      <span className="sr-only">{`${rank}º lugar: ${movie.title}`}</span>
      <span
        aria-hidden
        className={`absolute bottom-0 left-0 font-display leading-[0.72] text-outline select-none ${rank === 10 ? 'text-[44cqw] tracking-[-0.06em]' : 'text-[54cqw]'}`}
      >
        {rank}
      </span>
      <PosterFrame
        movie={movie}
        poster={poster}
        className="h-full shadow-[-8px_0_24px_rgba(0,0,0,0.6)] group-hover/rank:scale-[1.04] group-hover/rank:ring-white/30 motion-reduce:group-hover/rank:scale-100"
      />
    </Link>
  )
}

/** Outro formato de Top 10: posição numa aba vermelha no canto e a nota em destaque abaixo da capa. */
export function RatedTile({ movie, rank }: { movie: Movie; rank: number }) {
  const poster = tmdbImageUrl(movie.posterPath, 'w342')

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group/rated block rounded-md ${focusRing}`}
    >
      <div className="relative">
        <PosterFrame
          movie={movie}
          poster={poster}
          className="w-full group-hover/rated:scale-[1.04] group-hover/rated:ring-white/30 motion-reduce:group-hover/rated:scale-100"
        />
        <span
          aria-label={`${rank}º lugar`}
          className="absolute top-0 left-2.5 rounded-b-sm bg-accent px-2 pt-1.5 pb-1 font-display text-2xl leading-none shadow-md shadow-black/40"
        >
          {rank}
        </span>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm leading-tight font-semibold">
          {movie.title}
        </h3>
        {movie.rating !== null && (
          <span
            aria-label={`Nota ${formatRating(movie.rating)}`}
            className="inline-flex shrink-0 items-center gap-1 font-display text-xl leading-none text-amber-400"
          >
            <Star aria-hidden className="size-3.5 fill-current" />
            {formatRating(movie.rating)}
          </span>
        )}
      </div>
    </Link>
  )
}

function PosterFrame({
  movie,
  poster,
  className,
}: {
  movie: Movie
  poster: string | null
  className?: string
}) {
  return (
    <div
      className={`relative aspect-2/3 overflow-hidden rounded-md bg-surface ring-1 ring-white/5 transition duration-300 ease-out motion-reduce:transition-none ${className ?? ''}`}
    >
      {poster ? (
        <Image
          src={poster}
          alt=""
          fill
          sizes="(min-width: 1280px) 14vw, (min-width: 768px) 20vw, 40vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-3 text-center font-display text-xl">
          {movie.title}
        </div>
      )}
    </div>
  )
}
