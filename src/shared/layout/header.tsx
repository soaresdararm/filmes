import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'
import { siteConfig } from '@/shared/config/site'
import { HeaderShell } from './header-shell'
import { MainNav } from './main-nav'
import { UserSlot } from './user-slot'

/** `search` é injetado pelo app/layout para que shared/ não dependa de features/. */
export function Header({ search }: { search: ReactNode }) {
  return (
    <HeaderShell>
      <div className="flex h-16 items-center gap-8 px-gutter lg:h-[4.5rem]">
        <Link
          href="/"
          className="shrink-0 rounded-sm font-display text-3xl leading-none tracking-wide text-accent uppercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent lg:text-4xl"
        >
          {siteConfig.name}
        </Link>
        {/* MainNav lê a URL para marcar o item ativo */}
        <Suspense fallback={null}>
          <MainNav variant="inline" />
        </Suspense>
        <div className="flex flex-1 justify-end">{search}</div>
        <UserSlot />
      </div>
      <Suspense fallback={<div className="h-10 lg:hidden" />}>
        <MainNav variant="chips" />
      </Suspense>
    </HeaderShell>
  )
}
