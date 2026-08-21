'use client'

import { useActionState, useEffect } from 'react'
import type { Campo } from '@/content/esquema'
import { salvarSecao, restaurarPadrao, type EstadoConteudo } from '../acoes-conteudo'
import { CampoDinamico } from './CampoDinamico'

/**
 * O formulário de uma seção — textos e vídeos.
 *
 * O estado é a seção INTEIRA num objeto, endereçada por caminho
 * ("itens.2.titulo"). No submit vai um JSON só, num input escondido —
 * o que preserva a assinatura `(estado, FormData)` que o projeto já usa
 * com useActionState.
 *
 * ⚠️ O ESTADO MORA NO PAI, e não aqui, desde que a prévia existe. A
 *    maquete ao lado precisa do mesmo rascunho que os campos, atualizado
 *    à mesma tecla. Dois estados sincronizados por efeito seria a versão
 *    frágil da mesma coisa.
 *
 * ⚠️ AS DUAS ABAS SÃO UM FORMULÁRIO SÓ, e isso não é detalhe de
 *    implementação: texto e vídeo da mesma seção moram no MESMO
 *    registro do banco. Se fossem dois formulários, salvar um
 *    sobrescreveria o rascunho não salvo do outro — e a pessoa
 *    perderia trabalho sem receber nenhum aviso.
 *
 *    Por isso a aba inativa é escondida com CSS, e não desmontada: o
 *    estado é um só, o botão de salvar é um só, e trocar de aba nunca
 *    apaga o que foi digitado na outra.
 *
 * Custo consciente: sem JavaScript o formulário não funciona. É um
 * painel de duas ou três pessoas; registro a escolha em vez de fingir
 * que não existe.
 */
export function FormularioSecao({
  secao,
  camposDeTexto,
  camposDeVideo,
  dados,
  onMudar,
  baseHash,
  editavel,
  aba,
  aoSalvar,
}: {
  secao: string
  camposDeTexto: [string, Campo][]
  camposDeVideo: [string, Campo][]
  dados: Record<string, unknown>
  onMudar: (caminho: string, valor: unknown) => void
  baseHash: string
  editavel: boolean
  aba: 'textos' | 'videos'
  /** Avisa o pai que o site mudou — é o que recarrega a prévia. */
  aoSalvar?: () => void
}) {
  const [estado, acao, pendente] = useActionState<EstadoConteudo, FormData>(salvarSecao, null)
  const [, acaoRestaurar, restaurando] = useActionState<EstadoConteudo, FormData>(
    restaurarPadrao,
    null,
  )

  const erros = estado?.erros ?? {}

  // O `salvoEm` muda a cada gravação, inclusive quando duas seguidas
  // gravam o mesmo valor — `ok: true` sozinho não dispararia a segunda.
  useEffect(() => {
    if (estado?.ok) aoSalvar?.()
  }, [estado?.ok, estado?.salvoEm, aoSalvar])

  const grupo = (lista: [string, Campo][]) => (
    <div className="space-y-5">
      {lista.map(([chave, campo]) => (
        <CampoDinamico
          key={chave}
          campo={campo}
          valor={dados[chave]}
          caminho={chave}
          erros={erros}
          onMudar={onMudar}
        />
      ))}
    </div>
  )

  return (
    <form action={acao}>
      <input type="hidden" name="secao" value={secao} />
      <input type="hidden" name="baseHash" value={baseHash} />
      <input type="hidden" name="dados" value={JSON.stringify(dados)} />

      <div className={aba === 'textos' ? undefined : 'hidden'}>
        {camposDeTexto.length > 0 ? (
          grupo(camposDeTexto)
        ) : (
          <Vazio>Esta seção não tem texto editável — só vídeos.</Vazio>
        )}
      </div>

      <div className={aba === 'videos' ? undefined : 'hidden'}>
        {camposDeVideo.length > 0 ? (
          grupo(camposDeVideo)
        ) : (
          <Vazio>Esta seção não tem espaço de vídeo.</Vazio>
        )}
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
            Voltar ao original
          </button>

          {estado?.ok ? <span className="text-sm font-medium text-verde">Salvo.</span> : null}
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

function Vazio({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-linha bg-white px-5 py-8 text-center text-sm text-grafite">
      {children}
    </p>
  )
}
