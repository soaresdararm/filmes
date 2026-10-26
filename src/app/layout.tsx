import type { Metadata } from 'next'
import { Bebas_Neue, Figtree } from 'next/font/google'
import { Suspense } from 'react'
import { SearchBar } from '@/features/search'
import { siteConfig } from '@/shared/config/site'
import { Footer } from '@/shared/layout/footer'
import { Header } from '@/shared/layout/header'
import './globals.css'

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
})

const bebas = Bebas_Neue({
  variable: '--font-bebas',
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="pt-BR"
      className={`${figtree.variable} ${bebas.variable} h-full`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <Header
          search={
            // SearchBar lê a URL (useSearchParams): precisa de Suspense com Cache Components
            <Suspense fallback={null}>
              <SearchBar />
            </Suspense>
          }
        />
        {/* o padding-top compensa o header fixo; heros usam a margem negativa equivalente para ficar por baixo dele */}
        <main className="w-full flex-1 px-gutter pt-28 pb-8 lg:pt-24">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
