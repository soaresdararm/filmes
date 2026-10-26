import Image from 'next/image'
import { tmdbImageUrl } from '@/services/tmdb/images'
import { Carousel } from '@/shared/ui/carousel'
import { carouselItemClass } from '@/shared/ui/carousel-items'
import type { CastMember } from '../types'

/** "Pedro Pascal" → "PP" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

export function CastList({ cast }: { cast: CastMember[] }) {
  if (cast.length === 0) return null

  return (
    <div id="elenco" className="scroll-mt-24">
      <Carousel title="Elenco">
        {cast.map((member) => {
          const photo = tmdbImageUrl(member.profilePath, 'w342')
          return (
            <li
              key={`${member.id}-${member.character}`}
              className={carouselItemClass.portrait}
            >
              <a
                href={`https://www.themoviedb.org/person/${member.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group/person block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <div className="relative aspect-2/3 overflow-hidden rounded-md bg-linear-to-br from-surface to-neutral-800 ring-1 ring-white/5 transition duration-300 group-hover/person:ring-white/30">
                  {photo ? (
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="(min-width: 1280px) 14vw, (min-width: 768px) 19vw, 38vw"
                      className="object-cover grayscale-[35%] transition duration-500 group-hover/person:scale-105 group-hover/person:grayscale-0 motion-reduce:transition-none"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="flex h-full items-center justify-center font-display text-5xl tracking-wide text-foreground/30"
                    >
                      {initials(member.name)}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/90 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                    <p className="text-sm leading-tight font-semibold">
                      {member.name}
                    </p>
                    {member.character && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-tight text-foreground/70">
                        {member.character}
                      </p>
                    )}
                    <span className="sr-only">(abre o perfil no TMDB)</span>
                  </div>
                </div>
              </a>
            </li>
          )
        })}
      </Carousel>
    </div>
  )
}
