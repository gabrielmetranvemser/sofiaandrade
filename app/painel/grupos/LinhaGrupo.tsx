'use client'

import { useActionState, useState } from 'react'
import type { Grupo, StatusGrupo } from '@/lib/tipos'
import { fixarGrupo, salvarGrupo, type EstadoAcao } from '../acoes'

const STATUS: { valor: StatusGrupo; rotulo: string }[] = [
  { valor: 'em_breve', rotulo: 'Em breve' },
  { valor: 'aberto', rotulo: 'Aberto' },
  { valor: 'cheio', rotulo: 'Cheio' },
  { valor: 'desativado', rotulo: 'Desativado' },
]

const PREFIXO = 'https://chat.whatsapp.com/'

export function LinhaGrupo({
  grupo,
  editavel,
  municipioNome,
}: {
  grupo: Grupo
  editavel: boolean
  municipioNome: string
}) {
  const [estado, acao, pendente] = useActionState<EstadoAcao, FormData>(salvarGrupo, null)
  const [, acaoFixar] = useActionState<EstadoAcao, FormData>(fixarGrupo, null)
  const [link, setLink] = useState(grupo.link ?? '')

  // Validação ao colar: avisa na hora, não depois de salvar.
  const linkInvalido = link.length > 0 && !link.startsWith(PREFIXO)

  const pct =
    grupo.limite_cliques && grupo.limite_cliques > 0
      ? Math.min(100, Math.round((grupo.cliques / grupo.limite_cliques) * 100))
      : null

  return (
    <form
      action={acao}
      className="rounded-xl border border-linha bg-areia p-4"
      data-linha-grupo
      data-municipio={municipioNome}
      data-slug={grupo.municipio_slug}
      data-ordem={grupo.ordem}
      data-status={grupo.status}
      data-fixado={grupo.fixado ? 'sim' : 'nao'}
      data-link={grupo.link ?? ''}
      data-cliques={grupo.cliques}
      data-limite={grupo.limite_cliques ?? ''}
    >
      <input type="hidden" name="id" value={grupo.id} />

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold tabular-nums">
          {grupo.ordem}
        </span>

        {grupo.fixado ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-azul-suave px-3 py-1 text-xs font-semibold text-azul">
            Fixado
          </span>
        ) : (
          <button
            type="submit"
            formAction={acaoFixar}
            name="municipio_slug"
            value={grupo.municipio_slug}
            disabled={!editavel}
            className="rounded-full border border-linha bg-white px-3 py-1 text-xs font-medium transition-colors hover:border-azul/30 hover:text-azul disabled:opacity-40"
          >
            Fixar este
          </button>
        )}

        <span className="ml-auto text-sm text-grafite tabular-nums">
          {grupo.cliques} cliques
          {grupo.limite_cliques ? ` de ${grupo.limite_cliques}` : ''}
          {pct !== null ? ` · ${pct}%` : ''}
        </span>
      </div>

      {pct !== null ? (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-red-500' : 'bg-verde'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_10rem_9rem]">
        <div>
          <label htmlFor={`link-${grupo.id}`} className="text-sm font-medium">
            Link do grupo
          </label>
          <input
            id={`link-${grupo.id}`}
            name="link"
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            disabled={!editavel}
            placeholder={`${PREFIXO}…`}
            aria-invalid={linkInvalido}
            className={`mt-1 min-h-11 w-full rounded-lg border bg-white px-3 text-sm transition-colors disabled:opacity-60 ${
              linkInvalido ? 'border-red-400' : 'border-linha focus:border-azul/40'
            }`}
          />
          {linkInvalido ? (
            <p className="mt-1 text-xs text-red-700">O link precisa começar com {PREFIXO}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor={`status-${grupo.id}`} className="text-sm font-medium">
            Situação
          </label>
          <select
            id={`status-${grupo.id}`}
            name="status"
            defaultValue={grupo.status}
            disabled={!editavel}
            className="mt-1 min-h-11 w-full rounded-lg border border-linha bg-white px-3 text-sm disabled:opacity-60"
          >
            {STATUS.map((s) => (
              <option key={s.valor} value={s.valor}>
                {s.rotulo}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`limite-${grupo.id}`} className="text-sm font-medium">
            Limite
          </label>
          <input
            id={`limite-${grupo.id}`}
            name="limite_cliques"
            type="number"
            min={1}
            defaultValue={grupo.limite_cliques ?? ''}
            disabled={!editavel}
            className="mt-1 min-h-11 w-full rounded-lg border border-linha bg-white px-3 text-sm tabular-nums disabled:opacity-60"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          name="observacao"
          defaultValue={grupo.observacao ?? ''}
          disabled={!editavel}
          placeholder="Observação (opcional)"
          className="min-h-11 flex-1 rounded-lg border border-linha bg-white px-3 text-sm disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!editavel || pendente || linkInvalido}
          className="inline-flex min-h-11 items-center rounded-full bg-azul px-6 text-sm font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-40"
        >
          {pendente ? 'Salvando…' : 'Salvar'}
        </button>

        {grupo.link ? (
          <a
            href={grupo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-azul underline decoration-1 underline-offset-[6px]"
          >
            Abrir grupo
          </a>
        ) : null}
      </div>

      {estado?.erro ? (
        <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900">
          {estado.erro}
        </p>
      ) : null}
      {estado?.ok ? <p className="mt-3 text-sm text-verde">Salvo.</p> : null}
    </form>
  )
}
