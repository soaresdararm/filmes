import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useUserStore } from '@/store/user-store'
import { UserSlot } from './user-slot'

describe('UserSlot', () => {
  afterEach(() => useUserStore.setState({ user: null }))

  it('não renderiza nada sem usuário', () => {
    const { container } = render(<UserSlot />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mostra o nome com usuário', () => {
    render(<UserSlot />)
    act(() =>
      useUserStore.getState().setUser({ id: '1', name: 'Dara', email: 'd@x.com', avatarUrl: null }),
    )
    expect(screen.getByText('Dara')).toBeInTheDocument()
  })
})
