import { Info, Star, Tv } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { formatRating } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ExpandableText } from '@/shared/ui/expandable-text'
import type { MovieDetails } from '../types'
import { Trailer } from './trailer'

/** 136 → "2h 16min" */
export function formatRuntime(minutes: number | null): string | null {
  if (!minutes) return null
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}min`
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`
}

/** Margem negativa igual ao padding-top do <main>: o hero passa por baixo do header fixo. */
const bleed = 'relative -mx-gutter -mt-28 lg:-mt-24'

/** No mobile a imagem fica em cima (16:9) e o texto abaixo; a partir de sm ela cobre todo o hero. */
function Backdrop({ path }: { path: string | null }) {
  const backdrop = tmdbImageUrl(path, 'w1280')
  return (
    <div className="relative aspect-4/3 sm:absolute sm:inset-0 sm:aspect-auto">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          preload
          sizes="100vw"
          className="object-cover object-[center_20%]"
        />
      )}
      <div className="absolute inset-0 hidden bg-linear-to-r from-background/95 via-background/45 to-transparent sm:block" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-background via-background/40 to-transparent" />
    </div>
  )
}

function MovieMeta({ movie }: { movie: MovieDetails }) {
  const runtime = formatRuntime(movie.runtime)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-medium text-foreground/90 sm:text-base">
      {movie.rating !== null && (
        <Badge
          variant="rating"
          aria-label={`Nota ${formatRating(movie.rating)}`}
          className="text-sm"
        >
          <Star aria-hidden className="size-3.5 fill-current" />
          {formatRating(movie.rating)}
        </Badge>
      )}
      {movie.releaseYear !== null && <span>{movie.releaseYear}</span>}
      {runtime && <span>{runtime}</span>}
      {movie.genres.length > 0 && (
        <ul aria-label="Gêneros" className="flex flex-wrap gap-1.5">
          {movie.genres.map((genre) => (
            <li
              key={genre.id}
              className="rounded-sm border border-foreground/35 px-1.5 text-xs leading-5"
            >
              {genre.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const titleClass =
  'font-display leading-[0.88] tracking-wide text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]'

/** Topo da página do filme. */
export function MovieHero({ movie }: { movie: MovieDetails }) {
  return (
    <section className={bleed}>
      <Backdrop path={movie.backdropPath} />
      <div className="relative -mt-20 px-gutter pb-6 sm:mt-0 sm:flex sm:min-h-[82svh] sm:items-end sm:pt-40 sm:pb-14">
        <div className="max-w-2xl space-y-4">
          <div>
            <h1 className={`${titleClass} text-[clamp(3.25rem,8vw,7rem)]`}>
              {movie.title}
            </h1>
            {movie.originalTitle !== movie.title && (
              <p className="mt-1 text-muted italic">{movie.originalTitle}</p>
            )}
          </div>
          <MovieMeta movie={movie} />
          {movie.overview && (
            <ExpandableText className="max-w-xl text-base leading-relaxed text-foreground/90 sm:text-lg">
              {movie.overview}
            </ExpandableText>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Trailer trailerKey={movie.trailerKey} title={movie.title} />
            <Button asChild variant="glass" size="lg">
              <a href="#onde-assistir">
                <Tv aria-hidden className="size-5 sm:size-6" />
                Onde assistir
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Destaque da home: o filme mais popular do momento. */
export function FeaturedHero({ movie }: { movie: MovieDetails }) {
  return (
    <section aria-labelledby="destaque" className={bleed}>
      <Backdrop path={movie.backdropPath} />
      <div className="relative -mt-20 px-gutter pb-4 sm:mt-0 sm:flex sm:min-h-[88svh] sm:items-end sm:pt-40 sm:pb-28 lg:pb-40">
        <div className="max-w-xl space-y-4">
          <p className="flex items-center gap-2 text-sm font-semibold sm:text-base">
            <span className="rounded-xs bg-accent px-1 py-0.5 text-[0.65rem] leading-none font-black tracking-tight">
              TOP
              <br />
              10
            </span>
            Nº 1 em popularidade nos streamings hoje
          </p>
          <h1
            id="destaque"
            className={`${titleClass} text-[clamp(3.5rem,9vw,8rem)]`}
          >
            {movie.title}
          </h1>
          <MovieMeta movie={movie} />
          {movie.overview && (
            <p className="line-clamp-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {movie.overview}
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Trailer trailerKey={movie.trailerKey} title={movie.title} />
            <Button asChild variant="glass" size="lg">
              <Link href={`/movie/${movie.id}`}>
                <Info aria-hidden className="size-5 sm:size-6" />
                Mais informações
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
