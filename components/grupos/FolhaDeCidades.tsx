'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useConteudo } from '@/lib/conteudo/contexto'
import { buscarMunicipios } from '@/lib/geo'
import { evento } from '@/lib/eventos'
import type { MunicipioComGrupo } from '@/lib/tipos'
import { LinhaMunicipio } from './LinhaMunicipio'

/**
 * A folha de cidades: busca e lista completa na mesma superfície.
 *
 * No celular sobe de baixo, no padrão de bottom sheet; no desktop
 * abre centralizada. É uma superfície só porque o problema é um só:
 * "qual é a minha cidade". Ter busca num lugar e lista em outro fazia
 * a pessoa procurar duas vezes.
 *
 * É um <dialog> nativo, e isso não é preguiça — é o que entrega de
 * graça as três coisas que um modal caseiro erra: o foco fica preso
 * dentro, o Escape fecha, e o resto da página some para o leitor de
 * tela. Escrever isso à mão é onde nascem armadilhas de teclado.
 *
 * ⚠️ A LISTA CONTINUA COMPLETA AQUI DENTRO. O plano original mandou
 *    manter os 52 abertos porque o público é de 35 a 64 anos e não
 *    caça botão escondido. O que foi encolhido é a lista NA PÁGINA,
 *    que tinha 2.900px de altura no celular — e ela só encolheu
 *    porque os dois caminhos prováveis (IP e GPS) mostram a cidade
 *    certa sem nenhum clique. Quem quiser a lista inteira continua a
 *    um toque, e aqui ela abre inteira, sem accordion.
 */
export function FolhaDeCidades({
  municipios,
  aberta,
  onFechar,
}: {
  municipios: MunicipioComGrupo[]
  aberta: boolean
  onFechar: () => void
}) {
  const { grupos: copy } = useConteudo()
  const dialogo = useRef<HTMLDialogElement>(null)
  const campo = useRef<HTMLInputElement>(null)
  const timerBusca = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [termo, setTermo] = useState('')

  const resultados = useMemo(
    () => (termo.trim().length >= 2 ? buscarMunicipios(municipios, termo, 40) : municipios),
    [municipios, termo],
  )
  const buscando = termo.trim().length >= 2

  useEffect(() => {
    const d = dialogo.current
    if (!d) return

    if (aberta && !d.open) {
      // Abre sempre limpa. Guardar a busca anterior faria "Ver todos os
      // municípios" mostrar uma cidade só, com o resto filtrado por um
      // termo que a pessoa nem lembra ter digitado.
      setTermo('')
      d.showModal()
      // O <dialog> prende o foco, mas não trava a rolagem de trás: sem
      // isto, rolar dentro da folha arrasta a página no fim da lista.
      document.body.style.overflow = 'hidden'
      // Autofocus no campo só onde há teclado físico. No celular, abrir
      // o teclado por cima da folha esconde a lista inteira antes de a
      // pessoa ter visto que ela existe.
      if (window.matchMedia('(pointer: fine)').matches) campo.current?.focus()
    }

    if (!aberta && d.open) d.close()
  }, [aberta])

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Uma pessoa digitando "Ji-Paraná" não deve gerar oito eventos.
  useEffect(() => {
    if (termo.trim().length < 3) return
    if (timerBusca.current) clearTimeout(timerBusca.current)
    timerBusca.current = setTimeout(() => evento('buscou_cidade'), 900)
    return () => {
      if (timerBusca.current) clearTimeout(timerBusca.current)
    }
  }, [termo])

  function fechar() {
    document.body.style.overflow = ''
    onFechar()
  }

  const abertos = municipios.filter((m) => m.disponivel).length

  return (
    <dialog
      ref={dialogo}
      onClose={fechar}
      // Clique no fundo fecha. O alvo é o próprio <dialog> só quando o
      // clique cai fora da caixa — os filhos param o evento neles.
      onClick={(e) => {
        if (e.target === dialogo.current) fechar()
      }}
      aria-label={copy.folhaTitulo}
      className="folha"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-linha px-5 pt-4 pb-4 md:px-6">
          {/* A alcinha do bottom sheet. Só decoração: quem fecha é o
              botão, o Escape e o toque no fundo. */}
          <span aria-hidden className="mx-auto mb-3 block h-1 w-10 rounded-full bg-linha md:hidden" />

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl">{copy.folhaTitulo}</h2>
            <button
              type="button"
              onClick={fechar}
              className="toque -mr-2 inline-flex size-11 items-center justify-center rounded-full text-grafite transition-colors hover:bg-areia hover:text-tinta"
              aria-label={copy.folhaFechar}
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="relative mt-3">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-grafite"
              fill="currentColor"
              aria-hidden
            >
              <path d="M10 2a8 8 0 1 0 4.9 14.3l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0 0 10 2Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
            </svg>
            <input
              ref={campo}
              type="search"
              inputMode="search"
              autoComplete="off"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder={copy.placeholderBusca}
              aria-label={copy.rotuloBusca}
              className="min-h-14 w-full rounded-full border border-linha bg-areia pr-4 pl-11 text-lg transition-colors placeholder:text-grafite/60 focus:border-azul/40 focus:bg-white"
            />
          </div>

          <p className="mt-2.5 text-sm text-grafite">
            {buscando ? (
              `${resultados.length} ${resultados.length === 1 ? 'cidade' : 'cidades'}`
            ) : (
              <>
                <strong className="font-semibold text-verde">{abertos}</strong> {copy.abertos} ·{' '}
                {municipios.length} municípios
              </>
            )}
          </p>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2" role="region" aria-live="polite">
          {resultados.length > 0 ? (
            <ul className="grid gap-1 md:grid-cols-2">
              {resultados.map((m) => (
                <LinhaMunicipio
                  key={m.slug}
                  municipio={m}
                  origem={buscando ? 'busca' : 'lista'}
                />
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-grafite">{copy.vazio}</p>
          )}
        </div>
      </div>
    </dialog>
  )
}
