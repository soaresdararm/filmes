import Image from 'next/image'

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">
          <Image
            src="/tmdb-logo.svg"
            alt="The Movie Database (TMDB)"
            width={137}
            height={18}
            className="h-4.5 w-auto"
          />
        </a>
        <div className="space-y-1 sm:text-right">
          <p>Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</p>
          <p>Dados de disponibilidade fornecidos pela JustWatch.</p>
        </div>
      </div>
    </footer>
  )
}
