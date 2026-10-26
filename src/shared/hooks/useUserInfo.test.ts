import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useUserStore, type User } from '@/store/user-store'
import { useUserInfo } from './useUserInfo'

const user: User = { id: '1', name: 'Dara', email: 'dara@example.com', avatarUrl: null }

describe('useUserInfo', () => {
  afterEach(() => useUserStore.setState({ user: null }))

  it('começa sem usuário', () => {
    const { result } = renderHook(() => useUserInfo())
    expect(result.current).toEqual({ user: null, isAuthenticated: false })
  })

  it('reflete setUser', () => {
    const { result } = renderHook(() => useUserInfo())
    act(() => useUserStore.getState().setUser(user))
    expect(result.current).toEqual({ user, isAuthenticated: true })
  })
})
