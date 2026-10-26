export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

export type ImageSize = 'w92' | 'w185' | 'w342' | 'w780' | 'w1280' | 'original'

export function tmdbImageUrl(path: string | null, size: ImageSize): string | null {
  return path ? `${TMDB_IMAGE_BASE}${size}${path}` : null
}
