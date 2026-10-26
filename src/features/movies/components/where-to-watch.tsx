import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { tmdbImageUrl } from '@/services/tmdb/images'
import type { MovieDetails } from '../types'

export function WhereToWatch({ watch }: { watch: MovieDetails['watch'] }) {
  return (
    <section
      id="onde-assistir"
      aria-labelledby="onde-assistir-titulo"
      className="scroll-mt-28 space-y-4"
    >
      <h2
        id="onde-assistir-titulo"
        className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl"
      >
        Onde assistir
      </h2>
      {watch.providers.length === 0 ? (
        <p className="text-muted">
          Não disponível em streaming por assinatura no Brasil
        </p>
      ) : (
        <>
          <ul className="flex flex-wrap gap-4">
            {watch.providers.map((provider) => {
              const logo = tmdbImageUrl(provider.logoPath, 'w92')
              return (
                <li key={provider.id} className="w-20 text-center">
                  {logo ? (
                    <Image
                      src={logo}
                      alt={provider.name}
                      width={80}
                      height={80}
                      className="size-20 rounded-2xl shadow-lg ring-1 shadow-black/50 ring-white/10"
                    />
                  ) : (
                    <span className="flex size-20 items-center justify-center rounded-2xl bg-surface p-2 text-xs font-semibold">
                      {provider.name}
                    </span>
                  )}
                  {logo && (
                    <span
                      aria-hidden
                      className="mt-2 block text-xs leading-tight text-muted"
                    >
                      {provider.name}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          <p className="text-sm text-muted">
            Incluído na assinatura.{' '}
            {watch.link && (
              <a
                href={watch.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-accent"
              >
                Ver no JustWatch
                <ExternalLink aria-hidden className="size-3.5" />
              </a>
            )}
          </p>
        </>
      )}
    </section>
  )
}
