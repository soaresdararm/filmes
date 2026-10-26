import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Movie } from '../types'
import { MovieCard } from './movie-card'

const movie: Movie = {
  id: 1,
  title: 'Duna',
  posterPath: '/d.jpg',
  releaseYear: 2021,
  rating: 7.5,
}

describe('MovieCard', () => {
  it('mostra título, ano e nota formatada com link para detalhes', () => {
    render(<MovieCard movie={movie} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/movie/1')
    expect(screen.getByText('Duna')).toBeInTheDocument()
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota 7,5')).toHaveTextContent('7,5')
    expect(screen.getByRole('img', { name: 'Pôster de Duna' })).toHaveAttribute(
      'src',
      'https://image.tmdb.org/t/p/w342/d.jpg',
    )
  })

  it('sem pôster mostra placeholder', () => {
    render(<MovieCard movie={{ ...movie, posterPath: null }} />)
    expect(screen.getByText('Sem pôster')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('sem nota não mostra badge', () => {
    render(<MovieCard movie={{ ...movie, rating: null }} />)
    expect(screen.queryByLabelText(/nota/i)).toBeNull()
  })

  it('sem ano não mostra ano', () => {
    render(<MovieCard movie={{ ...movie, releaseYear: null }} />)
    expect(screen.queryByText('2021')).toBeNull()
  })
})
