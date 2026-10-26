import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SearchBar } from './search-bar'

const push = vi.fn()
let search = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
  usePathname: () => (search ? '/search' : '/'),
}))

const input = () => screen.getByRole('searchbox', { name: 'Buscar filmes' })
const type = (value: string) => fireEvent.change(input(), { target: { value } })

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    push.mockClear()
    search = ''
  })
  afterEach(() => vi.useRealTimers())

  it('navega após 400ms com a query codificada', () => {
    render(<SearchBar />)
    type('ação & aventura')
    act(() => vi.advanceTimersByTime(400))
    expect(push).toHaveBeenCalledWith(
      '/search?q=a%C3%A7%C3%A3o%20%26%20aventura',
    )
  })

  it('não navega antes do debounce', () => {
    render(<SearchBar />)
    type('matrix')
    act(() => vi.advanceTimersByTime(399))
    expect(push).not.toHaveBeenCalled()
  })

  it('não navega com menos de 2 caracteres', () => {
    render(<SearchBar />)
    type('a')
    act(() => vi.advanceTimersByTime(400))
    expect(push).not.toHaveBeenCalled()
  })

  it('não navega de novo quando a busca já está na URL', () => {
    search = 'q=matrix'
    render(<SearchBar />)
    expect(input()).toHaveValue('matrix')
    act(() => vi.advanceTimersByTime(400))
    expect(push).not.toHaveBeenCalled()
  })

  it('Enter com 1 caractere mostra o erro', async () => {
    render(<SearchBar />)
    type('a')
    await act(async () => {
      fireEvent.submit(input())
    })
    expect(screen.getByText('Digite ao menos 2 caracteres')).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('Enter com busca válida navega na hora', async () => {
    render(<SearchBar />)
    type('duna')
    await act(async () => {
      fireEvent.submit(input())
    })
    expect(push).toHaveBeenCalledWith('/search?q=duna')
  })
})
