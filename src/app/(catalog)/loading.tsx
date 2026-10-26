import { HeroSkeleton, MovieRowSkeleton } from '@/features/movies'

export default function Loading() {
  return (
    <div className="space-y-8">
      <HeroSkeleton />
      <MovieRowSkeleton />
    </div>
  )
}
