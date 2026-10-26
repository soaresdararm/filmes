import { User } from 'lucide-react'
import Image from 'next/image'
import { tmdbImageUrl } from '@/services/tmdb/images'
import type { CastMember } from '../types'

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null

  return (
    <section aria-labelledby="elenco" className="space-y-3">
      <h2 id="elenco" className="text-xl font-semibold">
        Elenco
      </h2>
      <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
        {cast.map((member) => {
          const photo = tmdbImageUrl(member.profilePath, 'w185')
          return (
            <li
              key={`${member.id}-${member.character}`}
              className="w-28 shrink-0 snap-start"
            >
              <div className="relative aspect-2/3 overflow-hidden rounded-lg bg-surface">
                {photo ? (
                  <Image
                    src={photo}
                    alt={member.name}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted">
                    <User aria-hidden className="size-8" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm leading-tight font-medium">
                {member.name}
              </p>
              {member.character && (
                <p className="text-xs leading-tight text-muted">
                  {member.character}
                </p>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
