import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { DEFAULT_FILTERS, type Filters } from '@/features/catalog-filters'
import {
  FeaturedHero,
  HeroSkeleton,
  MovieRow,
  MovieRowSkeleton,
  TopTenRow,
} from '@/features/movies'
import { discoverMovies, getMovieDetails } from '@/features/movies/server'
import { exploreLinks } from '@/shared/config/site'

const popular: Filters = DEFAULT_FILTERS
const releases: Filters = {
  ...DEFAULT_FILTERS,
  sort: 'primary_release_date.desc',
}
const topRated: Filters = {
  ...DEFAULT_FILTERS,
  rating: 7,
  sort: 'vote_average.desc',
}

async function Featured() {
  const { results } = await discoverMovies(popular)
  const top = results.find((movie) => movie.backdropPath)
  if (!top) return null
  return <FeaturedHero movie={await getMovieDetails(top.id)} />
}

async function PopularRow() {
  const { results } = await discoverMovies(popular)
  return (
    <TopTenRow
      title="Nos streamings hoje"
      movies={results}
      href={exploreLinks.all}
    />
  )
}

async function ReleasesRow() {
  const { results } = await discoverMovies(releases)
  return (
    <MovieRow
      title="Lançamentos"
      movies={results}
      href={exploreLinks.releases}
    />
  )
}

async function TopRatedRow() {
  const { results } = await discoverMovies(topRated)
  return (
    <TopTenRow
      variant="tab"
      title="Mais bem avaliados"
      movies={results}
      href={exploreLinks.topRated}
    />
  )
}

export default async function HomePage({ searchParams }: PageProps<'/'>) {
  // links antigos com filtros (/?providers=8) vão para o catálogo filtrável, que valida os parâmetros
  const query = new URLSearchParams(
    Object.entries(await searchParams).flatMap(([key, value]) =>
      [value ?? []].flat().map((item) => [key, item]),
    ),
  ).toString()
  if (query) redirect(`${exploreLinks.all}?${query}`)

  return (
    <>
      <Suspense fallback={<HeroSkeleton />}>
        <Featured />
      </Suspense>
      {/* as fileiras sobem por cima do fim do hero */}
      <div className="relative z-10 space-y-8 sm:-mt-16 sm:space-y-12 lg:-mt-24">
        <Suspense fallback={<MovieRowSkeleton />}>
          <PopularRow />
        </Suspense>
        <Suspense fallback={<MovieRowSkeleton />}>
          <ReleasesRow />
        </Suspense>
        <Suspense fallback={<MovieRowSkeleton />}>
          <TopRatedRow />
        </Suspense>
      </div>
    </>
  )
}
