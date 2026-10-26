import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold',
  {
    variants: {
      variant: {
        default: 'bg-white/10 text-foreground',
        rating: 'bg-black/70 text-amber-400 backdrop-blur-sm',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
