'use client'

import type { Genre } from '@/features/movies'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

const ALL = 'all'

type GenreSelectProps = {
  genres: Genre[]
  value: number | undefined
  onChange: (genre: number | undefined) => void
}

export function GenreSelect({ genres, value, onChange }: GenreSelectProps) {
  return (
    <Select
      value={value === undefined ? ALL : String(value)}
      onValueChange={(next) =>
        onChange(next === ALL ? undefined : Number(next))
      }
    >
      <SelectTrigger aria-label="Gênero">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>Todos os gêneros</SelectItem>
        {genres.map((genre) => (
          <SelectItem key={genre.id} value={String(genre.id)}>
            {genre.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
