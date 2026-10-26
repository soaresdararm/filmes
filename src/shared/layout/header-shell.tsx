'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Header fixo: transparente sobre o hero, sólido depois que a página rola. */
export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30 transition-colors duration-500',
        scrolled
          ? 'bg-background shadow-lg shadow-black/40'
          : 'bg-linear-to-b from-black/80 to-transparent',
      )}
    >
      {children}
    </header>
  )
}
