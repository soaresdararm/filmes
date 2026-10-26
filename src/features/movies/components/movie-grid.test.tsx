import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MovieGrid } from './movie-grid'

describe('MovieGrid', () => {
  it('lista os filmes', () => {
    render(
      <MovieGrid
        movies={[
          { id: 1, title: 'A', posterPath: null, releaseYear: null, rating: null },
          { id: 2, title: 'B', posterPath: null, releaseYear: null, rating: null },
        ]}
        empty={<p>vazio</p>}
      />,
    )
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByText('vazio')).toBeNull()
  })

  it('lista vazia renderiza o empty', () => {
    render(<MovieGrid movies={[]} empty={<p>vazio</p>} />)
    expect(screen.getByText('vazio')).toBeInTheDocument()
    expect(screen.queryByRole('list')).toBeNull()
  })
})
