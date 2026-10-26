import { cacheLife } from 'next/cache'
import { tmdbFetch } from '@/services/tmdb/client'
import { CURATED_PROVIDER_IDS, siteConfig } from '@/shared/config/site'
import { toProvider } from '../mappers'
import { rawProviderListSchema } from '../schemas/tmdb'
import type { Provider } from '../types'
import { REVALIDATE } from './revalidate'

/** Provedores curados que existem no Brasil, na ordem da lista curada. */
export async function getProviders(): Promise<Provider[]> {
  'use cache'
  cacheLife({ revalidate: REVALIDATE.static })

  const raw = await tmdbFetch('/watch/providers/movie', {
    schema: rawProviderListSchema,
    params: { watch_region: siteConfig.region },
  })
  const byId = new Map(raw.results.map((p) => [p.provider_id, toProvider(p)]))
  return CURATED_PROVIDER_IDS.flatMap((id) => byId.get(id) ?? [])
}
