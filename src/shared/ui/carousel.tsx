'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { cn } from '@/shared/lib/cn'

type CarouselProps = {
  title: ReactNode
  /** "Ver tudo" ao lado do título. */
  href?: string
  children: ReactNode
  className?: string
}

type ScrollState = {
  pages: number
  page: number
  atStart: boolean
  atEnd: boolean
}

const INITIAL: ScrollState = { pages: 1, page: 0, atStart: true, atEnd: true }

/**
 * Fileira rolável que sangra até a borda da página (usa `-mx-gutter`).
 * Setas avançam uma "tela" por vez; os traços no canto mostram a página atual.
 * Os filhos devem ser `<li>` com largura fixa.
 */
export function Carousel({ title, href, children, className }: CarouselProps) {
  const id = useId()
  const listRef = useRef<HTMLUListElement>(null)
  const [state, setState] = useState(INITIAL)

  const measure = useCallback(() => {
    const el = listRef.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pages =
      el.clientWidth > 0
        ? Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05))
        : 1
    setState({
      pages,
      page: max > 0 ? Math.round((el.scrollLeft / max) * (pages - 1)) : 0,
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft >= max - 4,
    })
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  }, [measure])

  const step = (direction: 1 | -1) => {
    const el = listRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // avança quase uma tela inteira, deixando o último card visível como referência
    el.scrollBy({
      left: direction * el.clientWidth * 0.9,
      behavior: reduce ? 'auto' : 'smooth',
    })
  }

  const arrowClass =
    'absolute inset-y-4 z-20 hidden w-gutter items-center justify-center bg-background/60 text-foreground opacity-0 transition-opacity duration-200 group-hover/carousel:opacity-100 hover:bg-background/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-foreground disabled:hidden md:flex'

  return (
    <section aria-labelledby={id} className={cn('-mx-gutter', className)}>
      <div className="flex items-end justify-between gap-4 px-gutter">
        <div className="flex items-center gap-4">
          <h2
            id={id}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight sm:text-xl lg:text-2xl"
          >
            {title}
          </h2>
          {href && (
            <Link
              href={href}
              aria-describedby={id}
              className="group/all inline-flex items-center rounded-sm text-sm font-semibold text-muted transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ver tudo
              <ChevronRight
                aria-hidden
                className="size-4 transition-transform group-hover/all:translate-x-0.5"
              />
            </Link>
          )}
        </div>
        {state.pages > 1 && (
          <div aria-hidden className="hidden gap-0.5 pb-1.5 md:flex">
            {Array.from({ length: state.pages }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-0.5 w-3 transition-colors',
                  i === state.page ? 'bg-foreground/90' : 'bg-foreground/25',
                )}
              />
            ))}
          </div>
        )}
      </div>

      <div className="group/carousel relative">
        <button
          type="button"
          aria-label="Anteriores"
          aria-controls={`${id}-list`}
          disabled={state.atStart}
          onClick={() => step(-1)}
          className={cn(arrowClass, 'left-0 rounded-r-md')}
        >
          <ChevronLeft aria-hidden className="size-8 lg:size-10" />
        </button>
        <ul
          id={`${id}-list`}
          ref={listRef}
          className="scrollbar-none flex snap-x snap-mandatory scroll-px-gutter gap-2 overflow-x-auto overflow-y-hidden px-gutter py-4"
        >
          {children}
        </ul>
        <button
          type="button"
          aria-label="Próximos"
          aria-controls={`${id}-list`}
          disabled={state.atEnd}
          onClick={() => step(1)}
          className={cn(arrowClass, 'right-0 rounded-l-md')}
        >
          <ChevronRight aria-hidden className="size-8 lg:size-10" />
        </button>
      </div>
    </section>
  )
}
