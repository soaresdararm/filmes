import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MovieDetails } from '../types'
import { formatRuntime, MovieHero } from './movie-hero'

const movie: MovieDetails = {
  id: 1,
  title: 'Duna',
  originalTitle: 'Dune',
  posterPath: '/p.jpg',
  backdropPath: '/b.jpg',
  releaseYear: 2021,
  rating: 7.8,
  overview: 'Sinopse',
  runtime: 155,
  genres: [{ id: 878, name: 'Ficção científica' }],
  cast: [],
  trailerKey: null,
  watch: { link: null, providers: [] },
  similar: [],
}

describe('formatRuntime', () => {
  it('formata horas e minutos', () => {
    expect(formatRuntime(136)).toBe('2h 16min')
    expect(formatRuntime(120)).toBe('2h')
    expect(formatRuntime(45)).toBe('45min')
    expect(formatRuntime(null)).toBeNull()
  })
})

describe('MovieHero', () => {
  it('mostra título, título original, ano, duração, gêneros e nota', () => {
    render(<MovieHero movie={movie} />)
    expect(
      screen.getByRole('heading', { level: 1, name: 'Duna' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Dune')).toBeInTheDocument()
    expect(screen.getByText('2021')).toBeInTheDocument()
    expect(screen.getByText('2h 35min')).toBeInTheDocument()
    expect(screen.getByText('Ficção científica')).toBeInTheDocument()
    expect(screen.getByLabelText('Nota 7,8')).toBeInTheDocument()
  })

  it('omite o título original quando igual', () => {
    render(<MovieHero movie={{ ...movie, originalTitle: 'Duna' }} />)
    expect(screen.getAllByText('Duna')).toHaveLength(1)
  })

  it('sem backdrop, nota e duração não quebra', () => {
    render(
      <MovieHero
        movie={{
          ...movie,
          posterPath: null,
          backdropPath: null,
          rating: null,
          runtime: null,
        }}
      />,
    )
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Duna')
    expect(screen.queryByLabelText(/nota/i)).toBeNull()
  })
})
