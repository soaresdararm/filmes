import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_FILTERS, parseFilters } from '../schemas/filters'
import { FiltersForm } from './filters-form'

const push = vi.fn()
let search = ''

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search),
  usePathname: () => '/',
}))

const providers = [
  { id: 8, name: 'Netflix', logoPath: '/n.png' },
  { id: 119, name: 'Prime Video', logoPath: '/p.png' },
]
const genres = [{ id: 28, name: 'Ação' }]

function renderForm(query = '') {
  search = query
  const initial = parseFilters(Object.fromEntries(new URLSearchParams(query)))
  return render(
    <FiltersForm initial={initial} providers={providers} genres={genres} />,
  )
}

describe('FiltersForm', () => {
  beforeEach(() => push.mockClear())

  it('clicar num provedor aplica a seleção', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: 'Netflix' }))
    expect(push).toHaveBeenCalledWith('/?providers=8', { scroll: false })
  })

  it('desmarcar o provedor remove da URL', async () => {
    renderForm('providers=8')
    const chip = screen.getByRole('button', { name: 'Netflix' })
    expect(chip).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(chip)
    expect(push).toHaveBeenCalledWith('/', { scroll: false })
  })

  it('ano válido é aplicado ao sair do campo', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Ano inicial'), '2000')
    await userEvent.tab()
    expect(push).toHaveBeenCalledWith('/?yearFrom=2000', { scroll: false })
  })

  it('ano inválido mostra erro e não aplica', async () => {
    renderForm()
    await userEvent.type(screen.getByLabelText('Ano inicial'), '1800')
    await userEvent.tab()
    expect(await screen.findByText(/ano entre 1900 e/i)).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it('limpar filtros faz reset', async () => {
    renderForm('genre=28&rating=7')
    await userEvent.click(
      screen.getByRole('button', { name: /limpar filtros/i }),
    )
    expect(push).toHaveBeenCalledWith('/', { scroll: false })
  })

  it('sem filtros ativos não mostra o botão de limpar', () => {
    renderForm()
    expect(DEFAULT_FILTERS.providers).toEqual([])
    expect(screen.queryByRole('button', { name: /limpar filtros/i })).toBeNull()
  })
})
