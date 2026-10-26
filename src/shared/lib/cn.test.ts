import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('mescla classes e resolve conflitos do tailwind', () => {
    expect(cn('px-2', false && 'hidden', 'px-4')).toBe('px-4')
  })
})
