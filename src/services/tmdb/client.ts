import 'server-only'
import type { z } from 'zod'
import { siteConfig } from '@/shared/config/site'
import { env } from '@/shared/lib/env'
import { TmdbError } from './errors'

export const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TIMEOUT_MS = 8000

export type TmdbParams = Record<string, string | number | null | undefined>

type TmdbFetchOptions<S extends z.ZodType> = {
  schema: S
  /** `undefined` é ignorado; `null` remove um parâmetro padrão (ex.: `language`). */
  params?: TmdbParams
}

/**
 * GET no TMDB com token, idioma/região padrão, timeout e validação da resposta.
 * Não faz cache: quem chama decide com 'use cache' + cacheLife.
 */
export async function tmdbFetch<S extends z.ZodType>(
  path: string,
  { schema, params = {} }: TmdbFetchOptions<S>,
): Promise<z.infer<S>> {
  const url = new URL(`${TMDB_API_BASE}${path}`)
  const merged: TmdbParams = { language: siteConfig.language, region: siteConfig.region, ...params }
  for (const [key, value] of Object.entries(merged)) {
    if (value !== null && value !== undefined) url.searchParams.set(key, String(value))
  }

  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.TMDB_READ_TOKEN}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    const reason = error instanceof Error && error.name === 'TimeoutError' ? 'timeout' : 'falha de rede'
    throw new TmdbError(0, `TMDB indisponível (${reason}) em ${path}`)
  }

  if (!response.ok) {
    if (response.status === 401) {
      console.error('[tmdb] 401: TMDB_READ_TOKEN inválido ou expirado')
    }
    throw new TmdbError(response.status, `TMDB respondeu ${response.status} em ${path}`)
  }

  const parsed = schema.safeParse(await response.json())
  if (!parsed.success) {
    console.error(`[tmdb] resposta fora do schema em ${path}`, parsed.error.issues)
    throw new TmdbError(502, `Resposta inesperada do TMDB em ${path}`)
  }
  return parsed.data
}
