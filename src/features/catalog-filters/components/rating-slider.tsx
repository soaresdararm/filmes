'use client'

import { useState } from 'react'
import { formatRating } from '@/shared/lib/format'
import { Slider } from '@/shared/ui/slider'

type RatingSliderProps = {
  value: number
  /** Chamado ao soltar o controle, não a cada passo do arraste. */
  onCommit: (rating: number) => void
}

export function RatingSlider({ value, onCommit }: RatingSliderProps) {
  const [current, setCurrent] = useState(value)

  return (
    <div className="flex flex-col justify-center gap-2">
      <span className="text-xs text-muted">
        {current > 0 ? `Nota mín. ${formatRating(current)}` : 'Qualquer nota'}
      </span>
      <Slider
        aria-label="Nota mínima"
        min={0}
        max={10}
        step={0.5}
        value={[current]}
        onValueChange={([next]) => setCurrent(next)}
        onValueCommit={([next]) => onCommit(next)}
      />
    </div>
  )
}
