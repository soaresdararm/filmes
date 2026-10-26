import { describe, expect, it } from 'vitest'
import { tmdbImageUrl } from './images'

describe('tmdbImageUrl', () => {
  it('monta a URL com o tamanho', () => {
    expect(tmdbImageUrl('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg')
  })

  it('sem caminho retorna null', () => {
    expect(tmdbImageUrl(null, 'w342')).toBeNull()
  })
})
