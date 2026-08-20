'use client'

import { useActionState } from 'react'
import type { Versao } from '@/lib/conteudo/historico'
import type { SecaoEsquema } from '@/content/esquema'
import { restaurarVersao, type EstadoConteudo } from '../acoes-conteudo'

export function Historico({
  secao,
  esquema,
  versoes,
}: {
  secao: string
  esquema: SecaoEsquema
  versoes: Versao[]
}) {
  const [estado, acao, pendente] = useActionState<EstadoConteudo, FormData>(
    restaurarVersao,
    null,
  )

  if (versoes.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-linha px-5 py-8 text-center text-grafite">
        Esta seção ainda não foi editada. Quando for, cada salvamento aparece aqui.
      </p>
    )
  }

  const rotuloCampo = (chave: string) => esquema.campos[chave]
    ? ('rotulo' in esquema.campos[chave] ? esquema.campos[chave].rotulo : chave)
    : chave

  return (
    <div className="space-y-3">
      {estado?.erro ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-900">
          {estado.erro}
        </p>
      ) : null}
      {estado?.ok ? (
        <p className="rounded-xl bg-verde-suave px-4 py-3 text-sm text-verde">
          Versão restaurada. O site já mostra este texto.
        </p>
      ) : null}

      {versoes.map((v, i) => (
        <div
          key={v.versao}
          className="rounded-2xl border border-linha bg-white p-5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="font-medium">
                Versão {v.versao}
                {i === 0 ? (
                  <span className="ml-2 rounded-full bg-verde-suave px-2.5 py-0.5 text-xs font-medium text-verde">
                    no ar
                  </span>
                ) : null}
              </span>
              <p className="mt-0.5 text-sm text-grafite">
                {new Date(v.criadoEm).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {v.autor ? ` · ${v.autor}` : ''}
              </p>
            </div>

            {i > 0 ? (
              <form action={acao}>
                <input type="hidden" name="secao" value={secao} />
                <input type="hidden" name="versao" value={v.versao} />
                <button
                  type="submit"
                  disabled={pendente}
                  className="inline-flex min-h-10 items-center rounded-full border border-linha px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul disabled:opacity-40"
                >
                  Restaurar
                </button>
              </form>
            ) : null}
          </div>

          {v.mudou.length > 0 ? (
            <p className="mt-3 flex flex-wrap gap-1.5">
              {v.mudou.map((c) => (
                <span key={c} className="rounded-full bg-areia px-2.5 py-0.5 text-xs text-grafite">
                  {rotuloCampo(c)}
                </span>
              ))}
            </p>
          ) : (
            <p className="mt-3 text-sm text-grafite">Voltou ao texto original.</p>
          )}
        </div>
      ))}
    </div>
  )
}
