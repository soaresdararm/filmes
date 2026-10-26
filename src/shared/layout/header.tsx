import { Clapperboard } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { siteConfig } from '@/shared/config/site'
import { UserSlot } from './user-slot'

/** `search` é injetado pelo app/layout para que shared/ não dependa de features/. */
export function Header({ search }: { search: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight">
          <Clapperboard aria-hidden className="size-6 text-accent" />
          {siteConfig.name}
        </Link>
        <div className="flex flex-1 justify-end md:justify-center">{search}</div>
        <UserSlot />
      </div>
    </header>
  )
}
