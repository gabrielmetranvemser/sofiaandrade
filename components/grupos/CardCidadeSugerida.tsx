'use client'

import { grupos as copy } from '@/content/copy'
import { idSessao } from '@/lib/eventos'
import type { MunicipioComGrupo, OrigemClique } from '@/lib/tipos'

/**
 * O card da sugestão. Sem pop-up, sem modal — o plano é explícito:
 * "abre um card, sem pop-up nenhum".
 */
export function CardCidadeSugerida({
  municipio,
  origem,
  distanciaKm,
  onNaoEMinha,
}: {
  municipio: MunicipioComGrupo
  origem: OrigemClique
  distanciaKm?: number
  onNaoEMinha: () => void
}) {
  const longe = typeof distanciaKm === 'number' && distanciaKm > 60

  return (
    <div className="rounded-2xl border border-azul/15 bg-azul-suave p-6 md:p-7">
      <p className="flex items-center gap-2 text-sm font-medium text-azul">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
        </svg>
        {copy.sugestaoTitulo}
      </p>

      <p className="mt-2 font-[family-name:var(--font-titulo)] text-2xl font-bold tracking-[-0.025em] md:text-3xl">
        {municipio.nome}?
      </p>

      <p className="mt-2 text-base text-grafite">
        {longe
          ? `A sede mais próxima fica a cerca de ${Math.round(distanciaKm!)} km. Confira se é a sua cidade.`
          : copy.sugestaoPergunta}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {municipio.disponivel ? (
          <a
            href={`/g/${municipio.slug}?de=${origem}&s=${idSessao()}`}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-azul px-7 py-3.5 font-semibold text-white shadow-suave transition-colors hover:bg-marinho"
          >
            Sim, entrar no grupo
          </a>
        ) : (
          <span className="inline-flex min-h-13 items-center justify-center rounded-full bg-white px-7 py-3.5 font-medium text-grafite">
            {municipio.status === 'cheio' ? copy.cheio : copy.emBreve}
          </span>
        )}

        <button
          type="button"
          onClick={onNaoEMinha}
          className="min-h-12 text-left text-base text-grafite underline decoration-1 underline-offset-[6px] transition-colors hover:text-azul"
        >
          {copy.sugestaoNao}
        </button>
      </div>
    </div>
  )
}
