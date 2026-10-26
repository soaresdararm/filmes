# Catálogo de Filmes em Streaming — Design

- **Data:** 2026-10-26
- **Status:** aprovado em conversa, aguardando revisão da spec escrita
- **Repositório:** https://github.com/soaresdararm/filmes

## 1. Objetivo e contexto

Aplicação web que mostra os filmes disponíveis **por assinatura** nos serviços de streaming no **Brasil**, usando a API do TMDB (dados de disponibilidade fornecidos pela JustWatch).

- **Propósito:** projeto de portfólio/estudo. O que importa é a qualidade do código, a arquitetura e um visual que impressione.
- **Base replicável:** a estrutura deve suportar novas features (incluindo login/cadastro no futuro) e servir de ponto de partida para outros projetos.
- **Critérios de sucesso:**
  - app publicado na Vercel, rápido e responsivo;
  - código organizado por features, tipado de ponta a ponta e testado;
  - adicionar uma feature nova (ex.: auth) não exige mexer nas features existentes.

### Premissas

- Região fixa `BR` e idioma `pt-BR` (com fallback para o título e a sinopse originais).
- "Disponível" = monetização `flatrate` (assinatura). Aluguel, compra e gratuito com anúncios ficam de fora.
- Sem login e sem banco de dados na v1: o TMDB é a única fonte de dados.
- Atribuição obrigatória ao TMDB e à JustWatch.

## 2. Escopo

### Dentro da v1

1. **Catálogo** filtrável por provedor (seleção múltipla, lógica OU).
2. **Página de detalhes** do filme: dados gerais, onde assistir, trailer e elenco.
3. **Busca** por título.
4. **Filtros extras:** gênero, intervalo de anos, nota mínima e ordenação.

### Fora da v1 (candidatos à v2)

- "Meus streamings" (preferência do usuário), lista "quero assistir" e scroll infinito.
- Login/cadastro: apenas os **encaixes** existem (ver §4.4); o provedor de auth ainda não foi escolhido.
- Tema claro e testes E2E (Playwright).

## 3. Stack

| Área | Escolha |
|---|---|
| Framework | Next.js (App Router) + TypeScript `strict` |
| Estilo/UI | Tailwind CSS, Radix UI, CVA (`class-variance-authority`), `clsx` + `tailwind-merge` |
| Estado de cliente | Zustand |
| Formulários/validação | `react-hook-form`, `zod`, `@hookform/resolvers` |
| Testes | Vitest, Testing Library, MSW |
| Qualidade | ESLint, Prettier (+ plugin do Tailwind), Husky + lint-staged, GitHub Actions |
| Deploy | Vercel |

## 4. Arquitetura

Abordagem escolhida: **Server Components + estado na URL**. As páginas buscam os dados no servidor (o token nunca chega ao cliente), os filtros e a busca vivem na URL (links compartilháveis, SSR/SEO) e apenas os controles interativos são Client Components. A paginação é numerada.

### 4.1 Estrutura de pastas

```
src/
├── app/                          # só roteamento: páginas finas que compõem features
│   ├── layout.tsx, error.tsx, not-found.tsx
│   ├── (catalog)/
│   │   ├── page.tsx              # catálogo
│   │   ├── loading.tsx
│   │   ├── search/page.tsx
│   │   └── movie/[id]/page.tsx
│   └── (auth)/                   # reservado para login/cadastro (vazio na v1)
├── features/
│   ├── movies/
│   │   ├── api/                  # discoverMovies, searchMovies, getMovieDetails, getProviders, getGenres
│   │   ├── components/           # MovieCard, MovieGrid, MovieHero, CastList, Trailer, WhereToWatch
│   │   ├── schemas/              # zod das respostas do TMDB
│   │   ├── types.ts              # tipos de domínio (Movie, MovieDetails, Provider, Genre)
│   │   └── index.ts              # API pública da feature
│   ├── catalog-filters/
│   │   ├── components/           # FiltersForm, ProviderPicker, GenreSelect, YearRange, RatingSlider, SortSelect
│   │   ├── schemas/filters.ts    # parseFilters / serializeFilters
│   │   ├── hooks/useFiltersUrl.ts
│   │   └── index.ts
│   └── search/
│       ├── components/SearchBar.tsx
│       └── index.ts
├── shared/                       # agnóstico de domínio, replicável
│   ├── ui/                       # Button, Badge, Select, Slider, Dialog, Skeleton, Pagination...
│   ├── hooks/                    # useUserInfo.ts, useDebounce.ts, useMediaQuery.ts
│   ├── lib/                      # cn.ts, env.ts, http.ts
│   ├── config/site.ts            # nome, região, idioma, metadados, lista curada de provedores
│   └── types/
├── services/
│   └── tmdb/                     # client.ts, images.ts, errors.ts, endpoints
└── store/
    ├── user-store.ts
    └── ui-store.ts
```

### 4.2 Regras de dependência

- Direção única: `app → features → shared | services | store`.
- `shared/` não importa nada de `features/`, `services/` ou `store/`. A única exceção é `shared/hooks/useUserInfo.ts`, que lê `store/user-store.ts`.
- Uma feature só importa outra pelo `index.ts` dela. Isso é reforçado com `no-restricted-imports` no ESLint.
- Aliases: `@/app`, `@/features`, `@/shared`, `@/services`, `@/store`.

### 4.3 Estado

- **Dados do TMDB:** buscados em Server Components e cacheados pelo Next. **Nunca** passam pelo Zustand.
- **Filtros, busca e página:** na URL (fonte da verdade).
- **Zustand (só cliente):**
  - `ui-store`: estado de UI (ex.: drawer de filtros aberto no mobile);
  - `user-store`: sessão do usuário.

### 4.4 Encaixes para auth futura

- `store/user-store.ts` define o tipo `User` (`id`, `name`, `email`, `avatarUrl`) e um estado `user: User | null`, que é `null` na v1.
- `shared/hooks/useUserInfo.ts` retorna `{ user, isAuthenticated }` a partir do store.
- O header tem um slot à direita que renderiza `null` quando não há usuário.
- O route group `(auth)/` existe vazio. A feature futura entra como `features/auth/` e preenche o store, sem alterar as features existentes.

## 5. Integração com o TMDB

Autenticação via **API Read Access Token** (`Authorization: Bearer`), na variável `TMDB_READ_TOKEN`, usada só no servidor.

| Uso | Endpoint | Parâmetros-chave | `revalidate` |
|---|---|---|---|
| Catálogo | `GET /discover/movie` | `watch_region=BR`, `with_watch_monetization_types=flatrate`, `with_watch_providers` (IDs separados por `\|`), `with_genres`, `primary_release_date.gte/lte`, `vote_average.gte`, `vote_count.gte`, `sort_by`, `page` | 6h |
| Busca | `GET /search/movie` | `query`, `page` | 1h |
| Detalhes | `GET /movie/{id}` | `append_to_response=credits,videos,watch/providers` | 6h |
| Provedores | `GET /watch/providers/movie` | `watch_region=BR` | 24h |
| Gêneros | `GET /genre/movie/list` | — | 24h |

O `services/tmdb/client.ts` injeta `language=pt-BR` e `region=BR` em todas as chamadas e aplica um timeout de 8s.

### Regras de negócio

- **Provedores:** a lista de filtros é a interseção entre a resposta de `/watch/providers/movie` e uma **lista curada** de IDs em `shared/config/site.ts` (Netflix, Prime Video, Max, Disney+, Globoplay, Apple TV+, Paramount+, entre outros). Os logos vêm da API.
- **Padrão sem provedor selecionado:** `with_watch_providers` recebe todos os IDs da lista curada (OU).
- **Nota mínima:** quando `vote_average.gte > 0`, envia também `vote_count.gte=50`.
- **Paginação:** `page` é limitado a `min(total_pages, 500)` (limite do TMDB).
- **Busca:** o `/search/movie` não aceita filtro de provedor. A página de busca mostra resultados de todo o TMDB, com um aviso explícito na interface. A disponibilidade aparece só na página de detalhes.
- **Onde assistir:** usa `watch/providers.results.BR.flatrate` e o `link` do JustWatch retornado pela API.
- **Trailer:** o primeiro vídeo `site=YouTube` e `type=Trailer`. Se não houver em pt-BR, faz uma segunda chamada a `/movie/{id}/videos` sem `language`.

### Filtros na URL

| Param | Tipo | Padrão | Normalização |
|---|---|---|---|
| `providers` | lista de IDs (`8,119`) | vazio (= todos curados) | descarta IDs fora da lista curada |
| `genre` | ID | — | descarta se não numérico |
| `yearFrom`, `yearTo` | ano | — | limita a 1900–ano atual; troca se `from > to` |
| `rating` | 0–10 | 0 | limita ao intervalo |
| `sort` | `popularity.desc` \| `primary_release_date.desc` \| `vote_average.desc` \| `title.asc` | `popularity.desc` | valor desconhecido → padrão |
| `page` | inteiro | 1 | `< 1` ou inválido → 1; `> 500` → 500 |

`parseFilters(searchParams): Filters` e `serializeFilters(Filters): URLSearchParams` são funções puras com schema zod. A serialização omite os valores padrão para manter a URL limpa.

## 6. Fluxo de dados (catálogo)

1. A requisição chega a `app/(catalog)/page.tsx` com os `searchParams`.
2. `parseFilters` normaliza os filtros.
3. Em paralelo: `discoverMovies(filters)`, `getProviders()` e `getGenres()`.
4. As respostas são validadas com zod e mapeadas para os tipos de domínio.
5. A página renderiza `FiltersForm` (cliente, com os filtros iniciais), `MovieGrid` e `Pagination` (servidor).
6. Ao mudar um filtro, `useFiltersUrl` faz `router.push` com `serializeFilters` (e `page` volta a 1), o que reinicia o fluxo. O `loading.tsx` mostra o skeleton.

## 7. Interface

Tema escuro "cinematográfico", com tokens de cor no Tailwind (`background`, `surface`, `muted`, `accent`, `foreground`) para permitir trocar o tema no futuro.

- **Header:** logo, `SearchBar` (vira ícone expansível no mobile) e o slot de usuário.
- **Footer:** atribuição ao TMDB (logo + aviso exigido) e à JustWatch.
- **Catálogo `/`:**
  - chips de provedores com logo e seleção múltipla;
  - filtros (Select de gênero, intervalo de anos, Slider de nota, Select de ordenação) na barra no desktop e em drawer (Dialog) no mobile;
  - "Limpar filtros" e contador de resultados;
  - grade responsiva de 2 a 6 colunas; o `MovieCard` mostra pôster, título, ano e nota, com zoom e sombra no hover;
  - paginação numerada;
  - estado vazio com ação de limpar filtros.
- **Detalhes `/movie/[id]`:**
  - hero com backdrop em tela cheia e gradiente, pôster, título, título original, ano, duração, gêneros e nota;
  - "Onde assistir" com logos e link para o JustWatch; sem provedor: "Não disponível em streaming por assinatura no Brasil";
  - sinopse;
  - trailer carregado só no clique (iframe do YouTube montado sob demanda);
  - carrossel de elenco;
  - `generateMetadata` com título, descrição e imagem OG do backdrop.
- **Busca `/search?q=`:** mesma grade e paginação, com o aviso de que os resultados vêm de todo o TMDB. A `SearchBar` usa react-hook-form + zod (`q` com no mínimo 2 caracteres) e debounce de 400ms.
- **Imagens:** `next/image` com `remotePatterns` para `image.tmdb.org`; `w342` na grade, `w1280` no backdrop, `w185` no elenco, `w92` nos logos; placeholder quando não há imagem.
- **Acessibilidade:** primitivos Radix, foco visível, `alt` em todas as imagens e navegação completa por teclado.

## 8. Tratamento de erros

| Situação | Comportamento |
|---|---|
| `TMDB_READ_TOKEN` ausente ou inválido no formato | `shared/lib/env.ts` (zod) lança um erro com mensagem clara na inicialização |
| TMDB 404 em detalhes | `notFound()` → `not-found.tsx` ("Filme não encontrado") |
| TMDB 401 | log no servidor; usuário vê o `error.tsx` genérico |
| TMDB 429 / 5xx / timeout | `TmdbError` → `error.tsx` com o botão "Tentar de novo" (`reset()`) |
| Resposta fora do schema | log do erro do zod e tratamento como falha do serviço |
| Campos opcionais ausentes | fallbacks (placeholder de imagem, "Sinopse indisponível") |
| searchParams inválidos | normalizados por `parseFilters`, nunca geram erro |

`TmdbError` (`services/tmdb/errors.ts`) carrega `status` e `message` e é o único tipo de erro que sai da camada de serviço.

## 9. Testes

Vitest + Testing Library, com MSW simulando o TMDB. A implementação segue **TDD**.

- **Unitários:** `parseFilters`/`serializeFilters` (ida e volta, valores inválidos, limites), mapeadores TMDB → domínio, `images.ts`, `cn`, `env`.
- **Camada de API:** `discoverMovies`, `searchMovies` e `getMovieDetails` com MSW, verificando os parâmetros enviados (região, monetização, provedores, `vote_count`) e o tratamento de 404, 429 e resposta inválida.
- **Componentes:** `MovieCard` (sem pôster, sem nota), `FiltersForm` (mudança gera a URL esperada e reseta a página), `WhereToWatch` (com e sem provedores), `SearchBar` (validação e debounce), variantes CVA de `shared/ui`.
- **Fora da v1:** E2E com Playwright.

## 10. Qualidade e infraestrutura do repositório

- TypeScript `strict`; ESLint com a regra de fronteiras entre features; Prettier + `prettier-plugin-tailwindcss`.
- Husky + lint-staged: lint e testes relacionados aos arquivos alterados no pre-commit.
- GitHub Actions em PR e push: `lint`, `typecheck`, `test` e `build`.
- `.env.example` com `TMDB_READ_TOKEN=`.
- README com setup, scripts, visão da arquitetura e créditos ao TMDB/JustWatch.
