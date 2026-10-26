import { z } from 'zod'
import { MAX_PAGE, SORT_OPTIONS, type DiscoverParams } from '@/features/movies'
import { CURATED_PROVIDER_IDS } from '@/shared/config/site'

export type Filters = DiscoverParams

export type RawSearchParams = Record<string, string | string[] | undefined>

export const DEFAULT_FILTERS: Filters = {
  providers: [],
  rating: 0,
  sort: 'popularity.desc',
  page: 1,
}

const MIN_YEAR = 1900

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)

const optionalInt = z.coerce.number().int().optional().catch(undefined)
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** URL → filtros válidos. Nunca lança: valores inválidos voltam ao padrão ou são limitados. */
export function parseFilters(params: RawSearchParams, now = new Date()): Filters {
  const read = (key: string) => {
    const value = first(params[key])?.trim()
    return value === '' ? undefined : value
  }
  const currentYear = now.getFullYear()

  const providers = [
    ...new Set(
      (read('providers') ?? '')
        .split(',')
        .map(Number)
        .filter((id) => CURATED_PROVIDER_IDS.includes(id)),
    ),
  ]

  const genre = optionalInt.parse(read('genre'))

  const toYear = (raw: string | undefined) => {
    const year = optionalInt.parse(raw)
    return year === undefined ? undefined : clamp(year, MIN_YEAR, currentYear)
  }
  let yearFrom = toYear(read('yearFrom'))
  let yearTo = toYear(read('yearTo'))
  if (yearFrom !== undefined && yearTo !== undefined && yearFrom > yearTo) {
    ;[yearFrom, yearTo] = [yearTo, yearFrom]
  }

  const rating = clamp(z.coerce.number().catch(0).parse(read('rating') ?? 0), 0, 10)
  const sort = z.enum(SORT_OPTIONS).catch(DEFAULT_FILTERS.sort).parse(read('sort'))
  const page = clamp(z.coerce.number().int().catch(1).parse(read('page') ?? 1), 1, MAX_PAGE)

  return {
    providers,
    ...(genre !== undefined && genre > 0 && { genre }),
    ...(yearFrom !== undefined && { yearFrom }),
    ...(yearTo !== undefined && { yearTo }),
    rating,
    sort,
    page,
  }
}

/** Filtros → URL, omitindo valores padrão para manter a URL limpa. */
export function serializeFilters(filters: Filters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.providers.length > 0) params.set('providers', filters.providers.join(','))
  if (filters.genre !== undefined) params.set('genre', String(filters.genre))
  if (filters.yearFrom !== undefined) params.set('yearFrom', String(filters.yearFrom))
  if (filters.yearTo !== undefined) params.set('yearTo', String(filters.yearTo))
  if (filters.rating > 0) params.set('rating', String(filters.rating))
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort)
  if (filters.page > 1) params.set('page', String(filters.page))
  return params
}
