const ratingFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const countFormat = new Intl.NumberFormat('pt-BR')

/** 7.5 → "7,5" */
export function formatRating(value: number): string {
  return ratingFormat.format(value)
}

/** 12340 → "12.340" */
export function formatCount(value: number): string {
  return countFormat.format(value)
}
