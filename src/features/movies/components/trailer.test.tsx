import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Trailer } from './trailer'

describe('Trailer', () => {
  it('só monta o iframe após o clique', async () => {
    render(<Trailer trailerKey="KEY" title="Duna" />)
    expect(screen.queryByTitle('Trailer de Duna')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: /assistir trailer/i }))
    expect(screen.getByTitle('Trailer de Duna')).toHaveAttribute(
      'src',
      'https://www.youtube-nocookie.com/embed/KEY?autoplay=1',
    )
  })

  it('sem key não renderiza', () => {
    const { container } = render(<Trailer trailerKey={null} title="Duna" />)
    expect(container).toBeEmptyDOMElement()
  })
})
