import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export default function MovieNotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Filme não encontrado</h1>
      <p className="text-muted">
        O endereço pode estar incorreto ou o filme saiu do catálogo.
      </p>
      <Button asChild variant="outline">
        <Link href="/">Voltar ao catálogo</Link>
      </Button>
    </div>
  )
}
