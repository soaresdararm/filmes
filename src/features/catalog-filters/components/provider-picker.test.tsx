import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProviderPicker } from './provider-picker'

const providers = [
  { id: 8, name: 'Netflix', logoPath: '/n.png' },
  { id: 119, name: 'Prime Video', logoPath: null },
]

describe('ProviderPicker', () => {
  it('marca selecionados com aria-pressed', () => {
    render(
      <ProviderPicker providers={providers} value={[8]} onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: 'Netflix' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Prime Video' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('alterna a seleção', async () => {
    const onChange = vi.fn()
    render(
      <ProviderPicker providers={providers} value={[8]} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Prime Video' }))
    expect(onChange).toHaveBeenLastCalledWith([8, 119])
    await userEvent.click(screen.getByRole('button', { name: 'Netflix' }))
    expect(onChange).toHaveBeenLastCalledWith([])
  })
})
