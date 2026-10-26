import { describe, expect, it } from 'vitest'
import { buildPageRange } from './page-range'

describe('buildPageRange', () => {
  it('uma página só', () => {
    expect(buildPageRange(1, 1)).toEqual([1])
  })

  it('poucas páginas mostra todas', () => {
    expect(buildPageRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('no meio usa reticências dos dois lados', () => {
    expect(buildPageRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
  })

  it('perto do início mostra número em vez de reticência de 1 página', () => {
    expect(buildPageRange(2, 20)).toEqual([1, 2, 3, 'ellipsis', 20])
    expect(buildPageRange(4, 20)).toEqual([1, 2, 3, 4, 5, 'ellipsis', 20])
  })

  it('página além do total é limitada', () => {
    expect(buildPageRange(400, 3)).toEqual([1, 2, 3])
  })
})
