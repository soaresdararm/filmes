'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/button'

export default function Error({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">
        Não foi possível carregar os filmes.
      </h1>
      <p className="text-muted">
        O serviço pode estar instável. Tente novamente em instantes.
      </p>
      <Button onClick={() => retry()}>Tentar de novo</Button>
    </div>
  )
}
