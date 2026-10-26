export const siteConfig = {
  name: 'Filmes',
  description: 'Descubra os filmes disponíveis agora nos streamings por assinatura no Brasil.',
  region: 'BR',
  language: 'pt-BR',
} as const

/** Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+, Paramount+, MUBI (IDs de provedor do TMDB). */
export const CURATED_PROVIDER_IDS: readonly number[] = [8, 119, 337, 1899, 307, 350, 531, 11]
