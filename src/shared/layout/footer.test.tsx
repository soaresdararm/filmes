import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footer } from './footer'

describe('Footer', () => {
  it('contém as atribuições exigidas ao TMDB e à JustWatch', () => {
    render(<Footer />)
    expect(
      screen.getByText('Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Dados de disponibilidade fornecidos pela JustWatch.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'The Movie Database (TMDB)' })).toBeInTheDocument()
  })
})
