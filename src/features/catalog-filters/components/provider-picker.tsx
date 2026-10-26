'use client'

import Image from 'next/image'
import type { Provider } from '@/features/movies'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { Button } from '@/shared/ui/button'

type ProviderPickerProps = {
  providers: Provider[]
  value: number[]
  onChange: (ids: number[]) => void
}

export function ProviderPicker({ providers, value, onChange }: ProviderPickerProps) {
  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div
      role="group"
      aria-label="Streamings"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]"
    >
      {providers.map((provider) => {
        const logo = tmdbImageUrl(provider.logoPath, 'w92')
        return (
          <Button
            key={provider.id}
            type="button"
            variant="chip"
            size="sm"
            aria-pressed={value.includes(provider.id)}
            onClick={() => toggle(provider.id)}
            className="h-10 shrink-0 pl-1.5"
          >
            {logo && (
              <Image src={logo} alt="" width={28} height={28} className="size-7 rounded-full" />
            )}
            {provider.name}
          </Button>
        )
      })}
    </div>
  )
}
