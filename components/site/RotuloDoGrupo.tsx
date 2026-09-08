'use client'

import { useConteudo } from '@/lib/conteudo/contexto'
import { useCidadeAlvo } from '@/lib/campanha/contexto'

/**
 * O rótulo de um botão de grupo, com o nome da cidade quando ela veio
 * no link do anúncio.
 *
 * ⚠️ SÓ NOS BOTÕES LARGOS. O anúncio prometeu "grupo de Vilhena" e o
 *    botão precisa repetir a promessa — é o que evita aquele instante
 *    de dúvida entre o que a peça dizia e o que a página oferece. Mas
 *    "Entrar no grupo de Governador Jorge Teixeira" tem 44 caracteres,
 *    e há um botão nesta página, o da faixa da marca no celular, cuja
 *    largura é o que sobra depois do 2233 — uns 180px, com
 *    `whitespace-nowrap` e um comentário explicando que o rótulo ali
 *    não pode virar parágrafo. Naquele, e só naquele, o texto genérico
 *    fica: o destino do toque já é o certo, que é o que decide a
 *    conversão.
 *
 * Sem cidade-alvo devolve o texto de sempre, que é o caso de toda
 * visita orgânica.
 */
export function RotuloDoGrupo({ padrao }: { padrao: string }) {
  const { ctas } = useConteudo()
  const alvo = useCidadeAlvo()

  if (!alvo?.disponivel) return <>{padrao}</>
  return <>{`${ctas.grupoDe} ${alvo.nome}`}</>
}
