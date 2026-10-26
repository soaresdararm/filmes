'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { Genre, Provider } from '@/features/movies'
import { Button } from '@/shared/ui/button'
import { useFiltersUrl } from '../hooks/useFiltersUrl'
import { DEFAULT_FILTERS, type Filters } from '../schemas/filters'
import { FiltersDrawer } from './filters-drawer'
import { GenreSelect } from './genre-select'
import { ProviderPicker } from './provider-picker'
import { RatingSlider } from './rating-slider'
import { SortSelect } from './sort-select'
import { YearRange, type YearFormValues } from './year-range'

const MIN_YEAR = 1900

function yearSchema(currentYear: number) {
  const year = z
    .string()
    .trim()
    .refine((value) => {
      if (value === '') return true
      const n = Number(value)
      return /^\d{4}$/.test(value) && n >= MIN_YEAR && n <= currentYear
    }, `Ano entre ${MIN_YEAR} e ${currentYear}`)
  return z.object({ yearFrom: year, yearTo: year })
}

const toYear = (value: string) =>
  value.trim() === '' ? undefined : Number(value)

type FiltersFormProps = {
  initial: Filters
  providers: Provider[]
  genres: Genre[]
}

export function FiltersForm({ initial, providers, genres }: FiltersFormProps) {
  const { apply, reset } = useFiltersUrl()

  const yearForm = useForm<YearFormValues>({
    resolver: zodResolver(yearSchema(new Date().getFullYear())),
    // `values` resincroniza o formulário quando a URL (e portanto `initial`) muda
    values: {
      yearFrom: initial.yearFrom?.toString() ?? '',
      yearTo: initial.yearTo?.toString() ?? '',
    },
  })

  const commitYears = async () => {
    if (!(await yearForm.trigger())) return
    const { yearFrom, yearTo } = yearForm.getValues()
    const next = { yearFrom: toYear(yearFrom), yearTo: toYear(yearTo) }
    if (next.yearFrom === initial.yearFrom && next.yearTo === initial.yearTo)
      return
    apply(next)
  }

  const activeCount = [
    initial.genre !== undefined,
    initial.yearFrom !== undefined || initial.yearTo !== undefined,
    initial.rating > 0,
    initial.sort !== DEFAULT_FILTERS.sort,
  ].filter(Boolean).length
  const hasActiveFilters = activeCount > 0 || initial.providers.length > 0

  const fields = (
    <>
      <GenreSelect
        genres={genres}
        value={initial.genre}
        onChange={(genre) => apply({ genre })}
      />
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void commitYears()
        }}
      >
        <YearRange form={yearForm} onCommit={() => void commitYears()} />
      </form>
      <RatingSlider
        key={initial.rating}
        value={initial.rating}
        onCommit={(rating) => apply({ rating })}
      />
      <SortSelect value={initial.sort} onChange={(sort) => apply({ sort })} />
    </>
  )

  return (
    <section aria-label="Filtros" className="space-y-3">
      <ProviderPicker
        providers={providers}
        value={initial.providers}
        onChange={(ids) => apply({ providers: ids })}
      />
      <div className="flex flex-wrap items-start gap-3">
        <FiltersDrawer activeCount={activeCount}>{fields}</FiltersDrawer>
        <div className="hidden flex-1 grid-cols-[1fr_1.2fr_1fr_1fr] items-start gap-3 md:grid">
          {fields}
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={reset}>
            <X aria-hidden className="size-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </section>
  )
}
