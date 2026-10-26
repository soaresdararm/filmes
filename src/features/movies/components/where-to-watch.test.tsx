import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WhereToWatch } from './where-to-watch'

describe('WhereToWatch', () => {
  it('lista provedores e o link do JustWatch', () => {
    render(
      <WhereToWatch
        watch={{
          link: 'https://www.themoviedb.org/movie/1/watch?locale=BR',
          providers: [{ id: 8, name: 'Netflix', logoPath: '/n.png' }],
        }}
      />,
    )
    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /ver no justwatch/i })
    expect(link).toHaveAttribute(
      'href',
      'https://www.themoviedb.org/movie/1/watch?locale=BR',
    )
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('sem provedores mostra a mensagem', () => {
    render(<WhereToWatch watch={{ link: null, providers: [] }} />)
    expect(
      screen.getByText('Não disponível em streaming por assinatura no Brasil'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
  })
})
