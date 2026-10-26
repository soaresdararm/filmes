export type PageRangeItem = number | 'ellipsis'

/**
 * Páginas a exibir na paginação: sempre a primeira, a última e `page ± siblings`.
 * Lacunas de 2+ páginas viram 'ellipsis'; lacuna de 1 página mostra o número.
 */
export function buildPageRange(
  page: number,
  totalPages: number,
  siblings = 1,
): PageRangeItem[] {
  const total = Math.max(1, totalPages)
  const current = Math.min(Math.max(1, page), total)

  // poucas páginas: cabem todas no mesmo espaço que as reticências ocupariam
  if (total <= 2 * siblings + 5)
    return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total])
  for (let p = current - siblings; p <= current + siblings; p++) {
    if (p >= 1 && p <= total) pages.add(p)
  }
  const sorted = [...pages].sort((a, b) => a - b)

  const items: PageRangeItem[] = []
  for (const p of sorted) {
    const previous = items.at(-1)
    if (typeof previous === 'number') {
      const gap = p - previous - 1
      if (gap === 1) items.push(previous + 1)
      else if (gap > 1) items.push('ellipsis')
    }
    items.push(p)
  }
  return items
}
