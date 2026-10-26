'use client'

import { create } from 'zustand'

export type User = {
  id: string
  name: string
  email: string
  avatarUrl: string | null
}

type UserState = {
  user: User | null
  setUser: (user: User | null) => void
}

/** Sessão do usuário. Sempre `null` na v1; a futura feature de auth preenche via setUser. */
export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))
