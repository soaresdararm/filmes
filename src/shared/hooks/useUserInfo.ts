'use client'

import { useUserStore, type User } from '@/store/user-store'

export function useUserInfo(): { user: User | null; isAuthenticated: boolean } {
  const user = useUserStore((state) => state.user)
  return { user, isAuthenticated: user !== null }
}
