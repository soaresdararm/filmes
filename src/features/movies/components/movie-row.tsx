import type { ReactNode } from 'react'
import { Carousel } from '@/shared/ui/carousel'
import { carouselItemClass } from '@/shared/ui/carousel-items'
import { Skeleton } from '@/shared/ui/skeleton'
import type { Movie } from '../types'
import { MovieTile, RankedTile, RatedTile } from './movie-tile'

type MovieRowProps = {
  title: ReactNode
  movies: Movie[]
  href?: string
}

type TopTenRowProps = MovieRowProps & {
  /** `numeral`: número contornado ao lado da capa; `tab`: aba com a posição e nota abaixo. */
  variant?: 'numeral' | 'tab'
}

/** Fileira de cards horizontais. Filmes sem imagem nenhuma ficam de fora: na fileira só pesariam. */
export function MovieRow({ title, movies, href }: MovieRowProps) {
  const visible = movies.filter((m) => m.backdropPath ?? m.posterPath)
  if (visible.length === 0) return null

  return (
    <Carousel title={title} href={href}>
      {visible.map((movie) => (
        <li key={movie.id} className={carouselItemClass.landscape}>
          <MovieTile movie={movie} />
        </li>
      ))}
    </Carousel>
  )
}

/** Dez primeiros com pôster, numerados. O selo "Top 10" vem antes do título. */
export function TopTenRow({
  title,
  movies,
  href,
  variant = 'numeral',
}: TopTenRowProps) {
  const ranked = movies.filter((m) => m.posterPath).slice(0, 10)
  if (ranked.length === 0) return null

  return (
    <Carousel
      href={href}
      title={
        <>
          <span className="rounded-xs bg-accent px-1.5 py-0.5 font-display text-base leading-none tracking-wide sm:text-lg">
            Top 10
          </span>
          {title}
        </>
      }
    >
      {ranked.map((movie, index) => (
        <li
          key={movie.id}
          className={
            variant === 'numeral'
              ? carouselItemClass.ranked
              : carouselItemClass.portrait
          }
        >
          {variant === 'numeral' ? (
            <RankedTile movie={movie} rank={index + 1} />
          ) : (
            <RatedTile movie={movie} rank={index + 1} />
          )}
        </li>
      ))}
    </Carousel>
  )
}

export function HeroSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando destaque"
      className="relative -mx-gutter -mt-28 h-[70svh] bg-surface/50 lg:-mt-24 lg:h-[85svh]"
    >
      <div className="absolute bottom-24 left-gutter w-[min(36rem,80%)] space-y-4">
        <Skeleton className="h-20 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}

export function MovieRowSkeleton() {
  return (
    <div role="status" aria-label="Carregando filmes" className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="-mx-gutter flex gap-2 overflow-hidden px-gutter">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton
            key={i}
            className={`${carouselItemClass.landscape} aspect-video`}
          />
        ))}
      </div>
    </div>
  )
}
