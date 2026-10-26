/** Tempo de revalidação do cache (segundos) por tipo de dado. */
export const REVALIDATE = {
  list: 21600, // discover e detalhes: 6h
  search: 3600, // busca: 1h
  static: 86400, // provedores e gêneros: 24h
} as const
