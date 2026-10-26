import Link from 'next/link'
import { Button } from '@/shared/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <Button asChild variant="outline">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  )
}
