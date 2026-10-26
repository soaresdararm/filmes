'use client'

import { SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { useUiStore } from '@/store/ui-store'

type FiltersDrawerProps = {
  activeCount: number
  children: ReactNode
}

/** Filtros em gaveta inferior no mobile. No desktop o botão fica oculto e os filtros aparecem inline. */
export function FiltersDrawer({ activeCount, children }: FiltersDrawerProps) {
  const open = useUiStore((state) => state.filtersDrawerOpen)
  const setOpen = useUiStore((state) => state.setFiltersDrawerOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="md:hidden">
          <SlidersHorizontal aria-hidden className="size-4" />
          Filtros
          {activeCount > 0 && <Badge>{activeCount}</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Filtros</DialogTitle>
        <div className="mt-6 grid gap-5">{children}</div>
      </DialogContent>
    </Dialog>
  )
}
