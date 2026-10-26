import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useFiltersUrl } from './useFiltersUrl'

const push = vi.fn()
let search = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
  usePathname: () => '/',
}))

describe('useFiltersUrl', () => {
  beforeEach(() => {
    push.mockClear()
    search = 'page=4&genre=28'
  })

  it('expõe os filtros da URL', () => {
    const { result } = renderHook(() => useFiltersUrl())
    expect(result.current.filters).toMatchObject({ genre: 28, page: 4 })
  })

  it('apply mescla, volta à página 1 e faz push', () => {
    const { result } = renderHook(() => useFiltersUrl())
    act(() => result.current.apply({ rating: 7 }))
    expect(push).toHaveBeenCalledWith('/?genre=28&rating=7', { scroll: false })
  })

  it('apply com page explícita mantém a página', () => {
    const { result } = renderHook(() => useFiltersUrl())
    act(() => result.current.apply({ page: 5 }))
    expect(push).toHaveBeenCalledWith('/?genre=28&page=5', { scroll: false })
  })

  it('reset limpa a URL', () => {
    const { result } = renderHook(() => useFiltersUrl())
    act(() => result.current.reset())
    expect(push).toHaveBeenCalledWith('/', { scroll: false })
  })
})
