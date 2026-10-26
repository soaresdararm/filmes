'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { useDebounce } from '@/shared/hooks/useDebounce'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/button'

const DEBOUNCE_MS = 400

const searchSchema = z.object({
  q: z.string().trim().min(2, 'Digite ao menos 2 caracteres'),
})

type SearchValues = z.input<typeof searchSchema>

const searchHref = (query: string) => `/search?q=${encodeURIComponent(query)}`

export function SearchBar() {
  const router = useRouter()
  const currentQuery = useSearchParams().get('q') ?? ''
  // última busca enviada (ou vinda da URL): evita navegar de novo para a mesma busca
  const lastQuery = useRef(currentQuery)
  const [expanded, setExpanded] = useState(false)

  const form = useForm<SearchValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: { q: currentQuery },
  })
  const value = useWatch({ control: form.control, name: 'q' })
  const debounced = useDebounce(value, DEBOUNCE_MS)

  // a URL mudou por fora (ex.: voltar ao início): o campo acompanha
  useEffect(() => {
    if (currentQuery === lastQuery.current) return
    lastQuery.current = currentQuery
    form.reset({ q: currentQuery })
  }, [currentQuery, form])

  useEffect(() => {
    const query = debounced.trim()
    if (query.length < 2 || query === lastQuery.current) return
    lastQuery.current = query
    router.push(searchHref(query))
  }, [debounced, router])

  useEffect(() => {
    if (expanded) form.setFocus('q')
  }, [expanded, form])

  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    form.handleSubmit(({ q }) => {
      lastQuery.current = q
      router.push(searchHref(q))
    })(event)

  const error = form.formState.errors.q?.message

  return (
    <>
      <form
        role="search"
        onSubmit={onSubmit}
        className={cn(
          'relative w-full max-w-md',
          !expanded && 'hidden md:block',
        )}
      >
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
        />
        <input
          {...form.register('q', {
            onBlur: (event) => {
              if (!event.target.value.trim()) setExpanded(false)
            },
          })}
          type="search"
          aria-label="Buscar filmes"
          aria-invalid={Boolean(error)}
          placeholder="Buscar filmes..."
          autoComplete="off"
          className="h-10 w-full rounded-full border border-white/10 bg-surface pr-4 pl-9 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent"
        />
        {error && (
          <p
            role="alert"
            className="absolute top-full left-4 mt-1 rounded bg-surface px-2 py-1 text-xs text-accent"
          >
            {error}
          </p>
        )}
      </form>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Abrir busca"
        className={cn('md:hidden', expanded && 'hidden')}
        onClick={() => setExpanded(true)}
      >
        <Search aria-hidden className="size-5" />
      </Button>
    </>
  )
}
