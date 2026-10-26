// API pública só de servidor: acessa o TMDB com o token.
import 'server-only'

export { discoverMovies } from './api/discover'
export { searchMovies } from './api/search'
export { getMovieDetails } from './api/details'
export { getProviders } from './api/providers'
export { getGenres } from './api/genres'
