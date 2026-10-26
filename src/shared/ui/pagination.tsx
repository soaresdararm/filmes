import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'
import { buttonVariants } from './button'
import { buildPageRange } from './page-range'

type PaginationProps = {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

const itemClass = buttonVariants({ variant: 'ghost', size: 'sm' })

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null
  const current = Math.min(Math.max(1, page), totalPages)

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      {current > 1 ? (
        <Link href={hrefFor(current - 1)} className={itemClass}>
          <ChevronLeft className="size-4" /> Anterior
        </Link>
      ) : (
        <span aria-disabled className={cn(itemClass, 'opacity-40')}>
          <ChevronLeft className="size-4" /> Anterior
        </span>
      )}

      {buildPageRange(current, totalPages).map((item, index) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted">
            …
          </span>
        ) : item === current ? (
          <span
            key={item}
            aria-current="page"
            className={cn(itemClass, 'bg-accent text-white')}
          >
            {item}
          </span>
        ) : (
          <Link key={item} href={hrefFor(item)} className={itemClass}>
            {item}
          </Link>
        ),
      )}

      {current < totalPages ? (
        <Link href={hrefFor(current + 1)} className={itemClass}>
          Próxima <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span aria-disabled className={cn(itemClass, 'opacity-40')}>
          Próxima <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
