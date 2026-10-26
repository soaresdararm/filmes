import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { tmdbImageUrl } from '@/services/tmdb/images'
import type { MovieDetails } from '../types'

export function WhereToWatch({ watch }: { watch: MovieDetails['watch'] }) {
  return (
    <section aria-labelledby="onde-assistir" className="space-y-3">
      <h2 id="onde-assistir" className="text-xl font-semibold">
        Onde assistir
      </h2>
      {watch.providers.length === 0 ? (
        <p className="text-muted">
          Não disponível em streaming por assinatura no Brasil
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <ul className="flex flex-wrap gap-3">
            {watch.providers.map((provider) => {
              const logo = tmdbImageUrl(provider.logoPath, 'w92')
              return (
                <li key={provider.id} title={provider.name}>
                  {logo ? (
                    <Image
                      src={logo}
                      alt={provider.name}
                      width={48}
                      height={48}
                      className="size-12 rounded-xl ring-1 ring-white/10"
                    />
                  ) : (
                    <span className="flex h-12 items-center rounded-xl bg-surface px-3 text-sm">
                      {provider.name}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          {watch.link && (
            <a
              href={watch.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Ver no JustWatch
              <ExternalLink aria-hidden className="size-3.5" />
            </a>
          )}
        </div>
      )}
    </section>
  )
}
