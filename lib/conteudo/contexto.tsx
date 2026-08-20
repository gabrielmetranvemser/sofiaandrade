'use client'

import { createContext, useContext } from 'react'
import type { ConteudoCliente } from './recorte'

export type { ConteudoCliente }

const Contexto = createContext<ConteudoCliente | null>(null)

export function ConteudoProvider({
  valor,
  children,
}: {
  valor: ConteudoCliente
  children: React.ReactNode
}) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

/**
 * Lê o conteúdo dentro de um Client Component.
 *
 * Lança se o provider não estiver acima — sem isso, um componente
 * renderizado fora da árvore do layout mostraria `undefined` em silêncio
 * no lugar do texto, e isso passaria despercebido até a produção.
 */
export function useConteudo(): ConteudoCliente {
  const valor = useContext(Contexto)
  if (!valor) {
    throw new Error(
      'useConteudo() foi chamado fora do <ConteudoProvider>. ' +
        'Ele é montado em app/layout.tsx.',
    )
  }
  return valor
}
