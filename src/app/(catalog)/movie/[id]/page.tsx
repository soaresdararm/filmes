import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import {
  CastList,
  MovieAbout,
  MovieHero,
  MovieRow,
  parseMovieId,
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
    <article className="space-y-12 sm:space-y-16">
      <MovieHero movie={movie} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
        <WhereToWatch watch={movie.watch} />
        <MovieAbout movie={movie} />
      </div>
      <CastList cast={movie.cast} />
      <MovieRow title="Títulos semelhantes" movies={movie.similar} />
    </article>
  )
}
