'use client'

import { SORT_OPTIONS, type SortOption } from '@/features/movies'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

const SORT_LABELS: Record<SortOption, string> = {
  'popularity.desc': 'Mais populares',
  'primary_release_date.desc': 'Lançamentos recentes',
  'vote_average.desc': 'Mais bem avaliados',
  'title.asc': 'Título (A–Z)',
}

type SortSelectProps = {
  value: SortOption
  onChange: (sort: SortOption) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortOption)}>
      <SelectTrigger aria-label="Ordenar por">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {SORT_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
