'use client'

import { Play } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

type TrailerProps = {
  trailerKey: string | null
  title: string
}

/** Abre o trailer num modal. O iframe do YouTube só é montado quando o modal abre, para não pesar a página. */
export function Trailer({ trailerKey, title }: TrailerProps) {
  if (!trailerKey) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="light" size="lg">
          <Play aria-hidden className="size-5 fill-current sm:size-6" />
          Assistir trailer
        </Button>
      </DialogTrigger>
      <DialogContent className="inset-auto top-1/2 left-1/2 w-[min(94vw,1100px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border-0 bg-black p-0">
        <DialogTitle className="sr-only">Trailer de {title}</DialogTitle>
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
            title={`Trailer de ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
