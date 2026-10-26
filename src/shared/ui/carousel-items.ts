// Fora de carousel.tsx: valores exportados de um módulo "use client" não chegam a Server Components.
/** Larguras dos itens: quantos cabem por tela, com uma sobra que convida a rolar. */
export const carouselItemClass = {
  landscape:
    'w-[44%] shrink-0 snap-start sm:w-[31.5%] md:w-[23.8%] xl:w-[19%] 2xl:w-[15.8%]',
  portrait:
    'w-[40%] shrink-0 snap-start sm:w-[26%] md:w-[19.4%] lg:w-[15.5%] xl:w-[13.2%]',
  ranked:
    'w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[23%] lg:w-[18.2%] xl:w-[15%]',
} as const
