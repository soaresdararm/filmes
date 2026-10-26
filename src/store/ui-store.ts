'use client'

import { create } from 'zustand'

type UiState = {
  filtersDrawerOpen: boolean
  setFiltersDrawerOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>()((set) => ({
  filtersDrawerOpen: false,
  setFiltersDrawerOpen: (filtersDrawerOpen) => set({ filtersDrawerOpen }),
}))
