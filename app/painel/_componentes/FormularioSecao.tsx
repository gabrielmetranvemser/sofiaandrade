'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import type { SecaoEsquema } from '@/content/esquema'
import { salvarSecao, restaurarPadrao, type EstadoConteudo } from '../acoes-conteudo'
import { CampoDinamico } from './CampoDinamico'

/**
 * O estado é a seção INTEIRA num objeto, endereçada por caminho
 * ("itens.2.titulo"). No submit vai um JSON só, num input escondido —
 * o que preserva a assinatura `(estado, FormData)` que o projeto já usa
 * com useActionState.
 *
 * Custo consciente: sem JavaScript o formulário não funciona. É um
 * painel de duas ou três pessoas; registro a escolha em vez de fingir
 * que não existe.
 */
export function FormularioSecao({
  secao,
  esquema,
  inicial,
  baseHash,
  editavel,
}: {
  secao: string
  esquema: SecaoEsquema
  inicial: Record<string, unknown>
  baseHash: string
  editavel: boolean
}) {
  const [dados, setDados] = useState<Record<string, unknown>>(inicial)
  const [estado, acao, pendente] = useActionState<EstadoConteudo, FormData>(salvarSecao, null)
  const [, acaoRestaurar, restaurando] = useActionState<EstadoConteudo, FormData>(
    restaurarPadrao,
    null,
  )

  const erros = estado?.erros ?? {}

  function mudar(caminho: string, valor: unknown) {
    setDados((atual) => escrever(atual, caminho.split('.'), valor))
  }

  return (
    <form action={acao}>
      <input type="hidden" name="secao" value={secao} />
      <input type="hidden" name="baseHash" value={baseHash} />
      <input type="hidden" name="dados" value={JSON.stringify(dados)} />

      <header className="mb-8">
        <Link
          href="/painel/textos"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-grafite transition-colors hover:text-azul"
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Todos os textos
        </Link>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="titulo-secao">{esquema.rotulo}</h1>
          <Link
            href={`/painel/textos/${secao}/historico`}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-linha bg-white px-4 text-sm font-medium transition-colors hover:border-azul/30 hover:text-azul"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M13 3a9 9 0 1 0 8.5 12h-2.1A7 7 0 1 1 13 5v4l5-5-5-5v4Zm-1 5v5l4 2 .7-1.3L13.5 12V8H12Z" />
            </svg>
            Histórico
          </Link>
        </div>
        {esquema.nota ? (
          <p className="mt-3 max-w-2xl rounded-xl bg-azul-suave px-4 py-3 text-[0.9375rem]">
            {esquema.nota}
          </p>
        ) : null}
      </header>

      <div className="space-y-5">
        {Object.entries(esquema.campos).map(([chave, campo]) => (
          <CampoDinamico
            key={chave}
            campo={campo}
            valor={dados[chave]}
            caminho={chave}
            erros={erros}
            onMudar={mudar}
          />
        ))}
      </div>

      {/* Barra de ação fixa: em seção longa, o botão de salvar não pode
          ficar a dois mil pixels de distância do campo que se editou. */}
      <div
        className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-linha bg-white/95 px-4 py-3 backdrop-blur md:-mx-8 md:px-8"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!editavel || pendente}
            className="inline-flex min-h-11 items-center rounded-full bg-azul px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azul-escuro disabled:opacity-40"
          >
            {pendente ? 'Salvando…' : 'Salvar'}
          </button>

          <button
            type="submit"
            formAction={acaoRestaurar}
            disabled={!editavel || restaurando}
            className="inline-flex min-h-11 items-center rounded-full border border-linha bg-white px-5 text-[0.9375rem] font-medium transition-colors hover:border-azul/30 disabled:opacity-40"
          >
            Voltar ao texto original
          </button>

          {estado?.ok ? (
            <span className="text-sm font-medium text-verde">Salvo.</span>
          ) : null}
          {estado?.erro ? (
            <span role="alert" className="text-sm font-medium text-red-600">
              {estado.erro}
            </span>
          ) : null}
        </div>
      </div>
    </form>
  )
}

/** Escreve num caminho aninhado sem mutar o original. */
function escrever(
  alvo: Record<string, unknown>,
  caminho: string[],
  valor: unknown,
): Record<string, unknown> {
  const [chave, ...resto] = caminho
  if (resto.length === 0) return { ...alvo, [chave]: valor }

  const atual = alvo[chave]
  if (Array.isArray(atual)) {
    const i = Number(resto[0])
    const copia = [...atual]
    copia[i] = escrever((copia[i] ?? {}) as Record<string, unknown>, resto.slice(1), valor)
    return { ...alvo, [chave]: copia }
  }
  return {
    ...alvo,
    [chave]: escrever((atual ?? {}) as Record<string, unknown>, resto, valor),
  }
}
