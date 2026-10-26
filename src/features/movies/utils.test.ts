import { describe, expect, it } from 'vitest'
import { parseMovieId } from './utils'

describe('parseMovieId', () => {
  it('aceita inteiro positivo', () => {
    expect(parseMovieId('550')).toBe(550)
  })

  it.each(['abc', '0', '-3', '1.5', '', '12abc', ' 5'])(
    'rejeita %j',
    (value) => {
      expect(parseMovieId(value)).toBeNull()
    },
  )
})
