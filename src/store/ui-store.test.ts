import { describe, expect, it } from 'vitest'
import { useUiStore } from './ui-store'

describe('ui-store', () => {
  it('alterna o drawer de filtros', () => {
    expect(useUiStore.getState().filtersDrawerOpen).toBe(false)
    useUiStore.getState().setFiltersDrawerOpen(true)
    expect(useUiStore.getState().filtersDrawerOpen).toBe(true)
  })
})
