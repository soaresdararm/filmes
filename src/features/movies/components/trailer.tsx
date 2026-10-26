'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/ui/button'

type TrailerProps = {
  trailerKey: string | null
  title: string
}

/** O iframe do YouTube só é montado no clique, para não pesar a página. */
export function Trailer({ trailerKey, title }: TrailerProps) {
  const [playing, setPlaying] = useState(false)
  if (!trailerKey) return null

  return (
    <section aria-labelledby="trailer" className="space-y-3">
      <h2 id="trailer" className="text-xl font-semibold">
        Trailer
      </h2>
      {playing ? (
        <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1`}
            title={`Trailer de ${title}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      ) : (
        <Button onClick={() => setPlaying(true)}>
          <Play aria-hidden className="size-4 fill-current" />
          Assistir trailer
        </Button>
      )}
    </section>
  )
}
