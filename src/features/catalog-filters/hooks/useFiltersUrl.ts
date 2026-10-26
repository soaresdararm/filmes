'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import {
  parseFilters,
  serializeFilters,
  type Filters,
} from '../schemas/filters'

export function useFiltersUrl(): {
  filters: Filters
  apply: (next: Partial<Filters>) => void
  reset: () => void
} {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters = useMemo(
    () => parseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  )

  const apply = useCallback(
    (next: Partial<Filters>) => {
      // qualquer mudança de filtro volta à página 1, a menos que a página seja o que mudou
      const query = serializeFilters({
        ...filters,
        page: 1,
        ...next,
      }).toString()
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [filters, pathname, router],
  )

  const reset = useCallback(
    () => router.push(pathname, { scroll: false }),
    [pathname, router],
  )

  return { filters, apply, reset }
}
