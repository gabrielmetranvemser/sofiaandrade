'use client'

import { useConteudo } from '@/lib/conteudo/contexto'
import { caminhoDoGrupo, useSessao } from '@/lib/eventos'
import type { Destino, OrigemClique } from '@/lib/tipos'

/**
 * O card da cidade, no topo da seção de grupos.
 *
 * Sem pop-up, sem modal — o plano é explícito: "abre um card, sem
 * pop-up nenhum".
 *
 * ⚠️ SERVE DOIS ESTADOS QUE SE PARECEM E NÃO SÃO A MESMA COISA.
 *
 *    `sugestao` é um PALPITE nosso: veio do IP ou do GPS, e pode estar
 *    errado. Por isso ele pergunta — "Você está em Vilhena?" — e a
 *    recusa é discreta.
 *
 *    `anuncio` é um FATO que a própria pessoa trouxe: ela clicou num
 *    anúncio de Vilhena, e a cidade veio escrita no link. Perguntar de
 *    novo aqui seria devolver a ela uma pergunta que ela já respondeu
 *    do outro lado — e cada pergunta a mais nesta altura é gente que
 *    fecha a aba. Então o card afirma, e a saída ("Sou de outra
 *    cidade") abre a lista inteira em vez de sumir com o card.
 *
 * Aceita `Destino` e não `MunicipioComGrupo` porque distrito com grupo
 * próprio — Iata, Rio Pardo — também pode ser destino de anúncio.
 */
export function CardCidadeSugerida({
  municipio,
  origem,
  distanciaKm,
  modo = 'sugestao',
  onNaoEMinha,
}: {
  municipio: Destino
  origem: OrigemClique
  distanciaKm?: number
  modo?: 'sugestao' | 'anuncio'
  onNaoEMinha: () => void
}) {
  const { grupos: copy, ctas } = useConteudo()
  const sessao = useSessao()
  const longe = typeof distanciaKm === 'number' && distanciaKm > 60
  const doAnuncio = modo === 'anuncio'

  return (
    <div className="rounded-2xl fundo-azul-profundo p-6 text-white md:p-7">
      <p className="flex items-center gap-2 text-sm font-medium text-amarelo">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
        {doAnuncio ? copy.anuncioTitulo : copy.sugestaoTitulo}
      </p>

      {/* A interrogação é do palpite. No card do anúncio ela viraria
          dúvida onde não há nenhuma. */}
      <p className="mt-2 font-[family-name:var(--font-titulo)] text-2xl font-bold tracking-[-0.025em] md:text-3xl">
        {municipio.nome}
        {doAnuncio ? '' : '?'}
      </p>

      <p className="mt-2 text-base text-white/75">
        {doAnuncio ? copy.anuncioTexto : longe ? copy.sugestaoLonge : copy.sugestaoPergunta}
        {/* A distância vai num selo próprio, e não dentro da frase:
            número no meio de texto editável obrigaria um token, e a
            lista de tokens é fechada de propósito. */}
        {typeof distanciaKm === 'number' ? (
          <span className="ml-2 inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-sm font-medium text-white tabular-nums">
            {distanciaKm < 10 ? distanciaKm.toFixed(1) : Math.round(distanciaKm)} km
          </span>
        ) : null}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {municipio.disponivel ? (
          <a
            href={caminhoDoGrupo(municipio.slug, origem, sessao)}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-amarelo px-7 py-3.5 text-center font-semibold text-azul-escuro shadow-media transition-all hover:brightness-105"
          >
            {doAnuncio ? `${ctas.grupoDe} ${municipio.nome}` : copy.sugestaoSim}
          </a>
        ) : (
          <span className="inline-flex min-h-13 items-center justify-center rounded-full bg-white/15 px-7 py-3.5 font-medium text-white/80 ring-1 ring-white/25">
            {municipio.status === 'cheio' ? copy.cheio : copy.emBreve}
          </span>
        )}

        <button
          type="button"
          onClick={onNaoEMinha}
          className="min-h-12 text-left text-base text-white/75 underline decoration-1 underline-offset-[6px] transition-colors hover:text-amarelo"
        >
          {doAnuncio ? copy.anuncioOutra : copy.sugestaoNao}
        </button>
      </div>
    </div>
  )
}
