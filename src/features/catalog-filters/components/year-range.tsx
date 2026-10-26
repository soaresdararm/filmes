'use client'

import type { UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'

export type YearFormValues = { yearFrom: string; yearTo: string }

type YearRangeProps = {
  form: UseFormReturn<YearFormValues>
  /** Valida e aplica os anos; chamado ao sair de um campo. */
  onCommit: () => void
}

const inputClass =
  'h-10 w-full rounded-md border border-white/15 bg-surface px-3 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-accent aria-invalid:border-accent'

export function YearRange({ form, onCommit }: YearRangeProps) {
  const { errors } = form.formState
  const error = errors.yearFrom?.message ?? errors.yearTo?.message

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input
          {...form.register('yearFrom', { onBlur: onCommit })}
          inputMode="numeric"
          placeholder="De"
          aria-label="Ano inicial"
          aria-invalid={Boolean(errors.yearFrom)}
          className={cn(inputClass)}
        />
        <span aria-hidden className="text-muted">
          –
        </span>
        <input
          {...form.register('yearTo', { onBlur: onCommit })}
          inputMode="numeric"
          placeholder="Até"
          aria-label="Ano final"
          aria-invalid={Boolean(errors.yearTo)}
          className={cn(inputClass)}
        />
      </div>
      {error && (
        <p role="alert" className="text-xs text-accent">
          {error}
        </p>
      )}
    </div>
  )
}
