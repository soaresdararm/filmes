'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'

/** Parágrafo cortado em poucas linhas, com "Ler mais" só quando o texto realmente não cabe. */
export function ExpandableText({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 1)
  }, [children, expanded])

  return (
    <div className={className}>
      <p ref={ref} className={cn(!expanded && 'line-clamp-3')}>
        {children}
      </p>
      {overflows && (
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className="mt-1 rounded-sm text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {expanded ? 'Ler menos' : 'Ler mais'}
        </button>
      )}
    </div>
  )
}
