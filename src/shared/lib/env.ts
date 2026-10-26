import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  TMDB_READ_TOKEN: z
    .string({
      error: 'TMDB_READ_TOKEN ausente: copie .env.example para .env.local',
    })
    .min(1, 'TMDB_READ_TOKEN ausente: copie .env.example para .env.local'),
})

export type Env = z.infer<typeof envSchema>

export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source)
  if (!result.success) {
    throw new Error(
      result.error.issues.map((issue) => issue.message).join('; '),
    )
  }
  return { TMDB_READ_TOKEN: result.data.TMDB_READ_TOKEN }
}

export const env = parseEnv(process.env)
