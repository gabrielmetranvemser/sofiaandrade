'use client'

import { useEffect, useState } from 'react'
import { filtro as copy } from '@/content/copy'
import { abrirNoNavegador, detectarWebview, instrucaoSairDoWebview, type Webview } from '@/lib/navegador'

/**
 * SEÇÃO 4 DO PLANO — a armadilha do Instagram.
 *
 * O tráfego vem da bio do Instagram. Quem clica ali abre o webview
 * interno do app, onde `<a download>` frequentemente não faz nada.
 * A pessoa faz o filtro, aperta baixar, não acontece nada, e desiste.
 * É o bug que mata a funcionalidade sem ninguém reportar.
 *
 * Uma faixa, sem drama, sem modal gigante.
 */
export function AvisoWebview() {
  const [webview, setWebview] = useState<Webview>(null)
  const [instrucao, setInstrucao] = useState('')

  useEffect(() => {
    const w = detectarWebview()
    setWebview(w)
    setInstrucao(instrucaoSairDoWebview(w))
  }, [])

  if (!webview) return null

  return (
    <div className="border-b border-amarelo/30 bg-amarelo-suave">
      <div className="container-lp flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-start gap-2.5 text-base text-marinho">
          <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-amarelo" fill="currentColor" aria-hidden>
            <path d="M12 2 1 21h22L12 2Zm0 5 7.5 12.9h-15L12 7Zm-1 4v5h2v-5h-2Zm0 6v2h2v-2h-2Z" />
          </svg>
          <span>
            <strong className="font-semibold">{copy.avisoInstagram}</strong>
            {instrucao ? <span className="block text-grafite">{instrucao}</span> : null}
          </span>
        </p>

        <button
          type="button"
          onClick={() => abrirNoNavegador(window.location.href)}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-marinho px-6 font-semibold text-white transition-colors hover:bg-azul"
        >
          {copy.avisoInstagramBotao}
          <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
            <path d="M14 3v2h3.6l-8.3 8.3 1.4 1.4L19 6.4V10h2V3h-7ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
