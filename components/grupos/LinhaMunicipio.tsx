'use client'

import { grupos as copy } from '@/content/copy'
import { evento, idSessao } from '@/lib/eventos'
import type { MunicipioComGrupo, OrigemClique } from '@/lib/tipos'

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
 */
export function LinhaMunicipio({
  municipio,
  origem,
  className = '',
}: {
  municipio: MunicipioComGrupo
  origem: OrigemClique
  /** classes aplicadas no <li>, para a grade desenhar as separações */
  className?: string
}) {
  const { status, disponivel } = municipio

  const selo =
    status === 'aberto'
      ? { texto: copy.aberto, classe: 'bg-verde-suave text-verde' }
      : status === 'cheio'
        ? { texto: copy.cheio, classe: 'bg-azul-suave text-azul' }
        : { texto: copy.emBreve, classe: 'bg-areia text-grafite' }

  const conteudo = (
    <>
      <span className="min-w-0 flex-1 truncate font-medium">{municipio.nome}</span>
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
            evento('entrou_grupo_indisponivel', { municipio_slug: municipio.slug, origem })
          }
          aria-label={`${municipio.nome} — ${selo.texto}`}
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
        href={`/g/${municipio.slug}?de=${origem}&s=${idSessao()}`}
        className={`${base} hover:bg-azul-suave`}
      >
        {conteudo}
      </a>
    </li>
  )
}
