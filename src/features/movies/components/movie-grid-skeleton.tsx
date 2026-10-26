import { Skeleton } from '@/shared/ui/skeleton'
import { movieGridClass } from './movie-grid'

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Carregando filmes"
      className={movieGridClass}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-2/3 w-full rounded-lg" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-1 h-3 w-1/3" />
        </div>
      ))}
    </div>
  )
}
