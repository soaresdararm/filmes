import { describe, expect, it } from 'vitest'
import { parseEnv } from './env'

describe('parseEnv', () => {
  it('retorna o token quando presente', () => {
    expect(parseEnv({ TMDB_READ_TOKEN: 'abc' })).toEqual({ TMDB_READ_TOKEN: 'abc' })
  })

  it('lança erro claro quando falta o token', () => {
    expect(() => parseEnv({})).toThrow(/TMDB_READ_TOKEN/)
  })
})
