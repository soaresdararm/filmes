import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { Suspense } from 'react'
import { parseFilters } from '@/features/catalog-filters'
import { EmptyState, MovieGrid, MovieGridSkeleton } from '@/features/movies'
import { searchMovies } from '@/features/movies/server'
import { formatCount } from '@/shared/lib/format'
import { Pagination } from '@/shared/ui/pagination'

export const metadata: Metadata = { title: 'Busca' }

const MIN_QUERY_LENGTH = 2

const searchHref = (query: string, page: number) =>
  `/search?q=${encodeURIComponent(query)}${page > 1 ? `&page=${page}` : ''}`

async function SearchResults({ query, page }: { query: string; page: number }) {
  const { results, totalPages, totalResults } = await searchMovies(query, page)

  return (
    <div className="space-y-8">
      {results.length > 0 && (
        <p className="text-sm text-muted">{formatCount(totalResults)} resultados</p>
      )}
      <MovieGrid
        movies={results}
        empty={<EmptyState title={`Nenhum filme encontrado para “${query}”`} />}
      />
      <Pagination page={page} totalPages={totalPages} hrefFor={(p) => searchHref(query, p)} />
    </div>
  )
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const params = await searchParams
  const rawQuery = Array.isArray(params.q) ? params.q[0] : params.q
  const query = (rawQuery ?? '').trim()
  // mesma regra de página do catálogo: 1..500
  const { page } = parseFilters({ page: params.page })

  if (query.length < MIN_QUERY_LENGTH) {
    return (
      <EmptyState
        title="Busque um filme pelo título"
        description="Use a busca no topo da página."
      />
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Resultados para “{query}”</h1>
      <p className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface px-4 py-3 text-sm text-muted">
        <Info aria-hidden className="size-4 shrink-0" />
        Resultados de todo o TMDB, nem todos estão disponíveis em streaming.
      </p>
      <Suspense key={`${query}:${page}`} fallback={<MovieGridSkeleton />}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </div>
  )
}
