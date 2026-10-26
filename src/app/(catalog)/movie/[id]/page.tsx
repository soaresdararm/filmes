import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  CastList,
  MovieHero,
  parseMovieId,
  Trailer,
  WhereToWatch,
} from '@/features/movies'
import { getMovieDetails } from '@/features/movies/server'
import { isTmdbError } from '@/services/tmdb/errors'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { siteConfig } from '@/shared/config/site'

/** Compartilhado entre generateMetadata e a página; ID inválido ou 404 do TMDB → not-found. */
const loadMovie = cache(async (param: string) => {
  const id = parseMovieId(param)
  if (id === null) notFound()
  try {
    return await getMovieDetails(id)
  } catch (error) {
    if (isTmdbError(error) && error.status === 404) notFound()
    throw error
  }
})

export async function generateMetadata({
  params,
}: PageProps<'/movie/[id]'>): Promise<Metadata> {
  const movie = await loadMovie((await params).id)
  const backdrop = tmdbImageUrl(movie.backdropPath, 'w1280')

  return {
    title: movie.releaseYear
      ? `${movie.title} (${movie.releaseYear})`
      : movie.title,
    description: movie.overview ?? siteConfig.description,
    openGraph: backdrop ? { images: [backdrop] } : undefined,
  }
}

export default async function MoviePage({ params }: PageProps<'/movie/[id]'>) {
  const movie = await loadMovie((await params).id)

  return (
    <article className="space-y-10">
      <MovieHero movie={movie} />
      <WhereToWatch watch={movie.watch} />
      <section aria-labelledby="sinopse" className="max-w-3xl space-y-3">
        <h2 id="sinopse" className="text-xl font-semibold">
          Sinopse
        </h2>
        <p className="leading-relaxed text-foreground/85">
          {movie.overview ?? 'Sinopse indisponível.'}
        </p>
      </section>
      <Trailer trailerKey={movie.trailerKey} title={movie.title} />
      <CastList cast={movie.cast} />
    </article>
  )
}
