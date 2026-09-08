'use client'

import { createContext, useContext } from 'react'
import { caminhoDoGrupo, useSessao } from '@/lib/eventos'
import type { Destino, OrigemClique } from '@/lib/tipos'

/**
 * A CIDADE DO ANÚNCIO, DISPONÍVEL PARA TODO BOTÃO DA PÁGINA.
 *
 * ⚠️ ESTE CONTEXTO EXISTE PARA UMA COISA SÓ: quando o anúncio prometeu
 *    "grupo de Porto Velho", TODO botão de grupo da página tem de
 *    entregar o grupo de Porto Velho — do cabeçalho ao rodapé, sem a
 *    pessoa precisar rolar até a lista e se procurar entre 52 nomes.
 *
 *    Sem isto, o caminho seria: clica no anúncio de Porto Velho → cai
 *    na página → aperta "Entrar no grupo" → a página rola até a lista →
 *    procura Porto Velho → clica de novo. São dois toques e uma busca a
 *    mais depois de a pessoa JÁ ter dito qual é a cidade dela. Cada
 *    etapa dessas é gente que desiste no meio, e é gente que a campanha
 *    pagou para chegar ali.
 *
 * ⚠️ DEVOLVE `null` EM VEZ DE LANÇAR, ao contrário de `useConteudo`. A
 *    ausência de cidade-alvo é o estado NORMAL: é assim em toda visita
 *    orgânica, que é a maioria. Um erro aqui derrubaria a página para
 *    quem chegou pelo Instagram.
 */
const Contexto = createContext<Destino | null>(null)

export function CidadeAlvoProvider({
  valor,
  children,
}: {
  valor: Destino | null
  children: React.ReactNode
}) {
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useCidadeAlvo(): Destino | null {
  return useContext(Contexto)
}

/**
 * Para onde este CTA de grupo deve apontar.
 *
 * Com cidade-alvo aberta, vira o redirecionador dela. Sem ela — ou com
 * o grupo cheio, ou ainda fechado — devolve o destino de sempre, que é
 * a lista. Mandar alguém para um `/g/` de grupo fechado seria trocar um
 * caminho que funciona por um beco com mensagem de erro.
 */
export function useDestinoDoGrupo(
  origem: OrigemClique,
  padrao: string,
): { href: string; direto: boolean } {
  const alvo = useCidadeAlvo()
  const sessao = useSessao()

  if (!alvo?.disponivel) return { href: padrao, direto: false }
  return { href: caminhoDoGrupo(alvo.slug, origem, sessao), direto: true }
}
