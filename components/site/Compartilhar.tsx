'use client'

import { useState } from 'react'
import { compartilhar as copy, candidata } from '@/content/copy'
import { Secao, CabecalhoSecao } from '@/components/ui/Secao'
import { Botao } from '@/components/ui/Botao'
import { evento } from '@/lib/eventos'

/**
 * A página nasceu como substituta de um PDF. Se ela não circula, falhou.
 * Esta seção é o segundo trabalho da página, na ordem do plano.
 */
export function Compartilhar({ siteUrl }: { siteUrl: string }) {
  const [copiado, setCopiado] = useState(false)
  const texto = `${copy.textoWhatsapp} ${siteUrl}`

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(siteUrl)
    } catch {
      window.prompt('Copie o link:', siteUrl)
    }
    setCopiado(true)
    evento('compartilhou_pagina')
    setTimeout(() => setCopiado(false), 2600)
  }

  async function compartilharNativo() {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    if (!nav.share) return copiarLink()
    try {
      await nav.share({ title: candidata.nome, text: copy.textoWhatsapp, url: siteUrl })
      evento('compartilhou_pagina')
    } catch {
      /* pessoa cancelou */
    }
  }

  return (
    <Secao id="compartilhar" fundo="branco">
      <div className="rounded-[2rem] bg-verde-suave p-8 md:p-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <CabecalhoSecao etiqueta={copy.etiqueta} titulo={copy.titulo} intro={copy.intro} />

          <div data-revelar className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => evento('compartilhou_pagina')}
              className="inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full bg-verde px-8 text-lg font-semibold text-white shadow-media transition-all duration-300 hover:brightness-110"
            >
              <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden>
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm4.52 12a9 9 0 0 1-.47-.19c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.65-1.23-1.46-1.38-1.71-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.71 2.61 4.15 3.66.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18Z" />
              </svg>
              {copy.botaoWhatsapp}
            </a>

            <Botao variante="claro" tamanho="lg" onClick={compartilharNativo}>
              {copiado ? copy.copiado : copy.botaoCopiar}
            </Botao>
          </div>
        </div>
      </div>
    </Secao>
  )
}
