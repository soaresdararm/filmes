# Catálogo de Filmes em Streaming — Plano de Implementação

> **Para agentes:** SUB-SKILL OBRIGATÓRIA: use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar este plano tarefa por tarefa. Os passos usam checkbox (`- [ ]`) para acompanhamento.

**Objetivo:** app Next.js que lista os filmes disponíveis por assinatura nos streamings do Brasil (via TMDB), com filtros, busca e página de detalhes, sobre uma base por features reaproveitável.

**Arquitetura:** Server Components buscam os dados do TMDB no servidor (com cache `revalidate`). Filtros, busca e página vivem na URL e são validados com zod. O Zustand guarda só estado de cliente (UI e o futuro usuário). O código é organizado em `app/` (rotas finas) → `features/` → `shared/ | services/ | store/`.

**Stack:** Next.js (App Router, versão `latest` estável) + TypeScript strict, Tailwind CSS v4, Radix UI, CVA, clsx, tailwind-merge, Zustand, react-hook-form, zod, @hookform/resolvers, Vitest, Testing Library, MSW, ESLint, Prettier, Husky, lint-staged.

**Spec:** `docs/superpowers/specs/2026-10-26-catalogo-filmes-streaming-design.md`. Leia junto com este plano; em caso de conflito, a spec vence.

## Restrições globais

- Região `BR`, idioma `pt-BR`, monetização `flatrate`, sempre.
- `TMDB_READ_TOKEN` só no servidor: `shared/lib/env.ts` e `services/tmdb/client.ts` começam com `import 'server-only'`.
- Base da API: `https://api.themoviedb.org/3`. Base de imagens: `https://image.tmdb.org/t/p/`.
- Timeout de 8000 ms por chamada ao TMDB.
- `revalidate`: discover e detalhes 21600 s (6h), busca 3600 s (1h), provedores e gêneros 86400 s (24h).
- Página máxima: 500. `vote_count.gte=50` sempre que a nota mínima for > 0.
- Toda a interface em pt-BR. Números com `Intl.NumberFormat('pt-BR')`.
- Dependência em direção única: `app → features → shared | services | store`. Importar outra feature só pelo `index.ts` dela. `shared/` não importa `features/`, `services/` nem `store/` (exceção: `shared/hooks/useUserInfo.ts` → `store/user-store.ts`).
- Testes colocados ao lado do código (`*.test.ts(x)`). TDD: o teste falha antes da implementação.
- Commits pequenos, em português, no formato `tipo: descrição`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Trabalhar numa branch `feat/catalogo-v1` (não commitar direto na `master`).

## Foco de revisão

1. **Filme sem imagem, sinopse ou nota** (comum em títulos obscuros): o card e o hero mostram placeholders e nada quebra. Testes nas Tarefas 7 e 11.
2. **`/movie/abc` ou um ID inexistente:** deve exibir o "Filme não encontrado", nunca um erro 500. Coberto por `parseMovieId` (Tarefa 5) e pelo tratamento de 404 (Tarefa 11).
3. **Busca com acentos e símbolos** (`ação & aventura`): a query chega intacta ao TMDB e a URL `/search?q=` é codificada. Testes nas Tarefas 5 e 10.
4. **Página além do total** (`?page=400` com 3 páginas de resultado): mostra o estado vazio com link para a página 1, e a paginação nunca gera links para páginas inexistentes. Testes nas Tarefas 2 e 9.
5. **Provedor da lista curada ausente na resposta BR** (ID obsoleto/renomeado): é simplesmente omitido, sem erro. Teste na Tarefa 5.

---

## Mapa de arquivos

```
.env.example, .prettierrc, eslint.config.mjs, next.config.ts, vitest.config.ts, vitest.setup.ts
.husky/pre-commit, .github/workflows/ci.yml, README.md
public/tmdb-logo.svg
src/app/layout.tsx, globals.css, error.tsx, not-found.tsx
src/app/(catalog)/page.tsx, loading.tsx, search/page.tsx, movie/[id]/page.tsx, movie/[id]/not-found.tsx
src/app/(auth)/.gitkeep
src/shared/lib/{cn,env}.ts
src/shared/config/site.ts
src/shared/hooks/{useUserInfo,useDebounce,useMediaQuery}.ts
src/shared/ui/{button,badge,skeleton,select,slider,dialog,pagination}.tsx
src/shared/ui/page-range.ts
src/shared/layout/{header,footer,user-slot}.tsx
src/store/{user-store,ui-store}.ts
src/services/tmdb/{client,errors,images}.ts
src/features/movies/{index,types}.ts
src/features/movies/schemas/tmdb.ts
src/features/movies/mappers.ts
src/features/movies/utils.ts
src/features/movies/api/{revalidate,discover,search,details,providers,genres}.ts
src/features/movies/components/{movie-card,movie-grid,movie-grid-skeleton,empty-state,movie-hero,where-to-watch,trailer,cast-list}.tsx
src/features/catalog-filters/{index}.ts
src/features/catalog-filters/schemas/filters.ts
src/features/catalog-filters/hooks/useFiltersUrl.ts
src/features/catalog-filters/components/{filters-form,provider-picker,genre-select,year-range,rating-slider,sort-select,filters-drawer}.tsx
src/features/search/index.ts
src/features/search/components/search-bar.tsx
src/test/msw/server.ts
src/test/empty.ts
```

Nota: `shared/layout/` (header/footer) é composição genérica de layout. O `Header` recebe a `SearchBar` como `children`/prop a partir do `app/layout.tsx`, para não importar `features/`.

---

### Tarefa 1: Scaffold, ferramentas e utilitários base

**Arquivos:**
- Criar: projeto Next.js na raiz, `vitest.config.ts`, `vitest.setup.ts`, `.prettierrc`, `.env.example`, `src/test/empty.ts`, `src/test/msw/server.ts`, `src/shared/lib/cn.ts`, `src/shared/lib/env.ts`, `src/shared/config/site.ts`
- Modificar: `eslint.config.mjs`, `tsconfig.json`, `.gitignore`, `README.md`
- Testar: `src/shared/lib/cn.test.ts`, `src/shared/lib/env.test.ts`

**Interfaces:**
- Produz:
  - `cn(...inputs: ClassValue[]): string`
  - `parseEnv(source: Record<string, string | undefined>): { TMDB_READ_TOKEN: string }`; `env` (resultado de `parseEnv(process.env)`)
  - `siteConfig: { name: 'Filmes'; description: string; region: 'BR'; language: 'pt-BR' }`
  - `CURATED_PROVIDER_IDS: readonly number[]` = `[8, 119, 337, 1899, 307, 350, 531, 11]` (Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+, Paramount+, MUBI)
  - `server` (MSW `setupServer()`), iniciado/resetado/fechado no `vitest.setup.ts`

- [ ] **Passo 1: Branch e scaffold.** `git checkout -b feat/catalogo-v1`. A raiz não está vazia (README, docs, .claude), então gere o projeto numa pasta temporária fora do repositório: `npx create-next-app@latest ../filmes-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack`. Copie tudo, exceto `.git` e `README.md`, para a raiz e apague `../filmes-tmp`. Se o `.gitignore` gerado não incluir `.env*.local`, adicione.

- [ ] **Passo 2: Dependências.**
  ```bash
  npm i zustand react-hook-form zod @hookform/resolvers class-variance-authority clsx tailwind-merge server-only @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-dialog lucide-react
  npm i -D vitest @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom msw prettier prettier-plugin-tailwindcss
  ```

- [ ] **Passo 3: Configuração de testes.**
  - `vitest.config.ts`: plugins `react()` e `tsconfigPaths()`, `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`, `env: { TMDB_READ_TOKEN: 'test-token' }` e `alias: { 'server-only': './src/test/empty.ts' }` (o pacote lança erro fora do bundle de servidor).
  - `vitest.setup.ts`: importa `@testing-library/jest-dom/vitest` e faz `beforeAll(server.listen({ onUnhandledRequest: 'error' }))`, `afterEach(server.resetHandlers())`, `afterAll(server.close())`.
  - Scripts no `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"typecheck": "tsc --noEmit"`, `"format": "prettier --write ."`.
  - `.prettierrc`: `{ "plugins": ["prettier-plugin-tailwindcss"], "singleQuote": true, "semi": false }`.

- [ ] **Passo 4: Aliases e regra de fronteiras.**
  - Em `tsconfig.json`, mantenha `"@/*": ["./src/*"]` e confirme `"strict": true`.
  - Em `eslint.config.mjs`, adicione `no-restricted-imports` com dois blocos:
    1. Global: proíbe o padrão `@/features/*/*` (mensagem: "Importe a feature pelo index: @/features/<nome>").
    2. `files: ['src/shared/**']`: proíbe `@/features/*`, `@/services/*` e `@/store/*`, exceto em `src/shared/hooks/useUserInfo.ts` (via `ignores`).

- [ ] **Passo 5: Escrever os testes que falham.**
  ```ts
  // cn.test.ts
  it('mescla classes e resolve conflitos do tailwind', () => {
    expect(cn('px-2', false && 'hidden', 'px-4')).toBe('px-4')
  })
  // env.test.ts
  it('retorna o token quando presente', () => {
    expect(parseEnv({ TMDB_READ_TOKEN: 'abc' })).toEqual({ TMDB_READ_TOKEN: 'abc' })
  })
  it('lança erro claro quando falta o token', () => {
    expect(() => parseEnv({})).toThrow(/TMDB_READ_TOKEN/)
  })
  ```

- [ ] **Passo 6: Rodar `npm test`.** Esperado: FALHA (módulos inexistentes).

- [ ] **Passo 7: Implementar** `cn` (clsx + twMerge), `parseEnv` (zod: `z.object({ TMDB_READ_TOKEN: z.string().min(1, 'TMDB_READ_TOKEN ausente: copie .env.example para .env.local') })`; ao falhar, lança `Error` com a mensagem), `env`, `siteConfig` e `CURATED_PROVIDER_IDS`. Crie também o `.env.example` com `TMDB_READ_TOKEN=`.

- [ ] **Passo 8: Verificar.** `npm test` deve passar; `npm run lint`, `npm run typecheck` e `npm run build` devem terminar sem erros.

- [ ] **Passo 9: Commit.** `git add -A && git commit -m "chore: scaffold Next.js com ferramentas de teste, lint e utilitários base"`

---

### Tarefa 2: Design system (`shared/ui`) e tema

**Arquivos:**
- Criar: `src/shared/ui/{button,badge,skeleton,select,slider,dialog,pagination}.tsx`, `src/shared/ui/page-range.ts`
- Modificar: `src/app/globals.css`
- Testar: `src/shared/ui/button.test.tsx`, `src/shared/ui/page-range.test.ts`, `src/shared/ui/pagination.test.tsx`

**Interfaces:**
- Consome: `cn`
- Produz:
  - `Button` com `buttonVariants` (CVA): `variant: 'default' | 'outline' | 'ghost' | 'chip'`, `size: 'sm' | 'md' | 'icon'`, prop `asChild?: boolean` (via `@radix-ui/react-slot`; instale-o)
  - `Badge` com `variant: 'default' | 'rating'`
  - `Skeleton({ className })`
  - `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` (Radix, estilo shadcn)
  - `Slider` (Radix, repassa as props)
  - `Dialog`, `DialogTrigger`, `DialogContent`, `DialogTitle`, `DialogClose` (Radix)
  - `buildPageRange(page: number, totalPages: number, siblings = 1): Array<number | 'ellipsis'>`
  - `Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string })`: sem `'use client'`, usa `next/link`, `<nav aria-label="Paginação">`, a página atual com `aria-current="page"`, e "Anterior"/"Próxima" desabilitados nas pontas. Não renderiza nada quando `totalPages <= 1`.

- [ ] **Passo 1: Testes que falham.**
  ```ts
  // page-range.test.ts
  expect(buildPageRange(1, 1)).toEqual([1])
  expect(buildPageRange(1, 5)).toEqual([1, 2, 3, 4, 5])
  expect(buildPageRange(10, 20)).toEqual([1, 'ellipsis', 9, 10, 11, 'ellipsis', 20])
  expect(buildPageRange(2, 20)).toEqual([1, 2, 3, 'ellipsis', 20])
  expect(buildPageRange(400, 3)).toEqual([1, 2, 3]) // página além do total: limita
  // pagination.test.tsx
  it('marca a página atual e gera hrefs', ...) // getByRole('link', { name: '2' }) tem href hrefFor(2); a página 1 tem aria-current="page"
  it('não renderiza com uma página só', ...) // container vazio
  // button.test.tsx
  it('aplica a variante chip e aria-pressed', ...) // <Button variant="chip" aria-pressed> tem classe de borda arredondada
  ```

- [ ] **Passo 2: Rodar `npm test -- src/shared/ui`.** Esperado: FALHA.

- [ ] **Passo 3: Implementar os componentes.** Regra do `buildPageRange`: limita `page` a `[1, totalPages]`; mostra sempre a primeira e a última página e `page ± siblings`; usa `'ellipsis'` para lacunas de 2 ou mais páginas e mostra o número quando a lacuna é de 1 página só.

- [ ] **Passo 4: Tema.** Em `globals.css` (Tailwind v4), use `@theme` com `--color-background: #0b0b0f`, `--color-surface: #16161d`, `--color-muted: #9ca3af`, `--color-foreground: #f5f5f7`, `--color-accent: #e11d48`. O `body` usa `bg-background text-foreground`.

- [ ] **Passo 5: Rodar `npm test -- src/shared/ui`.** Esperado: PASSA.

- [ ] **Passo 6: Commit.** `feat: design system base com Radix, CVA e paginação`

---

### Tarefa 3: Stores de cliente e hooks compartilhados

**Arquivos:**
- Criar: `src/store/user-store.ts`, `src/store/ui-store.ts`, `src/shared/hooks/{useUserInfo,useDebounce,useMediaQuery}.ts`
- Testar: `src/shared/hooks/useUserInfo.test.ts`, `src/shared/hooks/useDebounce.test.ts`, `src/store/ui-store.test.ts`

**Interfaces:**
- Produz:
  - `type User = { id: string; name: string; email: string; avatarUrl: string | null }`
  - `useUserStore`: estado `{ user: User | null; setUser(user: User | null): void }`, inicial `null`
  - `useUiStore`: estado `{ filtersDrawerOpen: boolean; setFiltersDrawerOpen(open: boolean): void }`
  - `useUserInfo(): { user: User | null; isAuthenticated: boolean }`
  - `useDebounce<T>(value: T, delayMs: number): T`
  - `useMediaQuery(query: string): boolean` (retorna `false` no SSR e no primeiro render)

- [ ] **Passo 1: Testes que falham.**
  ```ts
  it('useUserInfo começa sem usuário', () => {
    const { result } = renderHook(() => useUserInfo())
    expect(result.current).toEqual({ user: null, isAuthenticated: false })
  })
  it('useUserInfo reflete setUser', () => { /* act(() => useUserStore.getState().setUser(u)); isAuthenticated === true */ })
  it('useDebounce só atualiza após o atraso', () => { /* vi.useFakeTimers; rerender com 'b'; ainda 'a'; advanceTimersByTime(400); 'b' */ })
  it('ui-store alterna o drawer', () => { /* setFiltersDrawerOpen(true) → filtersDrawerOpen true */ })
  ```
  Em `afterEach`, resete os stores com `useUserStore.setState({ user: null })`.

- [ ] **Passo 2: Rodar `npm test -- src/store src/shared/hooks`.** Esperado: FALHA.
- [ ] **Passo 3: Implementar** com o `create` do zustand. Os arquivos que usam hooks levam `'use client'`.
- [ ] **Passo 4: Rodar de novo.** Esperado: PASSA.
- [ ] **Passo 5: Commit.** `feat: stores Zustand e hooks compartilhados com encaixe para auth`

---

### Tarefa 4: Serviço TMDB (cliente, erros, imagens)

**Arquivos:**
- Criar: `src/services/tmdb/{client,errors,images}.ts`
- Testar: `src/services/tmdb/client.test.ts`, `src/services/tmdb/images.test.ts`

**Interfaces:**
- Consome: `env`, `siteConfig`
- Produz:
  - `class TmdbError extends Error { status: number }`. Convenção: `0` = rede/timeout, `502` = resposta fora do schema; os demais repetem o HTTP.
  - `tmdbFetch<S extends z.ZodTypeAny>(path: string, opts: { schema: S; revalidate: number; params?: Record<string, string | number | null | undefined> }): Promise<z.infer<S>>`. Injeta `language=pt-BR` e `region=BR`. Um param `undefined` é ignorado; um param `null` **remove** um padrão (ex.: `{ language: null }`). Envia o header `Authorization: Bearer ${env.TMDB_READ_TOKEN}`, `next: { revalidate }` e `signal: AbortSignal.timeout(8000)`.
  - `type ImageSize = 'w92' | 'w185' | 'w342' | 'w780' | 'w1280' | 'original'`
  - `tmdbImageUrl(path: string | null, size: ImageSize): string | null`
  - `TMDB_API_BASE = 'https://api.themoviedb.org/3'`

- [ ] **Passo 1: Testes que falham** (MSW, `server.use(http.get(`${TMDB_API_BASE}/x`, ...))`):
  ```ts
  it('envia token, language e region', ...) // o handler captura request; espera header Authorization 'Bearer test-token', searchParams language=pt-BR, region=BR
  it('param null remove o padrão', ...)     // params { language: null } → searchParams.has('language') === false
  it('valida com o schema e retorna os dados', ...)
  it('404 vira TmdbError status 404', ...)  // await expect(...).rejects.toMatchObject({ name: 'TmdbError', status: 404 })
  it('401 vira TmdbError 401 e loga erro de configuração', ...) // console.error chamado com /token/i
  it('500 vira TmdbError status 500', ...)
  it('resposta fora do schema vira TmdbError 502', ...) // e chama console.error (vi.spyOn)
  it('falha de rede vira TmdbError 0', ...) // HttpResponse.error()
  // images.test.ts
  expect(tmdbImageUrl('/a.jpg', 'w342')).toBe('https://image.tmdb.org/t/p/w342/a.jpg')
  expect(tmdbImageUrl(null, 'w342')).toBeNull()
  ```
- [ ] **Passo 2: Rodar `npm test -- src/services`.** Esperado: FALHA.
- [ ] **Passo 3: Implementar.** No `TmdbError`, defina `this.name = 'TmdbError'`.
- [ ] **Passo 4: Rodar de novo.** Esperado: PASSA.
- [ ] **Passo 5: Commit.** `feat: cliente TMDB com timeout, validação e erros tipados`

---

### Tarefa 5: Feature `movies`: tipos, schemas, mapeadores e API

**Arquivos:**
- Criar: `src/features/movies/{types,mappers,utils,index}.ts`, `src/features/movies/schemas/tmdb.ts`, `src/features/movies/api/{revalidate,discover,search,details,providers,genres}.ts`
- Testar: `src/features/movies/mappers.test.ts`, `src/features/movies/utils.test.ts`, `src/features/movies/api/*.test.ts`

**Interfaces:**
- Consome: `tmdbFetch`, `TmdbError`, `CURATED_PROVIDER_IDS`
- Produz (exportado pelo `index.ts`):
  ```ts
  type Movie = { id: number; title: string; posterPath: string | null; releaseYear: number | null; rating: number | null }
  type Genre = { id: number; name: string }
  type Provider = { id: number; name: string; logoPath: string | null }
  type CastMember = { id: number; name: string; character: string; profilePath: string | null }
  type MovieDetails = Movie & {
    originalTitle: string; overview: string | null; backdropPath: string | null; runtime: number | null
    genres: Genre[]; cast: CastMember[]; trailerKey: string | null
    watch: { link: string | null; providers: Provider[] }
  }
  type Paginated<T> = { results: T[]; page: number; totalPages: number; totalResults: number }
  const SORT_OPTIONS = ['popularity.desc', 'primary_release_date.desc', 'vote_average.desc', 'title.asc'] as const
  type SortOption = (typeof SORT_OPTIONS)[number]
  type DiscoverParams = { providers: number[]; genre?: number; yearFrom?: number; yearTo?: number; rating: number; sort: SortOption; page: number }
  const MAX_PAGE = 500
  discoverMovies(p: DiscoverParams): Promise<Paginated<Movie>>
  searchMovies(query: string, page: number): Promise<Paginated<Movie>>
  getMovieDetails(id: number): Promise<MovieDetails>   // propaga TmdbError (404 incluso)
  getProviders(): Promise<Provider[]>                 // só os curados, na ordem de CURATED_PROVIDER_IDS
  getGenres(): Promise<Genre[]>
  parseMovieId(param: string): number | null          // inteiro positivo, senão null
  ```
  Também exporta os componentes da Tarefa 7 e da Tarefa 11 quando existirem.

**Regras dos mapeadores:**
- `releaseYear`: ano de `release_date`; string vazia → `null`.
- `rating`: `vote_average` arredondado a 1 casa; `vote_count === 0` → `null`.
- `overview` vazio → `null`.
- `cast`: no máximo 20 itens, em ordem.
- `trailerKey` (`pickTrailerKey(videos)`): o primeiro com `site === 'YouTube' && type === 'Trailer'`, priorizando `official === true`.
- `watch`: vem de `['watch/providers'].results.BR`; se `BR` não existir → `{ link: null, providers: [] }`. Os providers vêm de `flatrate`.
- `totalPages`: `Math.min(total_pages, MAX_PAGE)`.

Os schemas zod usam `.nullable().optional()` nos campos que o TMDB pode omitir (`poster_path`, `backdrop_path`, `runtime`, `release_date`, `overview`, `logo_path`, `profile_path`).

**Parâmetros do `discoverMovies`:**
- `watch_region=BR`, `with_watch_monetization_types=flatrate`, `include_adult=false`
- `with_watch_providers` = `providers` (ou `CURATED_PROVIDER_IDS` se vazio) unidos com `|`
- `with_genres` = `genre`
- `primary_release_date.gte` = `${yearFrom}-01-01`; `primary_release_date.lte` = `${yearTo}-12-31`
- `vote_average.gte` e `vote_count.gte=50` só quando `rating > 0`
- `sort_by`, `page`

**Fallback do trailer no `getMovieDetails`:** se `pickTrailerKey` retornar `null`, chame `/movie/{id}/videos` com `{ language: null }` e aplique `pickTrailerKey` de novo.

`revalidate.ts`: `REVALIDATE = { list: 21600, search: 3600, static: 86400 } as const`.

- [ ] **Passo 1: Testes dos mapeadores e do `parseMovieId`** (fixtures inline mínimas):
  ```ts
  expect(toMovie({ id: 1, title: 'X', poster_path: null, release_date: '', vote_average: 0, vote_count: 0 }))
    .toEqual({ id: 1, title: 'X', posterPath: null, releaseYear: null, rating: null })
  expect(toMovie({ ...base, release_date: '2023-05-02', vote_average: 7.456, vote_count: 10 })).toMatchObject({ releaseYear: 2023, rating: 7.5 })
  expect(toMovieDetails(semBR).watch).toEqual({ link: null, providers: [] })
  expect(toMovieDetails(com25Atores).cast).toHaveLength(20)
  expect(pickTrailerKey([teaser, trailerNaoOficial, trailerOficial])).toBe(trailerOficial.key)
  expect(parseMovieId('550')).toBe(550)
  for (const v of ['abc', '0', '-3', '1.5', '']) expect(parseMovieId(v)).toBeNull()
  ```
- [ ] **Passo 2: Rodar `npm test -- src/features/movies`.** Esperado: FALHA.
- [ ] **Passo 3: Implementar** `types.ts`, `schemas/tmdb.ts`, `mappers.ts` e `utils.ts`.
- [ ] **Passo 4: Testes da API com MSW:**
  ```ts
  it('discover envia região, monetização e provedores curados por padrão', ...)
    // with_watch_providers === CURATED_PROVIDER_IDS.join('|'); watch_region 'BR'; with_watch_monetization_types 'flatrate'
  it('discover com rating > 0 envia vote_count.gte=50', ...)
  it('discover com rating 0 não envia vote_average.gte nem vote_count.gte', ...)
  it('discover converte anos em datas', ...) // yearFrom 2000 → '2000-01-01'; yearTo 2010 → '2010-12-31'
  it('discover limita totalPages a 500', ...) // total_pages 9000 → 500
  it('search envia a query intacta', ...)    // searchMovies('ação & aventura', 1) → searchParams.get('query') === 'ação & aventura'
  it('details usa append_to_response e faz fallback do trailer', ...)
    // 1ª resposta sem trailer; /movie/1/videos sem language devolve trailer → trailerKey preenchido
  it('details propaga 404 como TmdbError', ...)
  it('providers filtra e ordena pelos curados e ignora IDs ausentes', ...)
    // resposta com [337, 8, 999] → ids [8, 337]
  ```
- [ ] **Passo 5: Rodar `npm test -- src/features/movies`.** Esperado: FALHA na API e PASSA nos mapeadores.
- [ ] **Passo 6: Implementar** `api/*.ts` e o `index.ts`.
- [ ] **Passo 7: Rodar de novo.** Esperado: PASSA tudo.
- [ ] **Passo 8: Commit.** `feat: camada de dados de filmes com schemas zod e mapeadores`

---

### Tarefa 6: Feature `catalog-filters`: estado na URL

**Arquivos:**
- Criar: `src/features/catalog-filters/schemas/filters.ts`, `src/features/catalog-filters/hooks/useFiltersUrl.ts`, `src/features/catalog-filters/index.ts`
- Testar: `src/features/catalog-filters/schemas/filters.test.ts`, `src/features/catalog-filters/hooks/useFiltersUrl.test.ts`

**Interfaces:**
- Consome: `DiscoverParams`, `SORT_OPTIONS`, `MAX_PAGE` (de `@/features/movies`), `CURATED_PROVIDER_IDS`
- Produz:
  - `type Filters = DiscoverParams`
  - `DEFAULT_FILTERS: Filters = { providers: [], rating: 0, sort: 'popularity.desc', page: 1 }`
  - `type RawSearchParams = Record<string, string | string[] | undefined>`
  - `parseFilters(params: RawSearchParams, now = new Date()): Filters`
  - `serializeFilters(f: Filters): URLSearchParams`: omite os valores padrão; `providers` vai como `8,119`; usa as chaves `providers`, `genre`, `yearFrom`, `yearTo`, `rating`, `sort`, `page`
  - `useFiltersUrl(): { filters: Filters; apply(next: Partial<Filters>): void; reset(): void }`. O `apply` mescla com os filtros atuais da URL, força `page: 1` (a menos que `next.page` venha definido) e faz `router.push(`${pathname}?${qs}`, { scroll: false })` (sem `?` quando `qs` está vazio). O `reset` faz push de `pathname`.

**Normalização** (tabela da spec, §5): um valor array usa o primeiro; `providers` descarta IDs fora da lista curada e não numéricos, sem duplicatas; anos são limitados a `1900..now.getFullYear()` e trocados de lugar se `from > to`; `rating` é limitado a `0..10`; `sort` desconhecido → padrão; `page` inválida ou `< 1` → 1, `> 500` → 500. Nunca lança exceção.

- [ ] **Passo 1: Testes que falham.**
  ```ts
  const now = new Date('2026-10-26')
  expect(parseFilters({}, now)).toEqual(DEFAULT_FILTERS)
  expect(parseFilters({ providers: '8,999,abc,8' }, now).providers).toEqual([8])
  expect(parseFilters({ yearFrom: '2030', yearTo: '1800' }, now)).toMatchObject({ yearFrom: 1900, yearTo: 2026 })
  expect(parseFilters({ yearFrom: '2010', yearTo: '2000' }, now)).toMatchObject({ yearFrom: 2000, yearTo: 2010 })
  expect(parseFilters({ rating: '15' }, now).rating).toBe(10)
  expect(parseFilters({ sort: 'hack' }, now).sort).toBe('popularity.desc')
  for (const [p, e] of [['abc', 1], ['0', 1], ['9999', 500], ['3', 3]]) expect(parseFilters({ page: p }, now).page).toBe(e)
  expect(parseFilters({ page: ['2', '5'] }, now).page).toBe(2)
  expect(serializeFilters(DEFAULT_FILTERS).toString()).toBe('')
  // ida e volta
  const f = { providers: [8, 119], genre: 28, yearFrom: 2000, yearTo: 2010, rating: 7, sort: 'vote_average.desc', page: 2 }
  expect(parseFilters(Object.fromEntries(serializeFilters(f)), now)).toEqual(f)
  // hook (mock de next/navigation: useRouter → { push }, useSearchParams → new URLSearchParams('page=4&genre=28'), usePathname → '/')
  it('apply mescla, volta à página 1 e faz push', ...) // apply({ rating: 7 }) → push('/?genre=28&rating=7', { scroll: false })
  it('reset limpa a URL', ...)                         // push('/', ...)
  ```
- [ ] **Passo 2: Rodar `npm test -- src/features/catalog-filters`.** Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar de novo.** Esperado: PASSA.
- [ ] **Passo 5: Commit.** `feat: filtros do catálogo sincronizados com a URL`

---

### Tarefa 7: Componentes de listagem de filmes

**Arquivos:**
- Criar: `src/features/movies/components/{movie-card,movie-grid,movie-grid-skeleton,empty-state}.tsx`
- Modificar: `src/features/movies/index.ts` (exportar), `next.config.ts`
- Testar: `src/features/movies/components/movie-card.test.tsx`, `src/features/movies/components/movie-grid.test.tsx`

**Interfaces:**
- Consome: `Movie`, `tmdbImageUrl`, `Badge`, `Skeleton`, `Button`
- Produz:
  - `MovieCard({ movie }: { movie: Movie })`: `<Link href={`/movie/${id}`}>`, pôster `w342` com `alt={`Pôster de ${title}`}`, título, ano e badge de nota (`7,5` em formato pt-BR)
  - `MovieGrid({ movies, empty }: { movies: Movie[]; empty: ReactNode })`: `<ul>` com grid `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`; lista vazia → renderiza `empty`
  - `MovieGridSkeleton({ count = 12 })`
  - `EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode })`

- [ ] **Passo 1: Testes que falham.**
  ```ts
  it('mostra título, ano e nota formatada', ...) // rating 7.5 → '7,5'; ano 2023; link href '/movie/1'
  it('sem pôster mostra placeholder', ...)       // getByText('Sem pôster'); nenhuma img
  it('sem nota não mostra badge', ...)           // queryByLabelText(/nota/i) null
  it('sem ano não mostra ano', ...)
  it('grade vazia renderiza o empty', ...)
  ```
  O badge tem `aria-label={`Nota ${valor}`}`. Para testar, faça mock de `next/image` como `<img>` no `vitest.setup.ts`.
- [ ] **Passo 2: Rodar.** Esperado: FALHA.
- [ ] **Passo 3: Implementar.** Em `next.config.ts`: `images.remotePatterns = [{ protocol: 'https', hostname: 'image.tmdb.org', pathname: '/t/p/**' }]`. O card tem `hover:scale-105` e sombra, com `sizes` adequado.
- [ ] **Passo 4: Rodar.** Esperado: PASSA.
- [ ] **Passo 5: Commit.** `feat: card e grade de filmes`

---

### Tarefa 8: Componentes de filtro

**Arquivos:**
- Criar: `src/features/catalog-filters/components/{filters-form,provider-picker,genre-select,year-range,rating-slider,sort-select,filters-drawer}.tsx`
- Modificar: `src/features/catalog-filters/index.ts`
- Testar: `src/features/catalog-filters/components/filters-form.test.tsx`, `provider-picker.test.tsx`

**Interfaces:**
- Consome: `useFiltersUrl`, `Filters`, `Provider`, `Genre`, `tmdbImageUrl`, `shared/ui`, `useUiStore`
- Produz:
  - `FiltersForm({ initial, providers, genres }: { initial: Filters; providers: Provider[]; genres: Genre[] })` (`'use client'`). Usa o `useForm<Filters>` do react-hook-form com `defaultValues: initial` e `values: initial` (resincroniza quando a URL muda). Cada campo chama `apply`:
    - chips: no toggle;
    - selects: no `onValueChange`;
    - slider: no `onValueCommit`;
    - anos: no `onBlur`/Enter, validados com zod `z.coerce.number().int().min(1900).max(anoAtual)`; se inválido, mostra o erro e não aplica.
  - Botão "Limpar filtros" chama `reset`.
  - `ProviderPicker({ providers, value, onChange }: { providers: Provider[]; value: number[]; onChange(ids: number[]): void })`: chips `Button variant="chip"` com logo `w92` e `aria-pressed`
  - `GenreSelect`, `SortSelect` (rótulos: "Mais populares", "Lançamentos recentes", "Mais bem avaliados", "Título (A–Z)"), `RatingSlider` (0–10, passo 0.5, mostra "Nota mín. 7,0"), `YearRange`
  - `FiltersDrawer({ children })`: `Dialog` controlado por `useUiStore`, com o botão "Filtros" visível só abaixo de `md`. No desktop os filtros aparecem inline.

- [ ] **Passo 1: Testes que falham** (mock de `next/navigation` como na Tarefa 6):
  ```ts
  it('clicar num provedor aplica a seleção', ...) // click 'Netflix' → push('/?providers=8', ...)
  it('desmarcar o provedor remove da URL', ...)  // initial providers [8]; aria-pressed true; click → push('/', ...)
  it('ano inválido mostra erro e não aplica', ...) // digitar '1800' + blur → mensagem; push não chamado
  it('limpar filtros faz reset', ...)
  ```
- [ ] **Passo 2: Rodar.** Esperado: FALHA.
- [ ] **Passo 3: Implementar.**
- [ ] **Passo 4: Rodar.** Esperado: PASSA.
- [ ] **Passo 5: Commit.** `feat: formulário de filtros com provedores, gênero, ano, nota e ordenação`

---

### Tarefa 9: Layout e página do catálogo

**Arquivos:**
- Criar: `src/shared/layout/{header,footer,user-slot}.tsx`, `src/app/(catalog)/page.tsx`, `src/app/(catalog)/loading.tsx`, `src/app/error.tsx`, `src/app/not-found.tsx`, `src/app/(auth)/.gitkeep`, `public/tmdb-logo.svg`
- Modificar: `src/app/layout.tsx` (remover `src/app/page.tsx` do scaffold)
- Testar: `src/shared/layout/user-slot.test.tsx`, `src/shared/layout/footer.test.tsx`

**Interfaces:**
- Consome: tudo de `@/features/movies` e `@/features/catalog-filters`, `Pagination`, `useUserInfo`
- Produz:
  - `Header({ search }: { search: ReactNode })`: logo "Filmes" com link para `/`, o slot `search` e `<UserSlot />`
  - `UserSlot()` (`'use client'`): `null` sem usuário; com usuário, mostra o avatar/nome
  - `Footer()`: logo do TMDB (baixe o SVG oficial em https://www.themoviedb.org/about/logos-attribution) e os textos exatos "Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB." e "Dados de disponibilidade fornecidos pela JustWatch."
  - `app/layout.tsx`: `<html lang="pt-BR">`, metadados de `siteConfig` e `<Header search={null} />` (a `SearchBar` entra na Tarefa 10)

**Página `/`** (`searchParams: Promise<RawSearchParams>`):
1. `const filters = parseFilters(await searchParams)`
2. `const [providers, genres] = await Promise.all([getProviders(), getGenres()])`
3. Renderiza `<FiltersForm initial={filters} providers={providers} genres={genres} />` e `<Suspense key={serializeFilters(filters).toString()} fallback={<MovieGridSkeleton />}><CatalogResults filters={filters} /></Suspense>`

`CatalogResults` é um componente async local do arquivo da página:
- chama `discoverMovies`;
- mostra o contador `"{n} filmes"` com `Intl.NumberFormat('pt-BR')`;
- renderiza `MovieGrid` com `EmptyState`:
  - sem resultados e `page > 1`: "Página inexistente", com link para a página 1;
  - sem resultados nos demais casos: "Nenhum filme com esses filtros", com um botão de limpar que leva a `/`;
- renderiza `Pagination` com `hrefFor = p => '/?' + serializeFilters({ ...filters, page: p })`.

`loading.tsx` = `MovieGridSkeleton`. `error.tsx` (`'use client'`): "Não foi possível carregar os filmes." + `Button` "Tentar de novo" → `reset()`. `not-found.tsx` global: "Página não encontrada" + link para o início.

- [ ] **Passo 1: Testes que falham.**
  ```ts
  it('UserSlot não renderiza nada sem usuário', ...)
  it('UserSlot mostra o nome com usuário', ...)
  it('Footer contém as atribuições exigidas', ...) // os dois textos exatos acima
  ```
- [ ] **Passo 2: Rodar.** Esperado: FALHA.
- [ ] **Passo 3: Implementar** o layout, a página, o loading, o erro e o not-found.
- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA.
- [ ] **Passo 5: Verificação manual.** Crie o `.env.local` com um token real e rode `npm run dev`. Verifique:
  - `/` lista filmes;
  - clicar em Netflix muda a URL e a grade;
  - `/?page=9999` é tratado como página 500;
  - `/?providers=8&genre=99&yearFrom=1900&yearTo=1901` mostra o estado vazio;
  - no mobile (DevTools), os filtros aparecem no drawer.
- [ ] **Passo 6: Commit.** `feat: layout com atribuição e página do catálogo`

---

### Tarefa 10: Busca

**Arquivos:**
- Criar: `src/features/search/components/search-bar.tsx`, `src/features/search/index.ts`, `src/app/(catalog)/search/page.tsx`
- Modificar: `src/app/layout.tsx` (passar `<SearchBar />` para o `Header`)
- Testar: `src/features/search/components/search-bar.test.tsx`

**Interfaces:**
- Consome: `useDebounce`, `searchMovies`, `MovieGrid`, `EmptyState`, `Pagination`, `MovieGridSkeleton`
- Produz:
  - `SearchBar()` (`'use client'`):
    - react-hook-form + zod `z.object({ q: z.string().trim().min(2, 'Digite ao menos 2 caracteres') })`, valor inicial vindo de `useSearchParams().get('q')`;
    - o valor digitado passa por `useDebounce(…, 400)`; quando válido e diferente do `q` atual, faz `router.push(`/search?q=${encodeURIComponent(q)}`)`;
    - Enter submete na hora; a mensagem de erro só aparece no submit;
    - `<input type="search" aria-label="Buscar filmes">`. No mobile vira um botão-ícone que expande (usa `useMediaQuery('(min-width: 768px)')`).
  - Página `/search` (`searchParams: Promise<RawSearchParams>`): lê `q` (string, trim) e `page` (mesma regra de 1..500):
    - `q.length < 2` → `EmptyState` "Busque um filme pelo título";
    - senão, mostra o aviso fixo "Resultados de todo o TMDB, nem todos estão disponíveis em streaming." e um `Suspense` com `key` de `q` + `page` envolvendo a grade e a paginação (`hrefFor = p => `/search?q=${encodeURIComponent(q)}&page=${p}``);
    - sem resultados → "Nenhum filme encontrado para "{q}"".

- [ ] **Passo 1: Testes que falham** (fake timers, mock de `next/navigation`):
  ```ts
  it('navega após 400ms com a query codificada', ...) // digitar 'ação & aventura'; avançar 400 → push('/search?q=a%C3%A7%C3%A3o%20%26%20aventura')
  it('não navega antes do debounce', ...)              // avançar 399 → push não chamado
  it('não navega com menos de 2 caracteres', ...)
  it('Enter com 1 caractere mostra o erro', ...)       // 'Digite ao menos 2 caracteres'
  ```
- [ ] **Passo 2: Rodar.** Esperado: FALHA.
- [ ] **Passo 3: Implementar** a `SearchBar`, a página e a ligação no layout.
- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA. Verificação manual: buscar "matrix" pelo header leva a `/search?q=matrix` com resultados e paginação.
- [ ] **Passo 5: Commit.** `feat: busca por título com debounce`

---

### Tarefa 11: Página de detalhes do filme

**Arquivos:**
- Criar: `src/features/movies/components/{movie-hero,where-to-watch,trailer,cast-list}.tsx`, `src/app/(catalog)/movie/[id]/page.tsx`, `src/app/(catalog)/movie/[id]/not-found.tsx`
- Modificar: `src/features/movies/index.ts`
- Testar: `src/features/movies/components/{movie-hero,where-to-watch,trailer}.test.tsx`

**Interfaces:**
- Consome: `MovieDetails`, `getMovieDetails`, `parseMovieId`, `TmdbError`, `tmdbImageUrl`
- Produz:
  - `MovieHero({ movie }: { movie: MovieDetails })`:
    - backdrop `w1280` em tela cheia com gradiente para `background`; sem backdrop → fundo `surface` sólido;
    - pôster `w342` (placeholder se ausente), título `<h1>`, título original (só se diferente), ano, duração `"2h 16min"`, gêneros como `Badge` e nota;
    - `formatRuntime(minutes: number | null): string | null` exportada do mesmo arquivo.
  - `WhereToWatch({ watch }: { watch: MovieDetails['watch'] })`: logos `w92` com `alt` = nome e o link "Ver no JustWatch" (`watch.link`, `target="_blank" rel="noopener noreferrer"`). Sem providers: "Não disponível em streaming por assinatura no Brasil".
  - `Trailer({ trailerKey, title }: { trailerKey: string | null; title: string })` (`'use client'`): `null` se não houver key; senão, o botão "Assistir trailer" monta, no clique, `<iframe src="https://www.youtube-nocookie.com/embed/{key}?autoplay=1" title={`Trailer de ${title}`} allow="autoplay; encrypted-media" allowFullScreen>`.
  - `CastList({ cast })`: `<ul>` com rolagem horizontal (`overflow-x-auto snap-x`), foto `w185` ou placeholder, nome e personagem. Lista vazia → não renderiza nada.
  - Página: `params: Promise<{ id: string }>`.
    - `parseMovieId` retorna `null` → `notFound()`.
    - Um helper local `loadMovie(id)` envolto em `cache()` do React: em caso de `TmdbError` com `status === 404`, chama `notFound()`; os demais erros são relançados (vão para o `error.tsx`).
    - `generateMetadata`: `title: "{title} ({ano}) | Filmes"`, `description` = overview (ou `siteConfig.description`), `openGraph.images` = backdrop `w1280` se houver.
    - Layout: Hero → Onde assistir → Sinopse ("Sinopse indisponível." se `null`) → Trailer → Elenco.
  - `not-found.tsx` da rota: "Filme não encontrado" + link para o catálogo.

- [ ] **Passo 1: Testes que falham.**
  ```ts
  expect(formatRuntime(136)).toBe('2h 16min'); expect(formatRuntime(45)).toBe('45min'); expect(formatRuntime(null)).toBeNull()
  it('hero sem backdrop nem pôster renderiza placeholders', ...)
  it('hero omite título original quando igual', ...)
  it('where-to-watch lista provedores e link do JustWatch', ...)
  it('where-to-watch sem provedores mostra a mensagem', ...)
  it('trailer só monta o iframe após o clique', ...) // queryByTitle(/Trailer de/) null → click → presente com src contendo youtube-nocookie.com/embed/KEY
  it('trailer sem key não renderiza', ...)
  ```
- [ ] **Passo 2: Rodar.** Esperado: FALHA.
- [ ] **Passo 3: Implementar** os componentes e a página.
- [ ] **Passo 4: Rodar `npm test`.** Esperado: PASSA. Verificação manual:
  - `/movie/603` (Matrix) mostra o hero, os provedores e o trailer;
  - `/movie/abc` e `/movie/999999999` mostram "Filme não encontrado";
  - o preview OG aparece no HTML (`view-source`).
- [ ] **Passo 5: Commit.** `feat: página de detalhes com onde assistir, trailer e elenco`

---

### Tarefa 12: Hooks de commit, CI e README

**Arquivos:**
- Criar: `.husky/pre-commit`, `.github/workflows/ci.yml`
- Modificar: `package.json`, `README.md`

- [ ] **Passo 1: Husky + lint-staged.** `npm i -D husky lint-staged && npx husky init`. O `.husky/pre-commit` roda `npx lint-staged`. No `package.json`:
  ```json
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{css,md,json}": ["prettier --write"]
  }
  ```
- [ ] **Passo 2: CI.** `ci.yml` roda em `push` para `master` e em `pull_request`: `actions/checkout@v4`, `actions/setup-node@v4` (`node-version: 22`, `cache: npm`), `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` com `env: TMDB_READ_TOKEN: dummy`. As páginas são dinâmicas por `searchParams`; se o build tentar pré-renderizar alguma rota que chame o TMDB, marque-a com `export const dynamic = 'force-dynamic'` em vez de exigir o token real no CI.
- [ ] **Passo 3: README.** Seções:
  - Sobre (com um screenshot opcional);
  - Stack;
  - Como rodar (obter o token em https://www.themoviedb.org/settings/api, `cp .env.example .env.local`, `npm i`, `npm run dev`);
  - Scripts;
  - Arquitetura (a árvore da spec §4.1 e as regras §4.2);
  - Como adicionar uma feature (pasta em `features/`, export pelo `index.ts`, rota em `app/`);
  - Créditos (TMDB e JustWatch, com o texto de atribuição).
- [ ] **Passo 4: Verificação final.** `npm run lint && npm run typecheck && npm test && npm run build` termina sem erros. Faça um commit de teste para confirmar que o hook roda.
- [ ] **Passo 5: Commit.** `chore: husky, lint-staged, CI e README`
- [ ] **Passo 6: Deploy (com o usuário).** Importar o repositório na Vercel e definir `TMDB_READ_TOKEN` nas Environment Variables. Depende do push para o GitHub, que hoje está bloqueado por autenticação.
