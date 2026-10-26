import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Pagination } from './pagination'

const hrefFor = (page: number) => `/?page=${page}`

describe('Pagination', () => {
  it('marca a página atual e gera hrefs', () => {
    render(<Pagination page={1} totalPages={3} hrefFor={hrefFor} />)
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'href',
      '/?page=2',
    )
    expect(screen.getByText('1').closest('[aria-current]')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('desabilita "Anterior" na primeira página e "Próxima" na última', () => {
    const { rerender } = render(
      <Pagination page={1} totalPages={3} hrefFor={hrefFor} />,
    )
    expect(screen.queryByRole('link', { name: /anterior/i })).toBeNull()
    expect(screen.getByRole('link', { name: /próxima/i })).toHaveAttribute(
      'href',
      '/?page=2',
    )
    rerender(<Pagination page={3} totalPages={3} hrefFor={hrefFor} />)
    expect(screen.queryByRole('link', { name: /próxima/i })).toBeNull()
  })

  it('nunca gera link para página além do total', () => {
    render(<Pagination page={400} totalPages={3} hrefFor={hrefFor} />)
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'))
    expect(hrefs.every((h) => Number(h!.split('=')[1]) <= 3)).toBe(true)
  })

  it('não renderiza com uma página só', () => {
    const { container } = render(
      <Pagination page={1} totalPages={1} hrefFor={hrefFor} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
