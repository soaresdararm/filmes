/** ID de filme vindo da URL: só inteiros positivos, senão null. */
export function parseMovieId(param: string): number | null {
  if (!/^[1-9]\d*$/.test(param)) return null
  const id = Number(param)
  return Number.isSafeInteger(id) ? id : null
}
