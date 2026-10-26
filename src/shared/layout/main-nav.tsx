'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { exploreLinks } from '@/shared/config/site'
import { cn } from '@/shared/lib/cn'

const items = [
  { label: 'Início', href: '/' },
  { label: 'Explorar', href: exploreLinks.all },
  { label: 'Lançamentos', href: exploreLinks.releases },
  { label: 'Mais bem avaliados', href: exploreLinks.topRated },
]

/** `inline` fica na linha do logo (desktop); `chips` vira uma segunda linha rolável (mobile). */
export function MainNav({ variant }: { variant: 'inline' | 'chips' }) {
  const pathname = usePathname()
  const query = useSearchParams().toString()
  const current = query ? `${pathname}?${query}` : pathname
  // um atalho com filtros só fica ativo na URL exata; senão, "Explorar" cobre a rota
  const active =
    items.find((item) => item.href === current)?.href ??
    (pathname.startsWith(exploreLinks.all) ? exploreLinks.all : null)

  return (
    <nav
      aria-label="Principal"
      className={variant === 'inline' ? 'hidden lg:block' : 'lg:hidden'}
    >
      <ul
        className={cn(
          'flex items-center text-sm',
          variant === 'inline'
            ? 'gap-5'
            : 'scrollbar-none gap-2 overflow-x-auto px-gutter pb-3',
        )}
      >
        {items.map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={item.href === active ? 'page' : undefined}
              className={cn(
                'block transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                variant === 'inline'
                  ? 'rounded-sm text-foreground/75 hover:text-foreground/50 aria-[current=page]:font-semibold aria-[current=page]:text-foreground'
                  : 'rounded-full border border-foreground/40 px-3.5 py-1 text-foreground/90 aria-[current=page]:border-foreground aria-[current=page]:bg-foreground aria-[current=page]:text-background',
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
