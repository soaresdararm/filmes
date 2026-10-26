import { Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { formatRating } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import type { Movie } from '../types'

export function MovieCard({ movie }: { movie: Movie }) {
  const poster = tmdbImageUrl(movie.posterPath, 'w342')

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface shadow-lg ring-1 ring-white/5 transition duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-accent/20">
        {poster ? (
          <Image
            src={poster}
            alt={`Pôster de ${movie.title}`}
            fill
            sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted">
            Sem pôster
          </div>
        )}
        {movie.rating !== null && (
          <Badge
            variant="rating"
            aria-label={`Nota ${formatRating(movie.rating)}`}
            className="absolute top-2 right-2"
          >
            <Star aria-hidden className="size-3 fill-current" />
            {formatRating(movie.rating)}
          </Badge>
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium group-hover:text-accent">
        {movie.title}
      </h3>
      {movie.releaseYear !== null && <p className="text-xs text-muted">{movie.releaseYear}</p>}
    </Link>
  )
}
