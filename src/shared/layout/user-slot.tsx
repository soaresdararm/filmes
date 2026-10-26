'use client'

import { useUserInfo } from '@/shared/hooks/useUserInfo'

/** Espaço do usuário no header. Vazio até existir a feature de auth. */
export function UserSlot() {
  const { user } = useUserInfo()
  if (!user) return null

  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        aria-hidden
        className="flex size-8 items-center justify-center rounded-full bg-accent font-semibold"
      >
        {user.name.charAt(0).toUpperCase()}
      </span>
      <span className="hidden sm:inline">{user.name}</span>
    </div>
  )
}
