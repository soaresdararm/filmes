import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Button } from './button'

describe('Button', () => {
  it('aplica a variante chip e repassa aria-pressed', () => {
    render(
      <Button variant="chip" aria-pressed>
        Netflix
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Netflix' })
    expect(button).toHaveClass('rounded-full')
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('asChild renderiza o filho com as classes', () => {
    render(
      <Button asChild>
        <a href="/x">Ir</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Ir' })).toHaveClass('inline-flex')
  })
})
