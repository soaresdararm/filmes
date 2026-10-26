/**
 * Único erro que sai da camada de serviço do TMDB.
 * status: HTTP da resposta; 0 = rede/timeout; 502 = resposta fora do schema.
 */
export class TmdbError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'TmdbError'
    this.status = status
  }
}

export function isTmdbError(error: unknown): error is TmdbError {
  return error instanceof TmdbError
}
