import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'rounded-md bg-accent text-white hover:bg-accent/90',
        outline: 'rounded-md border border-white/15 bg-transparent hover:bg-white/5',
        ghost: 'rounded-md hover:bg-white/10',
        chip: 'rounded-full border border-white/15 bg-surface text-muted hover:text-foreground aria-pressed:border-accent aria-pressed:bg-accent/15 aria-pressed:text-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        icon: 'size-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'md' },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button'
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
