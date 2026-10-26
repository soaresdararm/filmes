# Filmes

Catálogo dos filmes disponíveis **agora** nos streamings por assinatura do Brasil (Netflix, Prime Video, Disney+, Max, Globoplay, Apple TV+, Paramount+, MUBI), com filtros, busca e página de detalhes. Os dados vêm da API do [TMDB](https://www.themoviedb.org/), e a disponibilidade, da [JustWatch](https://www.justwatch.com/).

Projeto de portfólio, organizado para servir de base para outros projetos.

## Stack

- **Next.js 16** (App Router, Cache Components) + **TypeScript** strict
- **Tailwind CSS v4**, **Radix UI**, **CVA**
- **Zustand** para estado de cliente
- **react-hook-form** + **zod** para formulários e validação
- **Vitest**, **Testing Library** e **MSW** para testes
- ESLint, Prettier, Husky, lint-staged e GitHub Actions

## Como rodar

1. Crie uma conta no TMDB e copie o **API Read Access Token** em <https://www.themoviedb.org/settings/api>.
2. Configure o ambiente:

   ```bash
   cp .env.example .env.local   # e cole o token em TMDB_READ_TOKEN
   npm install
   npm run dev
   ```

3. Abra <http://localhost:3000>.

## Scripts

| Script               | O que faz                                   |
| -------------------- | ------------------------------------------- |
| `npm run dev`        | Servidor de desenvolvimento                 |
| `npm run build`      | Build de produção                           |
| `npm start`          | Sobe o build de produção                    |
| `npm test`           | Roda todos os testes uma vez                |
| `npm run test:watch` | Testes em modo watch                        |
| `npm run lint`       | ESLint (inclui as fronteiras entre camadas) |
| `npm run typecheck`  | Gera os tipos de rota e roda o `tsc`        |
| `npm run format`     | Prettier em todo o projeto                  |

## Arquitetura

```
src/
├── app/            # só roteamento: páginas finas que compõem features
│   ├── (catalog)/  # catálogo, busca e detalhes
│   └── (auth)/     # reservado para login/cadastro
├── features/       # cada feature é autocontida
│   ├── movies/           # tipos, schemas, API do TMDB e componentes de filme
│   ├── catalog-filters/  # filtros sincronizados com a URL
│   └── search/           # barra de busca
├── shared/         # agnóstico de domínio, reaproveitável em outros projetos
│   ├── ui/         # design system (Radix + CVA + Tailwind)
│   ├── hooks/      # useUserInfo, useDebounce, useMediaQuery
│   ├── layout/     # header e footer
│   ├── lib/        # cn, env (validado com zod), formatação
│   └── config/     # nome do site, região, provedores
├── services/tmdb/  # cliente HTTP do TMDB: token, timeout, erros, imagens
└── store/          # Zustand: sessão do usuário e estado de UI
```

**Regras** (verificadas pelo ESLint):

- As dependências seguem uma única direção: `app → features → shared | services | store`.
- Fora da própria feature, ela é importada só pelos seus pontos de entrada: `@/features/<nome>` (seguro para o cliente) e `@/features/<nome>/server` (só servidor, acessa o TMDB).
- `shared/` não conhece `features/`, `services/` nem `store/`. A única exceção é o `useUserInfo`.

**Dados e estado:**

- Server Components buscam no TMDB com cache (`'use cache'` + `cacheLife`): 6h para o catálogo e os detalhes, 1h para a busca e 24h para provedores e gêneros.
- Filtros, busca e página vivem na URL, então os links são compartilháveis.
- O Zustand guarda só estado de cliente. O `user-store` já existe (vazio) para receber a futura autenticação.

## Como adicionar uma feature

1. Crie `src/features/<nome>/` com `components/`, `schemas/`, `api/` e o que mais precisar.
2. Exponha a API pública em `index.ts` (cliente) e, se acessar dados no servidor, em `server.ts`.
3. Componha a feature numa rota em `src/app/`.
4. Escreva os testes ao lado do código (`*.test.ts(x)`).

## Créditos

<img src="public/tmdb-logo.svg" alt="TMDB" height="16" />

Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB. Dados de disponibilidade fornecidos pela JustWatch.
