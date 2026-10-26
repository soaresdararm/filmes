import Link from 'next/link'
import { Suspense } from 'react'
import { FiltersForm, parseFilters, serializeFilters, type Filters } from '@/features/catalog-filters'
import { EmptyState, MovieGrid, MovieGridSkeleton } from '@/features/movies'
import { discoverMovies, getGenres, getProviders } from '@/features/movies/server'
import { formatCount } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Pagination } from '@/shared/ui/pagination'

const catalogHref = (filters: Filters) => {
  const query = serializeFilters(filters).toString()
  return query ? `/?${query}` : '/'
}

async function CatalogResults({ filters }: { filters: Filters }) {
  const { results, totalPages, totalResults } = await discoverMovies(filters)

  const empty =
    filters.page > 1 ? (
      <EmptyState
        title="Página inexistente"
        description="Essa página não tem resultados para os filtros escolhidos."
        action={
          <Button asChild variant="outline">
            <Link href={catalogHref({ ...filters, page: 1 })}>Voltar para a página 1</Link>
          </Button>
        }
      />
    ) : (
      <EmptyState
        title="Nenhum filme com esses filtros"
        description="Tente outros streamings, gêneros ou um intervalo de anos maior."
        action={
          <Button asChild variant="outline">
            <Link href="/">Limpar filtros</Link>
          </Button>
        }
      />
    )

  return (
    <div className="space-y-8">
      {results.length > 0 && (
        <p className="text-sm text-muted">{formatCount(totalResults)} filmes</p>
      )}
      <MovieGrid movies={results} empty={empty} />
      <Pagination
        page={filters.page}
        totalPages={totalPages}
        hrefFor={(page) => catalogHref({ ...filters, page })}
      />
    </div>
  )
}

export default async function CatalogPage({ searchParams }: PageProps<'/'>) {
  const filters = parseFilters(await searchParams)
  const [providers, genres] = await Promise.all([getProviders(), getGenres()])

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Disponível agora</h1>
        <p className="text-muted">Filmes nos streamings por assinatura do Brasil.</p>
      </div>
      <FiltersForm initial={filters} providers={providers} genres={genres} />
      {/* key força o fallback a cada mudança de filtro */}
      <Suspense key={serializeFilters(filters).toString()} fallback={<MovieGridSkeleton />}>
        <CatalogResults filters={filters} />
      </Suspense>
    </div>
  )
}
