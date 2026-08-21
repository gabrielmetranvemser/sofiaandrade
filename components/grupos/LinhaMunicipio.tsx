'use client'

import { useConteudo } from '@/lib/conteudo/contexto'
import { evento, caminhoDoGrupo, useSessao } from '@/lib/eventos'
import type { Destino, OrigemClique } from '@/lib/tipos'

/**
 * Uma linha da lista. O href aponta sempre para /g/[slug] — nunca
 * para o link do WhatsApp. O link real só existe no servidor.
 *
 * O clique NÃO é gravado aqui: quem grava é a própria rota /g/[slug],
 * no servidor, para não contar duas vezes. O que vai na URL é a origem
 * (`de`) e o id de sessão (`s`), para o servidor conseguir dizer quantas
 * PESSOAS entraram, e não só quantos cliques houve.
 *
 * Município sem grupo aparece desabilitado com selo "em breve".
 * Melhor ver a cidade e entender que ainda não abriu do que não
 * achar e concluir que o site quebrou.
 *
 * Serve município e distrito com a mesma forma: os dois são só nome,
 * slug e estado do grupo. O que distingue é o `dentroDe`, que diz de
 * quem o distrito é vizinho — sem ele, "Iata" numa lista de cidades
 * não diz a ninguém onde fica.
 */
export function LinhaMunicipio({
  destino,
  origem,
  distanciaKm,
  dentroDe,
  className = '',
}: {
  destino: Destino
  origem: OrigemClique
  /** Distância em km, quando a linha vem da lista das mais próximas. */
  distanciaKm?: number
  /** Município que ancora este destino. Só os distritos usam. */
  dentroDe?: string
  /** classes aplicadas no <li>, para a grade desenhar as separações */
  className?: string
}) {
  const { grupos: copy } = useConteudo()
  const sessao = useSessao()
  const { status, disponivel } = destino

  const selo =
    status === 'aberto'
      ? { texto: copy.aberto, classe: 'bg-verde text-white' }
      : status === 'cheio'
        ? { texto: copy.cheio, classe: 'bg-azul-escuro text-white' }
        : { texto: copy.emBreve, classe: 'bg-areia text-grafite ring-1 ring-linha' }

  const conteudo = (
    <>
      <span className="min-w-0 flex-1 truncate">
        <span className="font-medium">{destino.nome}</span>
        {dentroDe ? (
          <span className="ml-1.5 text-sm text-grafite">· {dentroDe}</span>
        ) : null}
      </span>
      {/* A distância só aparece na lista das mais próximas. É o que
          responde "por que esta cidade e não a minha" sem precisar de
          explicação nenhuma. */}
      {typeof distanciaKm === 'number' ? (
        <span className="shrink-0 text-sm text-grafite tabular-nums">
          {distanciaKm < 10 ? distanciaKm.toFixed(1) : Math.round(distanciaKm)} km
        </span>
      ) : null}
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${selo.classe}`}
      >
        {selo.texto}
      </span>
      {disponivel ? (
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-grafite transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-azul"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </>
  )

  const base =
    'group flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-[1.0625rem] transition-colors duration-200'

  if (!disponivel) {
    return (
      <li className={className}>
        <button
          type="button"
          onClick={() =>
            evento('entrou_grupo_indisponivel', {
              municipio_slug: destino.municipioSlug ?? destino.slug,
              origem,
            })
          }
          aria-label={`${destino.nome} — ${selo.texto}`}
          title={copy.avisoEmBreve}
          className={`${base} cursor-default text-grafite hover:bg-areia`}
        >
          {conteudo}
        </button>
      </li>
    )
  }

  return (
    <li className={className}>
      <a
        href={caminhoDoGrupo(destino.slug, origem, sessao)}
        className={`${base} hover:bg-areia`}
      >
        {conteudo}
      </a>
    </li>
  )
}
