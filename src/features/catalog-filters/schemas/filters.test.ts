import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  parseFilters,
  serializeFilters,
  type Filters,
} from './filters'

const now = new Date('2026-10-26T12:00:00Z')

describe('parseFilters', () => {
  it('sem parâmetros retorna o padrão', () => {
    expect(parseFilters({}, now)).toEqual(DEFAULT_FILTERS)
  })

  it('descarta provedores fora da lista curada, inválidos e duplicados', () => {
    expect(parseFilters({ providers: '8,999,abc,8' }, now).providers).toEqual([
      8,
    ])
  })

  it('limita anos ao intervalo 1900–ano atual', () => {
    expect(
      parseFilters({ yearFrom: '1800', yearTo: '2030' }, now),
    ).toMatchObject({
      yearFrom: 1900,
      yearTo: 2026,
    })
  })

  it('troca anos invertidos', () => {
    expect(
      parseFilters({ yearFrom: '2010', yearTo: '2000' }, now),
    ).toMatchObject({
      yearFrom: 2000,
      yearTo: 2010,
    })
  })

  it('ano inválido é ignorado', () => {
    expect(parseFilters({ yearFrom: 'abc' }, now).yearFrom).toBeUndefined()
  })

  it('limita a nota a 0–10', () => {
    expect(parseFilters({ rating: '15' }, now).rating).toBe(10)
    expect(parseFilters({ rating: '-2' }, now).rating).toBe(0)
    expect(parseFilters({ rating: '7.5' }, now).rating).toBe(7.5)
  })

  it('ordenação desconhecida volta ao padrão', () => {
    expect(parseFilters({ sort: 'hack' }, now).sort).toBe('popularity.desc')
    expect(parseFilters({ sort: 'title.asc' }, now).sort).toBe('title.asc')
  })

  it.each([
    ['abc', 1],
    ['0', 1],
    ['9999', 500],
    ['3', 3],
  ])('page=%s vira %i', (page, expected) => {
    expect(parseFilters({ page }, now).page).toBe(expected)
  })

  it('valor em array usa o primeiro', () => {
    expect(parseFilters({ page: ['2', '5'] }, now).page).toBe(2)
  })

  it('gênero não numérico é ignorado', () => {
    expect(parseFilters({ genre: 'acao' }, now).genre).toBeUndefined()
    expect(parseFilters({ genre: '28' }, now).genre).toBe(28)
  })
})

describe('serializeFilters', () => {
  it('omite valores padrão', () => {
    expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe('')
  })

  it('ida e volta preserva os filtros', () => {
    const filters: Filters = {
      providers: [8, 119],
      genre: 28,
      yearFrom: 2000,
      yearTo: 2010,
      rating: 7,
      sort: 'vote_average.desc',
      page: 2,
    }
    const params = serializeFilters(filters)
    expect(params.get('providers')).toBe('8,119')
    expect(parseFilters(Object.fromEntries(params), now)).toEqual(filters)
  })
})
