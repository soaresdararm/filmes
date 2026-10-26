import { z } from 'zod'

export const rawMovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullish(),
  release_date: z.string().nullish(),
  vote_average: z.number().nullish(),
  vote_count: z.number().nullish(),
})

export const rawPageSchema = z.object({
  page: z.number(),
  results: z.array(rawMovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export const rawGenreSchema = z.object({ id: z.number(), name: z.string() })

export const rawGenreListSchema = z.object({ genres: z.array(rawGenreSchema) })

export const rawProviderSchema = z.object({
  provider_id: z.number(),
  provider_name: z.string(),
  logo_path: z.string().nullish(),
})

export const rawProviderListSchema = z.object({
  results: z.array(rawProviderSchema),
})

export const rawVideoSchema = z.object({
  key: z.string(),
  site: z.string(),
  type: z.string(),
  official: z.boolean().nullish(),
})

export const rawVideoListSchema = z.object({ results: z.array(rawVideoSchema) })

const rawWatchRegionSchema = z.object({
  link: z.string().nullish(),
  flatrate: z.array(rawProviderSchema).nullish(),
})

export const rawMovieDetailsSchema = rawMovieSchema.extend({
  original_title: z.string(),
  overview: z.string().nullish(),
  backdrop_path: z.string().nullish(),
  runtime: z.number().nullish(),
  genres: z.array(rawGenreSchema),
  credits: z.object({
    cast: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        character: z.string().nullish(),
        profile_path: z.string().nullish(),
      }),
    ),
  }),
  videos: rawVideoListSchema,
  'watch/providers': z.object({
    results: z.record(z.string(), rawWatchRegionSchema),
  }),
})

export type RawMovie = z.input<typeof rawMovieSchema>
export type RawPage = z.input<typeof rawPageSchema>
export type RawProvider = z.input<typeof rawProviderSchema>
export type RawVideo = z.input<typeof rawVideoSchema>
export type RawMovieDetails = z.input<typeof rawMovieDetailsSchema>
